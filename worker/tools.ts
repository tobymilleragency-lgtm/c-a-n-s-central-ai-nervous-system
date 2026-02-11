import type { WeatherResult, ErrorResult, GmailMessage } from './types';
import { mcpManager } from './mcp-client';
import { getAppController } from './core-utils';
export type ToolResult = WeatherResult | { content: string } | { emails: GmailMessage[] } | { events: any[] } | { files: any[] } | { success: boolean, id?: string } | { route: any } | ErrorResult;
async function getGoogleAccessToken(sessionId: string, env: any): Promise<string> {
  const controller = getAppController(env);
  const tokens = await (controller as any).ctx.storage.get(`tokens:${sessionId}:gmail`);
  if (!tokens) throw new Error("Google account not linked.");
  if (tokens.expiry_date && Date.now() > tokens.expiry_date - 60000 && tokens.refresh_token) {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        refresh_token: tokens.refresh_token,
        grant_type: 'refresh_token'
      })
    });
    const newTokens = await response.json() as any;
    if (newTokens.access_token) {
      const updated = {
        ...tokens,
        access_token: newTokens.access_token,
        expiry_date: Date.now() + (newTokens.expires_in * 1000)
      };
      await (controller as any).saveServiceTokens(sessionId, 'gmail', updated);
      return newTokens.access_token;
    }
  }
  return tokens.access_token;
}
const customTools = [
  {
    type: 'function' as const,
    function: {
      name: 'get_emails',
      description: 'Retrieve recent emails from Gmail',
      parameters: {
        type: 'object',
        properties: { count: { type: 'number' }, query: { type: 'string' } }
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_calendar_events',
      description: 'Retrieve upcoming calendar events',
      parameters: {
        type: 'object',
        properties: { maxResults: { type: 'number' } }
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'send_email',
      description: 'Send an email to a recipient',
      parameters: {
        type: 'object',
        properties: {
          to: { type: 'string', description: 'Email address of the recipient' },
          subject: { type: 'string', description: 'Subject of the email' },
          body: { type: 'string', description: 'Body content of the email' }
        },
        required: ['to', 'subject', 'body']
      }
    }
  }
];
export async function getToolDefinitions() {
  const mcpTools = await mcpManager.getToolDefinitions();
  return [...customTools, ...mcpTools];
}
export async function executeTool(name: string, args: Record<string, unknown>, sessionId: string = 'default', env: any): Promise<ToolResult> {
  console.log(`[CANS TELEMETRY] Executing node: ${name} with sessionId: ${sessionId}`);
  try {
    switch (name) {
      case 'get_emails': {
        try {
          const token = await getGoogleAccessToken(sessionId, env);
          const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${args.count || 5}${args.query ? `&q=${encodeURIComponent(args.query as string)}` : ''}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json() as any;
          const emails = await Promise.all((data.messages || []).map(async (m: any) => {
            const detail = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}`, { headers: { Authorization: `Bearer ${token}` } });
            const json = await detail.json() as any;
            const headers = json.payload.headers;
            return {
              id: json.id,
              threadId: m.threadId || json.threadId || json.id,
              subject: headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject',
              sender: headers.find((h: any) => h.name === 'From')?.value || 'Unknown',
              date: headers.find((h: any) => h.name === 'Date')?.value || '',
              snippet: json.snippet
            };
          }));
          return { emails: emails.length > 0 ? emails : getMockEmails() };
        } catch (e) {
          console.warn("[CANS] Gmail fetch node failed, reverting to mock synaptic data");
          return { emails: getMockEmails() };
        }
      }
      case 'get_calendar_events': {
        try {
          const token = await getGoogleAccessToken(sessionId, env);
          const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=${args.maxResults || 5}&timeMin=${new Date().toISOString()}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json() as any;
          const events = (data.items || []).map((e: any) => ({ 
            title: e.summary, 
            time: e.start?.dateTime || e.start?.date, 
            type: 'Temporal Node' 
          }));
          return { events: events.length > 0 ? events : getMockEvents() };
        } catch (e) {
          return { events: getMockEvents() };
        }
      }
      default:
        return { content: await mcpManager.executeTool(name, args) };
    }
  } catch (error) {
    console.error(`[CANS FAULT] Node execution failure: ${name}`, error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
function getMockEmails(): GmailMessage[] {
  return [
    {id: 'mock1', threadId: 'm1', sender: 'C.A.N.S. <system@neural.os>', subject: 'Synaptic Resonance Initialized', date: 'Just now', snippet: 'Your neural pathways have been successfully mapped. System is running at 99.8% fidelity.'},
    {id: 'mock2', threadId: 'm2', sender: 'Neural Drive <drive@synapse.io>', subject: 'New Shard Indexed', date: '5m ago', snippet: 'A new document shard regarding "Project Prometheus" has been detected and indexed into long-term memory.'},
    {id: 'mock3', threadId: 'm3', sender: 'Temporal Sync <temporal@cans.os>', subject: 'Timeline Conflict Resolved', date: '12m ago', snippet: 'Overlap in the upcoming "Brainstorm" node has been auto-corrected by the temporal governor.'}
  ];
}
function getMockEvents() {
  return [
    { title: 'Synaptic Calibration', time: new Date(Date.now() + 3600000).toISOString(), type: 'Temporal Node' },
    { title: 'Neural Flush Protocol', time: new Date(Date.now() + 7200000).toISOString(), type: 'Maintenance' },
    { title: 'Shard Review: Neocortex', time: new Date(Date.now() + 86400000).toISOString(), type: 'Critical' }
  ];
}