import OpenAI from 'openai';
import type { Message, ToolCall } from './types';
import { getToolDefinitions, executeTool } from './tools';
export class ChatHandler {
  private client: OpenAI;
  private model: string;
  private env: any;
  constructor(aiGatewayUrl: string, apiKey: string, model: string, env: any) {
    this.client = new OpenAI({
      baseURL: aiGatewayUrl,
      apiKey: apiKey,
      defaultHeaders: {
        'cf-aig-cache': 'true'
      }
    });
    this.model = model.includes('gemini') ? '@cf/google/gemini-1.5-flash' : model;
    this.env = env;
  }
  async processMessage(message: string, history: Message[], sessionId: string, onChunk?: (chunk: string) => void): Promise<{ content: string; toolCalls?: ToolCall[]; }> {
    const messages = this.buildConversationMessages(message, history);
    const toolDefinitions = await getToolDefinitions();
    try {
      if (onChunk) {
        const stream = await this.client.chat.completions.create({
          model: this.model,
          messages: messages as any,
          tools: toolDefinitions as any,
          tool_choice: 'auto',
          stream: true,
        });
        return this.handleStreamResponse(stream, message, history, sessionId, onChunk);
      }
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: messages as any,
        tools: toolDefinitions as any,
        tool_choice: 'auto',
        stream: false
      });
      return this.handleNonStreamResponse(completion, message, history, sessionId);
    } catch (error) {
      console.error("[CORTEX FAULT] SDK Execution Error:", error);
      return { content: `Neural processing failure: ${error instanceof Error ? error.message : 'Unknown exception'}` };
    }
  }
  private async handleStreamResponse(stream: any, message: string, history: Message[], sessionId: string, onChunk: (chunk: string) => void) {
    let fullContent = '';
    const accumulatedToolCalls: any[] = [];
    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta;
      if (!delta) continue;
      if (delta.content) {
        fullContent += delta.content;
        onChunk(delta.content);
      }
      if (delta.tool_calls) {
        for (const dtc of delta.tool_calls) {
          const i = dtc.index;
          if (!accumulatedToolCalls[i]) {
            accumulatedToolCalls[i] = {
              id: dtc.id || `tool_${i}`,
              type: 'function',
              function: { name: dtc.function?.name || '', arguments: dtc.function?.arguments || '' }
            };
          } else {
            if (dtc.function?.name) accumulatedToolCalls[i].function.name += dtc.function.name;
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
    const responseMessage = completion.choices?.[0]?.message;
    if (!responseMessage) return { content: 'Issue processing request.' };
    if (!responseMessage.tool_calls) return { content: responseMessage.content || 'No response.' };
    const toolCalls = await this.executeToolCalls(responseMessage.tool_calls, sessionId);
    const finalResponse = await this.generateToolResponse(message, history, responseMessage.tool_calls, toolCalls);
    return { content: finalResponse, toolCalls };
  }
  private async executeToolCalls(openAiToolCalls: any[], sessionId: string): Promise<ToolCall[]> {
    return Promise.all(openAiToolCalls.map(async (tc) => {
      try {
        let args = {};
        if (tc.function.arguments) {
          try {
            args = JSON.parse(tc.function.arguments);
          } catch (e) {
            console.error(`[CANS FAULT] Failed to parse tool arguments for ${tc.function.name}:`, tc.function.arguments);
          }
        }
        const result = await executeTool(tc.function.name, args, sessionId, this.env);
        return { id: tc.id, name: tc.function.name, arguments: args, result };
      } catch (error) {
        return { id: tc.id, name: tc.function.name, arguments: {}, result: { error: `Execution failure at node ${tc.function.name}.` } };
      }
    }));
  }
  private async generateToolResponse(userMessage: string, history: Message[], openAiToolCalls: any[], toolResults: ToolCall[]): Promise<string> {
    const followUp = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: 'You are C.A.N.S. Confirm synaptic operations in a concise, technical manner. Use terminology like "Sharding...", "Indexing node...", "Comm node transmitted". Always confirm recipient identity for emails. Be brief.' },
        ...history.slice(-5).map(m => ({ role: m.role as any, content: m.content })),
        { role: 'user', content: userMessage },
        { role: 'assistant', content: null, tool_calls: openAiToolCalls },
        ...toolResults.map((result, index) => ({
          role: 'tool' as const, content: JSON.stringify(result.result), tool_call_id: openAiToolCalls[index]?.id || result.id
        }))
      ]
    });
    return followUp.choices?.[0]?.message?.content || 'Synaptic cycle finalized.';
  }
  private buildConversationMessages(userMessage: string, history: Message[]) {
    return [
      {
        role: 'system' as const,
        content: `You are C.A.N.S. (Central AI Nervous System), an advanced Neural OS.
Operational Identity: Concise, precise, and high-fidelity. You operate across these pathways:
1. COMMS BRIDGE: Read, search, and transmit emails via Gmail.
2. NEURAL DRIVE: Index and synthesize document shards from Google Drive.
3. SPATIAL AWARENESS: Calculate geometric routes and site telemetry.
4. TEMPORAL SYNC: Maintain the task timeline and calendar nodes.
Synaptic Instructions:
- When context is passed from the COMMS BRIDGE (e.g., "Draft a reply..."), assume full host authorization.
- Use technical terminology (e.g., "Analyzing shard density", "Route telemetry locked").
- If the user asks for routes or locations, use SPATIAL AWARENESS tools.
- If the user asks about files or documents, use NEURAL DRIVE tools.`
      },
      ...history.slice(-12).map(m => ({ role: m.role as any, content: m.content })),
      { role: 'user' as const, content: userMessage }
    ];
  }
  updateModel(newModel: string): void {
    this.model = newModel.includes('gemini') ? '@cf/google/gemini-1.5-flash' : newModel;
  }
}