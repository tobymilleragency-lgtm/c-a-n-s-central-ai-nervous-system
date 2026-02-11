import { Agent } from 'agents';
import type { Env } from './core-utils';
import type { ChatState, Message } from './types';
import { ChatHandler } from './chat';
import { API_RESPONSES } from './config';
import { createMessage, createStreamResponse, createEncoder } from './utils';
import { getAppController } from './core-utils';
import { executeTool } from './tools';
export class ChatAgent extends Agent<Env, ChatState> {
  private chatHandler?: ChatHandler;
  initialState: ChatState = {
    messages: [],
    sessionId: '',
    isProcessing: false,
    model: 'google-ai-studio/gemini-2.0-flash'
  };
  async onStart(): Promise<void> {
    this.state.sessionId = this.name;
    const controller = getAppController(this.env);
    const persistedMessages = await controller.getConversationMessages(this.state.sessionId);
    this.setState({ ...this.state, messages: persistedMessages });
    this.chatHandler = new ChatHandler(this.env.CF_AI_BASE_URL, this.env.CF_AI_API_KEY, this.state.model, this.env);
  }
  async onRequest(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const method = request.method;
      if (method === 'GET') {
        if (url.pathname === '/messages') return Response.json({ success: true, data: this.state });
        if (url.pathname === '/drive') {
          const res = await executeTool('get_drive_files', { pageSize: 20 }, this.state.sessionId, this.env);
          return Response.json({ success: true, data: (res as any).files });
        }
        if (url.pathname === '/directions') {
          const origin = url.searchParams.get('origin') || 'Current Location';
          const destination = url.searchParams.get('destination') || 'Unknown';
          const res = await executeTool('get_directions', { origin, destination }, this.state.sessionId, this.env);
          return Response.json({ success: true, data: (res as any).route });
        }
        if (url.pathname === '/emails') {
          const res = await executeTool('get_emails', { count: 10 }, this.state.sessionId, this.env);
          return Response.json({ success: true, data: (res as any).emails });
        }
      }
      if (method === 'POST' && url.pathname === '/chat') {
        return this.handleChatMessage(await request.json());
      }
      return Response.json({ success: false, error: API_RESPONSES.NOT_FOUND }, { status: 404 });
    } catch (error) {
      console.error('Agent onRequest error:', error);
      return Response.json({ success: false, error: API_RESPONSES.INTERNAL_ERROR }, { status: 500 });
    }
  }
  private async handleChatMessage(body: { message: string; model?: string; stream?: boolean }): Promise<Response> {
    const { message, model, stream } = body;
    const controller = getAppController(this.env);
    if (model && model !== this.state.model) {
      this.setState({ ...this.state, model });
      this.chatHandler?.updateModel(model);
    }
    const userMsg = createMessage('user', message.trim());
    await controller.saveMessage(this.state.sessionId, userMsg);
    this.setState({ ...this.state, messages: [...this.state.messages, userMsg], isProcessing: true });
    try {
      if (stream) {
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        const encoder = createEncoder();
        (async () => {
          try {
            const response = await this.chatHandler!.processMessage(message, this.state.messages, this.state.sessionId, (chunk: string) => {
              writer.write(encoder.encode(chunk));
            });
            const assistantMsg = createMessage('assistant', response.content, response.toolCalls);
            await controller.saveMessage(this.state.sessionId, assistantMsg);
            this.setState({ ...this.state, messages: [...this.state.messages, assistantMsg], isProcessing: false });
          } catch (err) { 
            console.error('Streaming error:', err);
            this.setState({ ...this.state, isProcessing: false });
          } finally { 
            writer.close(); 
          }
        })();
        return createStreamResponse(readable);
      }
      const response = await this.chatHandler!.processMessage(message, this.state.messages, this.state.sessionId);
      const assistantMsg = createMessage('assistant', response.content, response.toolCalls);
      await controller.saveMessage(this.state.sessionId, assistantMsg);
      this.setState({ ...this.state, messages: [...this.state.messages, assistantMsg], isProcessing: false });
      return Response.json({ success: true, data: this.state });
    } catch (error) {
      console.error('Chat error:', error);
      this.setState({ ...this.state, isProcessing: false });
      return Response.json({ success: false, error: API_RESPONSES.PROCESSING_ERROR }, { status: 500 });
    }
  }
}