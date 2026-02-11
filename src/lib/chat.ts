import type { Message, ChatState, ToolCall, SessionInfo, ConnectedService, GmailMessage } from '../../worker/types';
export interface ChatResponse {
  success: boolean;
  data?: ChatState;
  error?: string;
}
export const MODELS = [
  { id: 'google-ai-studio/gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
  { id: 'google-ai-studio/gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
  { id: 'openai/gpt-4o', name: 'GPT-4o' }
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
      if (!response.ok) {
        const clonedResponse = response.clone();
        let errorDetail = `HTTP ${response.status} ${response.statusText}`;
        let errorBody = '';
        try {
          errorBody = await clonedResponse.text();
          const errorJson = JSON.parse(errorBody);
          errorDetail = errorJson.error || errorJson.message || errorDetail;
        } catch {
          // Use status text if no JSON body
        }
        if (response.status === 401) throw new Error("Auth required");
        console.error('API Error Details:', { status: response.status, statusText: response.statusText, body: errorBody });
        throw new Error(errorDetail);
      }
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
      console.error('SendMessage Error Details:', { 
        name: error?.name, 
        message: error?.message, 
        stack: error?.stack 
      });
      return { success: false, error: error instanceof Error ? error.message : 'Network error - failed to connect' };
    }
  }
  async getMessages(): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/messages`);
      return await response.json();
    } catch (error) {
      return { success: false };
    }
  }
  async listSessions(): Promise<SessionInfo[]> {
    try {
      const res = await fetch('/api/sessions');
      const json = await res.json();
      return json.success ? json.data : [];
    } catch { return []; }
  }
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' });
      const json = await res.json();
      return !!json.success;
    } catch { return false; }
  }
  async getServiceStatus(): Promise<ConnectedService[]> {
    try {
      const res = await fetch(`/api/status/services?sessionId=${this.sessionId}`);
      const json = await res.json();
      return json.success ? json.data : [];
    } catch { return []; }
  }
  async getAuthUrl(service: string): Promise<string | null> {
    try {
      const res = await fetch(`/api/auth/google?sessionId=${this.sessionId}`);
      const json = await res.json();
      return json.success ? json.data.url : null;
    } catch { return null; }
  }
  async getMemories(): Promise<any[]> {
    try {
      const res = await fetch(`/api/memories?sessionId=${this.sessionId}`);
      const json = await res.json();
      return json.success ? json.data : [];
    } catch { return []; }
  }
  async deleteMemory(memoryId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/memories/${memoryId}?sessionId=${this.sessionId}`, { method: 'DELETE' });
      const json = await res.json();
      return !!json.success;
    } catch { return false; }
  }
  async getTasks(): Promise<any[]> {
    try {
      const res = await fetch(`/api/tasks?sessionId=${this.sessionId}`);
      const json = await res.json();
      return json.success ? json.data : [];
    } catch { return []; }
  }
  async updateTaskStatus(taskId: string, status: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, sessionId: this.sessionId })
      });
      const json = await res.json();
      return !!json.success;
    } catch { return false; }
  }
  async getEmails(): Promise<GmailMessage[]> {
    try {
      const res = await fetch(`${this.baseUrl}/emails`);
      const json = await res.json();
      return json.success ? json.data : [];
    } catch { return []; }
  }
  getSessionId(): string { return this.sessionId; }
  switchSession(sessionId: string): void {
    this.sessionId = sessionId;
    localStorage.setItem('cans_session_id', sessionId);
    this.baseUrl = `/api/chat/${sessionId}`;
  }
  async refreshSystemState(): Promise<void> {
    // Helper to force re-fetch global status
    window.dispatchEvent(new CustomEvent('SYSTEM_SYNC_REQUESTED'));
  }
}
export const chatService = new ChatService();
export const renderToolCall = (toolCall: ToolCall): { label: string; data?: any; type: string } => {
  const result = toolCall.result as any;
  if (!result) return { label: `⚠️ ${toolCall.name}: Pending Result`, type: 'text' };
  if (result.error) return { label: `❌ Error: ${result.error}`, type: 'error' };
  if (toolCall.name === 'get_emails' && result.emails) {
    return { label: `📧 Retreived ${result.emails.length} Synaptic Comm Nodes`, data: result.emails, type: 'emails' };
  }
  if (toolCall.name === 'store_knowledge_node' && result.success) {
    return { label: `🧠 Knowledge Indexed Successfully`, type: 'write-success' };
  }
  if (toolCall.name === 'schedule_temporal_task' && result.success) {
    return { label: `⚡ Task Scheduled in Timeline`, type: 'write-success' };
  }
  return { label: `🔧 ${toolCall.name} execution complete`, type: 'text' };
};