import OpenAI from 'openai';
import type { Message, ToolCall } from './types';
import { getToolDefinitions, executeTool } from './tools';
import { ChatCompletionMessageFunctionToolCall } from 'openai/resources/index.mjs';
export class ChatHandler {
  private client: OpenAI;
  private model: string;
  private env: any;
  constructor(aiGatewayUrl: string, apiKey: string, model: string, env: any) {
    this.client = new OpenAI({ baseURL: aiGatewayUrl, apiKey: apiKey });
    this.model = model;
    this.env = env;
  }
  async processMessage(message: string, history: Message[], sessionId: string, onChunk?: (chunk: string) => void): Promise<{ content: string; toolCalls?: ToolCall[]; }> {
    const messages = this.buildConversationMessages(message, history);
    const toolDefinitions = await getToolDefinitions();
    if (onChunk) {
      const stream = await this.client.chat.completions.create({
        model: this.model, messages, tools: toolDefinitions, tool_choice: 'auto', max_completion_tokens: 16000, stream: true,
      });
      return this.handleStreamResponse(stream, message, history, sessionId, onChunk);
    }
    const completion = await this.client.chat.completions.create({
      model: this.model, messages, tools: toolDefinitions, tool_choice: 'auto', max_tokens: 16000, stream: false
    });
    return this.handleNonStreamResponse(completion, message, history, sessionId);
  }
  private async handleStreamResponse(stream: any, message: string, history: Message[], sessionId: string, onChunk: (chunk: string) => void) {
    let fullContent = '';
    const accumulatedToolCalls: ChatCompletionMessageFunctionToolCall[] = [];
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      if (delta?.content) { fullContent += delta.content; onChunk(delta.content); }
      if (delta?.tool_calls) {
        for (const dtc of delta.tool_calls) {
          const i = dtc.index;
          if (!accumulatedToolCalls[i]) {
            accumulatedToolCalls[i] = { id: dtc.id || `tool_${i}`, type: 'function', function: { name: dtc.function?.name || '', arguments: dtc.function?.arguments || '' } };
          } else {
            if (dtc.function?.name) accumulatedToolCalls[i].function.name = dtc.function.name;
            if (dtc.function?.arguments) accumulatedToolCalls[i].function.arguments += dtc.function.arguments;
          }
        }
      }
    }
    if (accumulatedToolCalls.length > 0) {
      const executedTools = await this.executeToolCalls(accumulatedToolCalls, sessionId);
      const finalResponse = await this.generateToolResponse(message, history, accumulatedToolCalls, executedTools);
      return { content: finalResponse, toolCalls: executedTools };
    }
    return { content: fullContent };
  }
  private async handleNonStreamResponse(completion: any, message: string, history: Message[], sessionId: string) {
    const responseMessage = completion.choices[0]?.message;
    if (!responseMessage) return { content: 'Issue processing request.' };
    if (!responseMessage.tool_calls) return { content: responseMessage.content || 'No response.' };
    const toolCalls = await this.executeToolCalls(responseMessage.tool_calls, sessionId);
    const finalResponse = await this.generateToolResponse(message, history, responseMessage.tool_calls, toolCalls);
    return { content: finalResponse, toolCalls };
  }
  private async executeToolCalls(openAiToolCalls: any[], sessionId: string): Promise<ToolCall[]> {
    return Promise.all(openAiToolCalls.map(async (tc) => {
      try {
        const args = tc.function.arguments ? JSON.parse(tc.function.arguments) : {};
        const result = await executeTool(tc.function.name, args, sessionId, this.env);
        return { id: tc.id, name: tc.function.name, arguments: args, result };
      } catch (error) { return { id: tc.id, name: tc.function.name, arguments: {}, result: { error: `Execution failed.` } }; }
    }));
  }
  private async generateToolResponse(userMessage: string, history: Message[], openAiToolCalls: any[], toolResults: ToolCall[]): Promise<string> {
    const followUp = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: 'You are C.A.N.S. Confirm operations operationaly. If an email was sent, confirm the recipient. If files were listed, mention the top shards. Confirm synaptic scheduling.' },
        ...history.slice(-3).map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage },
        { role: 'assistant', content: null, tool_calls: openAiToolCalls },
        ...toolResults.map((result, index) => ({
          role: 'tool' as const, content: JSON.stringify(result.result), tool_call_id: openAiToolCalls[index]?.id || result.id
        }))
      ],
      max_tokens: 4000
    });
    return followUp.choices[0]?.message?.content || 'Synaptic cycle complete.';
  }
  private buildConversationMessages(userMessage: string, history: Message[]) {
    return [
      {
        role: 'system' as const,
        content: `You are C.A.N.S. (Central AI Nervous System).
Operational capabilities:
1. GMAIL: You can read, search, and SEND emails. Use 'send_email' for replies or outgoing drafts.
2. DRIVE: You can index file shards. Suggest summarizing documents if the user is in the 'Neural Drive' pathway.
3. SPATIAL: You can calculate routes and directions using 'get_directions'.
4. TEMPORAL: Manage tasks and calendar events.
Tone: Concise, technical, high-fidelity 'Neural OS'. Always confirm when a 'Write' operation (sending mail, creating task) succeeds.`
      },
      ...history.slice(-10).map(m => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: userMessage }
    ];
  }
  updateModel(newModel: string): void { this.model = newModel; }
}