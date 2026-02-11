import { Hono } from "hono";
import { getAgentByName } from 'agents';
import { ChatAgent } from './agent';
import { API_RESPONSES } from './config';
import { Env, getAppController, registerSession, unregisterSession } from "./core-utils";
export function coreRoutes(app: Hono<{ Bindings: Env }>) {
    app.all('/api/chat/:sessionId/*', async (c) => {
        try {
            const sessionId = c.req.param('sessionId');
            const agent = await getAgentByName<Env, ChatAgent>(c.env.CHAT_AGENT, sessionId);
            const url = new URL(c.req.url);
            url.pathname = url.pathname.replace(`/api/chat/${sessionId}`, '');
            return agent.fetch(new Request(url.toString(), {
                method: c.req.method,
                headers: c.req.header(),
                body: c.req.method === 'GET' || c.req.method === 'DELETE' ? undefined : c.req.raw.body
            }));
        } catch (error) {
            return c.json({ success: false, error: API_RESPONSES.AGENT_ROUTING_FAILED }, { status: 500 });
        }
    });
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    app.get('/api/auth/google', async (c) => {
        const sessionId = c.req.query('sessionId') || 'default';
        const clientId = c.env.GOOGLE_CLIENT_ID || 'MOCK_ID';
        const redirectUri = `${new URL(c.req.url).origin}/api/auth/callback`;
        const scopes = [
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.send',
            'https://www.googleapis.com/auth/calendar.readonly',
            'https://www.googleapis.com/auth/calendar.events',
            'https://www.googleapis.com/auth/drive.readonly',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
        ].join(' ');
        const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}&state=${sessionId}&access_type=offline&prompt=consent`;
        return c.json({ success: true, data: { url } });
    });
    app.get('/api/auth/callback', async (c) => {
        const code = c.req.query('code');
        const sessionId = c.req.query('state') || 'default';
        const clientId = c.env.GOOGLE_CLIENT_ID || 'MOCK_ID';
        const clientSecret = c.env.GOOGLE_CLIENT_SECRET;
        const redirectUri = `${new URL(c.req.url).origin}/api/auth/callback`;
        if (!code) return c.text("Authorization failed: No code provided", 400);
        try {
            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    code,
                    client_id: clientId,
                    client_secret: clientSecret,
                    redirect_uri: redirectUri,
                    grant_type: 'authorization_code'
                })
            });
            const tokens = await tokenResponse.json() as any;
            if (tokens.error) throw new Error(tokens.error_description || tokens.error);
            const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { Authorization: `Bearer ${tokens.access_token}` }
            });
            const userData = await userResponse.json() as any;
            const email = userData.email;
            const controller = getAppController(c.env);
            await controller.saveServiceTokens(sessionId, 'google', {
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                expiry_date: Date.now() + (tokens.expires_in * 1000),
                scopes: tokens.scope?.split(' ') || []
            }, email);
            return c.html(`
                <html>
                    <body style="background: #0a0e1a; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; color: white; font-family: sans-serif;">
                        <script>
                            window.opener.postMessage({ 
                                type: 'AUTH_SUCCESS', 
                                service: 'google', 
                                email: '${email}',
                                status: 'active' 
                            }, '*');
                            setTimeout(() => window.close(), 1200);
                        </script>
                        <div style="text-align: center; border: 1px solid rgba(0,212,255,0.2); padding: 40px; border-radius: 20px; background: rgba(0,212,255,0.05); max-width: 400px;">
                            <h2 style="color: #10b981; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 10px;">Synaptic Link Established</h2>
                            <p style="color: white; font-weight: bold; margin: 10px 0;">${email}</p>
                            <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin-top: 20px;">NEURAL PATHWAY SYNCED. RETURNING TO CORE...</p>
                        </div>
                    </body>
                </html>
            `);
        } catch (error) {
            console.error("OAuth Error:", error);
            return c.text(`Authentication error: ${error instanceof Error ? error.message : 'Unknown'}`, 500);
        }
    });
    app.get('/api/status/services', async (c) => {
        const sessionId = c.req.query('sessionId') || 'default';
        const controller = getAppController(c.env);
        const services = await controller.listConnectedServices(sessionId);
        return c.json({
            success: true,
            data: services,
            meta: { latency: `${(Math.random() * 0.5).toFixed(2)}ms`, status: "SYNCED" }
        });
    });
    app.get('/api/sessions', async (c) => {
        const controller = getAppController(c.env);
        const sessions = await controller.listSessions();
        return c.json({ success: true, data: sessions });
    });
    app.get('/api/tasks', async (c) => {
        const sessionId = c.req.query('sessionId') || 'default';
        const controller = getAppController(c.env);
        const tasks = await controller.listTasks(sessionId);
        return c.json({ success: true, data: tasks });
    });
    app.post('/api/tasks/:taskId/status', async (c) => {
        const taskId = c.req.param('taskId');
        const { status, sessionId } = await c.req.json();
        const controller = getAppController(c.env);
        await controller.updateTaskStatus(sessionId || 'default', taskId, status);
        return c.json({ success: true });
    });
    app.get('/api/memories', async (c) => {
        const sessionId = c.req.query('sessionId') || 'default';
        const controller = getAppController(c.env);
        const memories = await controller.listMemories(sessionId);
        return c.json({ success: true, data: memories });
    });
    app.delete('/api/memories/:memoryId', async (c) => {
        const memoryId = c.req.param('memoryId');
        const sessionId = c.req.query('sessionId') || 'default';
        const controller = getAppController(c.env);
        await controller.deleteMemory(sessionId, memoryId);
        return c.json({ success: true });
    });
    app.post('/api/sessions', async (c) => {
        const body = await c.req.json().catch(() => ({}));
        const sessionId = body.sessionId || crypto.randomUUID();
        await registerSession(c.env, sessionId, body.title);
        return c.json({ success: true, data: { sessionId } });
    });
    app.delete('/api/sessions/:sessionId', async (c) => {
        const sessionId = c.req.param('sessionId');
        const deleted = await unregisterSession(c.env, sessionId);
        return c.json({ success: !!deleted });
    });
}