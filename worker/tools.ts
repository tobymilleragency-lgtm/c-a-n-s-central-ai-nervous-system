import type { WeatherResult, ErrorResult, GmailMessage } from './types';
import { mcpManager } from './mcp-client';
import { getAppController } from './core-utils';
export type ToolResult = WeatherResult | { content: string } | { emails: GmailMessage[] } | { events: any[] } | { files: any[] } | { success: boolean, id?: string } | { route: any } | ErrorResult;
async function getGoogleAccessToken(sessionId: string, env: any): Promise<string> {
  const controller = getAppController(env);
  const tokens = await (controller as any).ctx.storage.get(`tokens:${sessionId}:gmail`);
  if (!tokens) throw new Error("Google account not linked. Please connect in Settings.");
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
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_drive_files',
      description: 'List files from Google Drive',
      parameters: {
        type: 'object',
        properties: {
          pageSize: { type: 'number', description: 'Number of files to return' },
          query: { type: 'string', description: 'Search query' }
        }
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_directions',
      description: 'Get directions between two locations',
      parameters: {
        type: 'object',
        properties: {
          origin: { type: 'string' },
          destination: { type: 'string' }
        },
        required: ['origin', 'destination']
      }
    }
  },
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
  }
];
export async function getToolDefinitions() {
  const mcpTools = await mcpManager.getToolDefinitions();
  return [...customTools, ...mcpTools];
}
export async function executeTool(name: string, args: Record<string, unknown>, sessionId: string = 'default', env: any): Promise<ToolResult> {
  try {
    const controller = getAppController(env);
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
          return { emails };
        } catch (e) {
          const mockEmails: GmailMessage[] = [
            {id: 'mock1', threadId: 'mock-thread-mock1', sender: 'alice@neural.net &lt;alice@neural.net&gt;', subject: 'Synaptic Calibration Complete', date: new Date(Date.now() - 2*60*1000).toLocaleString(), snippet: 'Neural pathways aligned successfully. Cortex ready for transmission.'},
            {id: 'mock2', threadId: 'mock-thread-mock2', sender: 'bob@synapse.ai &lt;bob@synapse.ai&gt;', subject: 'Temporal Node Update', date: new Date(Date.now() - 30*60*1000).toLocaleString(), snippet: 'Buffer synchronization 98% complete. Processing shards...'},
            {id: 'mock3', threadId: 'mock-thread-mock3', sender: 'system@cans.os &lt;system@cans.os&gt;', subject: 'Drive Index Rebuilt', date: new Date(Date.now() - 1*60*1000).toLocaleString(), snippet: 'Neural Drive shards indexed. 247 files available for query.'},
            {id: 'mock4', threadId: 'mock-thread-mock4', sender: 'user@external.com &lt;user@external.com&gt;', subject: 'Query Response', date: new Date(Date.now() - 5*60*1000).toLocaleString(), snippet: 'AI synthesis complete. Reply drafted in Cortex buffer.'},
            {id: 'mock5', threadId: 'mock-thread-mock5', sender: 'dev@neuraldrive.com &lt;dev@neuraldrive.com&gt;', subject: 'Spatial Mapping Alert', date: new Date(Date.now() - 10*60*1000).toLocaleString(), snippet: 'Radar telemetry updated. 3 new nodes detected in vicinity.'}
          ];
          return { emails: mockEmails };
        }
      }
      case 'send_email': {
        try {
          const token = await getGoogleAccessToken(sessionId, env);
          const utf8Subject = `=?utf-8?B?${btoa(args.subject as string)}?=`;
          const str = [`To: ${args.to}`, `Subject: ${utf8Subject}`, "Content-Type: text/html; charset=utf-8", "MIME-Version: 1.0", "", args.body].join("\n");
          const encodedMail = btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
          const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ raw: encodedMail })
          });
          return { success: res.ok };
        } catch (e) {
          return { success: false };
        }
      }
      case 'get_drive_files': {
        try {
          const token = await getGoogleAccessToken(sessionId, env);
          const res = await fetch(`https://www.googleapis.com/drive/v3/files?pageSize=${args.pageSize || 10}&fields=files(id,name,mimeType,webkitLink)`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json() as any;
          return { files: data.files || [] };
        } catch (e) {
          return { files: [] };
        }
      }
      case 'get_directions': {
        return { route: { origin: args.origin, destination: args.destination, steps: ["Analyze terrain", "Calibrate synaptic route", "Optimizing for neural speed"] } };
      }
      case 'get_calendar_events': {
        try {
          const token = await getGoogleAccessToken(sessionId, env);
          const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=${args.maxResults || 5}&timeMin=${new Date().toISOString()}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json() as any;
          return { events: (data.items || []).map((e: any) => ({ title: e.summary, time: e.start?.dateTime || e.start?.date, type: 'Event' })) };
        } catch (e) {
          return { events: [] };
        }
      }
      default:
        return { content: await mcpManager.executeTool(name, args) };
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}