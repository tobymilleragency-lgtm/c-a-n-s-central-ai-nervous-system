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
        console.error('Agent routing error:', error);
        return c.json({ success: false, error: API_RESPONSES.AGENT_ROUTING_FAILED }, { status: 500 });
        }
    });
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    app.get('/api/auth/google', async (c) => {
        const sessionId = c.req.query('sessionId') || 'default';
        const clientId = c.env.GOOGLE_CLIENT_ID || 'MOCK_CLIENT_ID';
        const redirectUri = `${new URL(c.req.url).origin}/api/auth/google/callback`;
        const scopes = [
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/userinfo.email',
            'openid'
        ].join(' ');
        const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent&state=${sessionId}`;
        return c.json({ success: true, data: { url } });
    });
    app.get('/api/auth/google/callback', async (c) => {
        const code = c.req.query('code');
        const state = c.req.query('state') || 'default';
        const redirectUri = `${new URL(c.req.url).origin}/api/auth/google/callback`;
        if (!code) return c.text('Authorization failed: No code provided', 400);
        try {
            // In a real app, exchange code for tokens here. Mocking for now.
            const controller = getAppController(c.env);
            await controller.saveServiceTokens(state, 'gmail', {
                access_token: 'MOCK_ACCESS_TOKEN_' + Date.now(),
                refresh_token: 'MOCK_REFRESH_TOKEN',
                scopes: ['gmail.readonly'],
                expiry_date: Date.now() + 3600000
            });
            return c.html(`
                <html><body>
                    <script>
                        window.opener.postMessage({ type: 'AUTH_SUCCESS', service: 'gmail' }, '*');
                        window.close();
                    </script>
                    <p>Authentication successful! You can close this window.</p>
                </body></html>
            `);
        } catch (error) {
            return c.text('Token exchange failed', 500);
        }
    });
    app.get('/api/status/services', async (c) => {
        const sessionId = c.req.query('sessionId') || 'default';
        const controller = getAppController(c.env);
        const services = await controller.listConnectedServices(sessionId);
        return c.json({ success: true, data: services });
    });
    app.get('/api/sessions', async (c) => {
        const controller = getAppController(c.env);
        const sessions = await controller.listSessions();
        return c.json({ success: true, data: sessions });
    });
    app.post('/api/sessions', async (c) => {
        const body = await c.req.json().catch(() => ({}));
        const { title, sessionId: providedSessionId, firstMessage } = body;
        const sessionId = providedSessionId || crypto.randomUUID();
        let sessionTitle = title || (firstMessage ? firstMessage.slice(0, 30) : `Chat ${Date.now()}`);
        await registerSession(c.env, sessionId, sessionTitle);
        return c.json({ success: true, data: { sessionId, title: sessionTitle } });
    });
    app.delete('/api/sessions/:sessionId', async (c) => {
        const sessionId = c.req.param('sessionId');
        const deleted = await unregisterSession(c.env, sessionId);
        return c.json({ success: !!deleted, data: { deleted } });
    });
}