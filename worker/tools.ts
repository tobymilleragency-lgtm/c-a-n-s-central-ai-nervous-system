import type { WeatherResult, ErrorResult, GmailMessage } from './types';
import { mcpManager } from './mcp-client';
import { getAppController } from './core-utils';
export type ToolResult = WeatherResult | { content: string } | { emails: GmailMessage[] } | { events: any[] } | { success: boolean, id?: string } | ErrorResult;
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
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_calendar_events',
      description: 'Retrieve upcoming calendar events and meetings from Google Calendar',
      parameters: {
        type: 'object',
        properties: {
          maxResults: { type: 'number', description: 'Number of events to fetch (default 5)' },
          timeMin: { type: 'string', description: 'ISO start date for fetching events' }
        }
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'store_knowledge_node',
      description: 'Commit a significant piece of information to long-term synaptic memory',
      parameters: {
        type: 'object',
        properties: {
          content: { type: 'string', description: 'The information to be remembered' },
          category: { type: 'string', enum: ['Personal', 'Project', 'Global'], description: 'Category of knowledge' }
        },
        required: ['content', 'category']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'schedule_temporal_task',
      description: 'Schedule a new task or follow-up in the system timeline',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'The task description' },
          priority: { type: 'string', enum: ['low', 'medium', 'high'], default: 'medium' }
        },
        required: ['title']
      }
    }
  }
];
export async function getToolDefinitions() {
  const mcpTools = await mcpManager.getToolDefinitions();
  return [...customTools, ...mcpTools];
}
async function fetchGmailMessages(sessionId: string, count: number = 5): Promise<GmailMessage[] | { error: string }> {
    return [
        { id: '1', threadId: 't1', sender: 'Neural Arch <system@cans.io>', subject: 'Synaptic Protocol Update', date: '2 mins ago', snippet: 'The bridge between your cortex and Gmail has been established.' },
        { id: '2', threadId: 't2', sender: 'Marcus Chen <marcus@pioneer.com>', subject: 'Project Phoenix Status', date: '1 hour ago', snippet: 'The temporal mapping is complete.' },
        { id: '3', threadId: 't3', sender: 'Sarah Jenkins <sarah@hr.global>', subject: 'Interview Schedule: AI Reflexes', date: '3 hours ago', snippet: 'I have scheduled three candidates...' }
    ].slice(0, count);
}
async function fetchCalendarEvents(sessionId: string, maxResults: number = 5): Promise<any[] | { error: string }> {
  return [
    { title: "Neural Sync: Core Architecture", time: "14:30", type: "Sync" },
    { title: "Security Audit: Immune System", time: "16:00", type: "Security" },
    { title: "Deep Thought: Long-Term Memory", time: "18:00", type: "Maintenance" }
  ].slice(0, maxResults);
}
export async function executeTool(name: string, args: Record<string, unknown>, sessionId: string = 'default', env: any): Promise<ToolResult> {
  try {
    const controller = getAppController(env);
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
      case 'get_calendar_events': {
        const maxResults = (args.maxResults as number) || 5;
        const events = await fetchCalendarEvents(sessionId, maxResults);
        if ('error' in events) return { error: events.error };
        return { events };
      }
      case 'store_knowledge_node': {
        await controller.addMemory(sessionId, {
          content: args.content as string,
          category: args.category as string
        });
        return { success: true };
      }
      case 'schedule_temporal_task': {
        await controller.createTask(sessionId, {
          title: args.title as string,
          status: 'pending'
        });
        return { success: true };
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