import type { Message, ChatState, ToolCall, SessionInfo, ConnectedService, GmailMessage } from '../../worker/types';
export interface ChatResponse { success: boolean; data?: ChatState; error?: string; }
export const MODELS = [
  { id: '@google/gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash' },
  { id: '@cf/meta/llama-3.1-8b-instruct-turbo', name: 'Llama 3.1 Turbo' }
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
      if (response.status === 401) { throw new Error("Synaptic Link Required"); }
      if (!response.ok) throw new Error(await response.text());
      if (onChunk && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          onChunk(decoder.decode(value, { stream: true }));
        }
        return { success: true };
      }
      return await response.json();
    } catch (error) { 
      return { success: false, error: error instanceof Error ? error.message : 'Synaptic transmission failure' }; 
    }
  }
  async getMessages(): Promise<ChatResponse> { try { const r = await fetch(`${this.baseUrl}/messages`); return await r.json(); } catch { return { success: false }; } }
  async getDriveFiles(): Promise<any[]> { try { const r = await fetch(`${this.baseUrl}/drive`); const j = await r.json(); return j.success ? j.data : []; } catch { return []; } }
  async getDirections(origin: string, destination: string): Promise<any> { 
    try { 
      const r = await fetch(`${this.baseUrl}/directions?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`); 
      const j = await r.json(); 
      return j.success ? j.data : null; 
    } catch { return null; } 
  }
  async getServiceStatus(): Promise<ConnectedService[]> { 
    try { 
      const r = await fetch(`/api/status/services?sessionId=${this.sessionId}`); 
      const j = await r.json(); 
      return j.success ? j.data : []; 
    } catch { return []; } 
  }
  async getAuthUrl(service: string): Promise<string | null> { 
    try { 
      const r = await fetch(`/api/auth/google?sessionId=${this.sessionId}`); 
      const j = await r.json(); 
      return j.success ? j.data.url : null; 
    } catch { return null; } 
  }
  async getEmails(): Promise<GmailMessage[]> { try { const r = await fetch(`${this.baseUrl}/emails`); const j = await r.json(); return j.success ? j.data : []; } catch { return []; } }
  async listSessions(): Promise<SessionInfo[]> { try { const r = await fetch('/api/sessions'); const j = await r.json(); return j.success ? j.data : []; } catch { return []; } }
  async getMemories(): Promise<any[]> { try { const r = await fetch(`/api/memories?sessionId=${this.sessionId}`); const j = await r.json(); return j.success ? j.data : []; } catch { return []; } }
  async deleteMemory(id: string): Promise<boolean> { try { const r = await fetch(`/api/memories/${id}?sessionId=${this.sessionId}`, { method: 'DELETE' }); const j = await r.json(); return !!j.success; } catch { return false; } }
  async getTasks(): Promise<any[]> { try { const r = await fetch(`/api/tasks?sessionId=${this.sessionId}`); const j = await r.json(); return j.success ? j.data : []; } catch { return []; } }
  async updateTaskStatus(id: string, s: string): Promise<boolean> { try { const r = await fetch(`/api/tasks/${id}/status`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: s, sessionId: this.sessionId }) }); const j = await r.json(); return !!j.success; } catch { return false; } }
  getSessionId(): string { return this.sessionId; }
  sendContextualQuery(context: string): void {
    window.location.href = `/?context=${encodeURIComponent(context)}`;
  }
}
export const chatService = new ChatService();
export const renderToolCall = (tc: ToolCall): { label: string; data?: any; type: string } => {
  const r = tc.result as any;
  if (!r) return { label: `[PROCESSING] NODE: ${tc.name.toUpperCase()}`, type: 'text' };
  if (r.error) return { label: `[FAULT] ${r.error.toUpperCase()}`, type: 'error' };
  switch (tc.name) {
    case 'get_emails':
      return { label: `[SYNCED] ${r.emails?.length || 0} COMMS NODES RETRIEVED`, data: r.emails, type: 'emails' };
    case 'send_email':
      return { label: r.success ? `[SUCCESS] NEURAL PACKET TRANSMITTED` : `[FAIL] TRANSMISSION ABORTED`, type: 'write-success' };
    case 'get_drive_files':
      return { label: `[INDEXED] ${r.files?.length || 0} DRIVE SHARDS DISCOVERED`, data: r.files, type: 'files' };
    case 'get_directions':
      return { label: `[LOCKED] SPATIAL ROUTE TELEMETRY CALCULATED`, data: r.route, type: 'spatial' };
    case 'get_calendar_events':
      return { label: `[ALIGNED] ${r.events?.length || 0} TEMPORAL NODES INDEXED`, data: r.events, type: 'temporal' };
    default:
      return { label: `[COMPLETE] NODE: ${tc.name.toUpperCase()}`, type: 'text' };
  }
};