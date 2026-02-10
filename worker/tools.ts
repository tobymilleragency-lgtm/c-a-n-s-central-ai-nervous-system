import type { WeatherResult, ErrorResult, GmailMessage } from './types';
import { mcpManager } from './mcp-client';
import { getAppController } from './core-utils';
export type ToolResult = WeatherResult | { content: string } | { emails: GmailMessage[] } | ErrorResult;
const customTools = [
  {
    type: 'function' as const,
    function: {
      name: 'get_weather',
      description: 'Get current weather information for a location',
      parameters: {
        type: 'object',
        properties: { location: { type: 'string', description: 'The city or location name' } },
        required: ['location']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_emails',
      description: 'Retrieve recent emails from the users connected Gmail account',
      parameters: {
        type: 'object',
        properties: { 
          count: { type: 'number', description: 'Number of emails to fetch (default 5)' },
          query: { type: 'string', description: 'Search query to filter emails' }
        }
      }
    }
  }
];
export async function getToolDefinitions() {
  const mcpTools = await mcpManager.getToolDefinitions();
  return [...customTools, ...mcpTools];
}
async function fetchGmailMessages(sessionId: string, count: number = 5): Promise<GmailMessage[] | { error: string }> {
    // In real implementation, use stored access_token to call Gmail API
    // Returning mock data for demonstration
    return [
        {
            id: '1',
            threadId: 't1',
            sender: 'Neural Arch <system@cans.io>',
            subject: 'Synaptic Protocol Update',
            date: '2 mins ago',
            snippet: 'The bridge between your cortex and Gmail has been established. This is a confirmation of...'
        },
        {
            id: '2',
            threadId: 't2',
            sender: 'Marcus Chen <marcus@pioneer.com>',
            subject: 'Project Phoenix Status',
            date: '1 hour ago',
            snippet: 'The temporal mapping is complete. We need to review the neural load balance tomorrow...'
        },
        {
            id: '3',
            threadId: 't3',
            sender: 'Sarah Jenkins <sarah@hr.global>',
            subject: 'Interview Schedule: AI Reflexes',
            date: '3 hours ago',
            snippet: 'I have scheduled three candidates for the Reflex System Engineer position starting...'
        }
    ].slice(0, count);
}
export async function executeTool(name: string, args: Record<string, unknown>, sessionId: string = 'default'): Promise<ToolResult> {
  try {
    switch (name) {
      case 'get_weather':
        return {
          location: args.location as string,
          temperature: Math.floor(Math.random() * 40) - 10,
          condition: ['Sunny', 'Cloudy', 'Rainy', 'Snowy'][Math.floor(Math.random() * 4)],
          humidity: Math.floor(Math.random() * 100)
        };
      case 'get_emails': {
        const count = (args.count as number) || 5;
        const emails = await fetchGmailMessages(sessionId, count);
        if ('error' in emails) return { error: emails.error };
        return { emails };
      }
      default: {
        const content = await mcpManager.executeTool(name, args);
        return { content };
      }
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}