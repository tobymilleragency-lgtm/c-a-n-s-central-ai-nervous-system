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
        const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&state=${sessionId}`;
        return c.json({ success: true, data: { url } });
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
    app.get('/api/tasks', async (c) => {
        const sessionId = c.req.query('sessionId') || 'default';
        const controller = getAppController(c.env);
        const tasks = await controller.listTasks(sessionId);
        return c.json({ success: true, data: tasks });
    });
    app.get('/api/memories', async (c) => {
        const sessionId = c.req.query('sessionId') || 'default';
        const controller = getAppController(c.env);
        const memories = await controller.listMemories(sessionId);
        return c.json({ success: true, data: memories });
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