import type { WeatherResult, ErrorResult, GmailMessage } from './types';
import { mcpManager } from './mcp-client';
import { getAppController } from './core-utils';
export type ToolResult = WeatherResult | { content: string } | { emails: GmailMessage[] } | { events: any[] } | { files: any[] } | { success: boolean, id?: string } | { route: any } | ErrorResult;
async function getGoogleAccessToken(sessionId: string, env: any, targetEmail?: string): Promise<string> {
  const controller = getAppController(env);
  const tokens = await controller.getServiceTokens(sessionId, 'google', targetEmail);
  if (!tokens) {
    throw new Error(`Synaptic Link Required: No Google account linked${targetEmail ? ` for ${targetEmail}` : ''}. Please link an account in Settings.`);
  }
  if (tokens.expiry_date && Date.now() > tokens.expiry_date - 60000 && tokens.refresh_token) {
    console.log(`[CANS] Refreshing synaptic token for: ${tokens.email}`);
    try {
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
        await controller.saveServiceTokens(sessionId, 'google', updated, tokens.email || 'unknown');
        return newTokens.access_token;
      }
    } catch (e) {
      console.error("[CANS] Synaptic refresh flow failed:", e);
    }
  }
  return tokens.access_token;
}
const customTools = [
  {
    type: 'function' as const,
    function: {
      name: 'get_emails',
      description: 'Retrieve recent emails from Gmail. Optionally specify accountEmail if user has multiple identities.',
      parameters: {
        type: 'object',
        properties: { 
          count: { type: 'number' }, 
          query: { type: 'string' },
          accountEmail: { type: 'string', description: 'Specific email address to search' }
        }
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_calendar_events',
      description: 'Retrieve upcoming calendar events. Optionally specify accountEmail.',
      parameters: {
        type: 'object',
        properties: { 
          maxResults: { type: 'number' },
          accountEmail: { type: 'string' }
        }
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'send_email',
      description: 'Send an email to a recipient. Specify accountEmail to choose the sender identity.',
      parameters: {
        type: 'object',
        properties: {
          to: { type: 'string', description: 'Email address of the recipient' },
          subject: { type: 'string', description: 'Subject of the email' },
          body: { type: 'string', description: 'Body content of the email' },
          accountEmail: { type: 'string', description: 'Email address to send FROM' }
        },
        required: ['to', 'subject', 'body']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_drive_files',
      description: 'Retrieve files from Google Drive. Optionally specify accountEmail.',
      parameters: {
        type: 'object',
        properties: { 
          pageSize: { type: 'number' },
          accountEmail: { type: 'string' }
        }
      }
    }
  }
];
export async function getToolDefinitions() {
  const mcpTools = await mcpManager.getToolDefinitions();
  return [...customTools, ...mcpTools];
}
export async function executeTool(name: string, args: Record<string, unknown>, sessionId: string = 'default', env: any): Promise<ToolResult> {
  console.log(`[CANS] Executing synaptic node: ${name} (Session: ${sessionId})`);
  const targetEmail = args.accountEmail as string | undefined;
  try {
    switch (name) {
      case 'get_emails': {
        try {
          const token = await getGoogleAccessToken(sessionId, env, targetEmail);
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
              threadId: json.threadId,
              subject: headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject',
              sender: headers.find((h: any) => h.name === 'From')?.value || 'Unknown',
              date: headers.find((h: any) => h.name === 'Date')?.value || '',
              snippet: json.snippet
            };
          }));
          return { emails: emails.length > 0 ? emails : [] };
        } catch (e) {
          return { error: e instanceof Error ? e.message : 'Gmail node fault' };
        }
      }
      case 'get_calendar_events': {
        try {
          const token = await getGoogleAccessToken(sessionId, env, targetEmail);
          const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=${args.maxResults || 5}&timeMin=${new Date().toISOString()}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json() as any;
          const events = (data.items || []).map((e: any) => ({
            title: e.summary,
            time: e.start?.dateTime || e.start?.date,
            type: 'Temporal Node'
          }));
          return { events };
        } catch (e) {
          return { error: e instanceof Error ? e.message : 'Calendar node fault' };
        }
      }
      case 'get_drive_files': {
        try {
          const token = await getGoogleAccessToken(sessionId, env, targetEmail);
          const res = await fetch(`https://www.googleapis.com/drive/v3/files?pageSize=${args.pageSize || 20}&fields=files(id,name,mimeType,webViewLink)`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json() as any;
          return { files: data.files || [] };
        } catch (e) {
          return { error: e instanceof Error ? e.message : 'Drive node fault' };
        }
      }
      case 'send_email': {
        try {
          const token = await getGoogleAccessToken(sessionId, env, targetEmail);
          const { to, subject, body } = args as { to: string, subject: string, body: string };
          const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
          const messageParts = [
            `To: ${to}`,
            'Content-Type: text/html; charset=utf-8',
            'MIME-Version: 1.0',
            `Subject: ${utf8Subject}`,
            '',
            body,
          ];
          const rawMessage = btoa(unescape(encodeURIComponent(messageParts.join('\n')))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
          const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ raw: rawMessage }),
          });
          if (!res.ok) throw new Error("Packet transmission failed.");
          return { success: true };
        } catch (e) {
          return { success: false, error: e instanceof Error ? e.message : 'Transmission fault.' } as any;
        }
      }
      default:
        return { content: await mcpManager.executeTool(name, args) };
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown synaptic fault' };
  }
}