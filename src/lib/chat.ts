import type { Message, ChatState, ToolCall, WeatherResult, MCPResult, ErrorResult, SessionInfo, ConnectedService, GmailMessage } from '../../worker/types';
export interface ChatResponse {
  success: boolean;
  data?: ChatState;
  error?: string;
}
export const MODELS = [
  { id: 'google-ai-studio/gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'google-ai-studio/gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
  { id: 'google-ai-studio/gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
];
class ChatService {
  private sessionId: string;
  private baseUrl: string;
  constructor() {
    this.sessionId = localStorage.getItem('cans_session_id') || crypto.randomUUID();
    localStorage.setItem('cans_session_id', this.sessionId);
    this.baseUrl = `/api/chat/${this.sessionId}`;
  }
  async sendMessage(message: string, model?: string, onChunk?: (chunk: string) => void): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, model, stream: !!onChunk }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (onChunk && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          if (chunk) onChunk(chunk);
        }
        return { success: true };
      }
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to send message' };
    }
  }
  async getMessages(): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/messages`);
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to load messages' };
    }
  }
  async listSessions(): Promise<SessionInfo[]> {
    try {
      const response = await fetch('/api/sessions');
      const json = await response.json();
      return json.success ? json.data : [];
    } catch (error) {
      return [];
    }
  }
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' });
      const json = await response.json();
      return !!json.success;
    } catch (error) {
      return false;
    }
  }
  async getAuthUrl(service: string): Promise<string | null> {
    try {
      const res = await fetch(`/api/auth/google?sessionId=${this.sessionId}`);
      const json = await res.json();
      return json.success ? json.data.url : null;
    } catch (error) {
      return null;
    }
  }
  async getServiceStatus(): Promise<ConnectedService[]> {
    try {
      const res = await fetch(`/api/status/services?sessionId=${this.sessionId}`);
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (error) {
      return [];
    }
  }
  getSessionId(): string { return this.sessionId; }
  switchSession(sessionId: string): void {
    this.sessionId = sessionId;
    localStorage.setItem('cans_session_id', sessionId);
    this.baseUrl = `/api/chat/${sessionId}`;
  }
}
export const chatService = new ChatService();
export const renderToolCall = (toolCall: ToolCall): { label: string; data?: any; type: string } => {
  const result = toolCall.result as any;
  if (!result) return { label: `⚠️ ${toolCall.name}: No result`, type: 'text' };
  if (result.error) return { label: `❌ ${toolCall.name}: ${result.error}`, type: 'error' };
  if (toolCall.name === 'get_emails' && result.emails) {
    return { label: `📧 Retrieved ${result.emails.length} emails`, data: result.emails, type: 'emails' };
  }
  if (toolCall.name === 'get_calendar_events' && result.events) {
    return { label: `📅 Synced ${result.events.length} temporal nodes`, data: result.events, type: 'calendar' };
  }
  if (toolCall.name === 'get_weather') {
    return { label: `🌤️ Weather: ${result.temperature}°C, ${result.condition}`, type: 'text' };
  }
  return { label: `🔧 ${toolCall.name}: Executed`, type: 'text' };
};