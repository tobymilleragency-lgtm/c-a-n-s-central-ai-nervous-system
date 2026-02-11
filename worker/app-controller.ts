import { DurableObject } from 'cloudflare:workers';
import type { SessionInfo, ConnectedService, Message, SystemStats } from './types';
import type { Env } from './core-utils';
export interface ServiceTokens {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
  scopes: string[];
  email?: string;
}
export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'completed' | 'in-progress';
  createdAt: number;
}
export interface Memory {
  id: string;
  content: string;
  category: string;
  timestamp: number;
}
export class AppController extends DurableObject<Env> {
  private sessions = new Map<string, SessionInfo>();
  private loaded = false;
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }
  private async ensureLoaded(): Promise<void> {
    if (!this.loaded) {
      const stored = await this.ctx.storage.get<Record<string, SessionInfo>>('sessions') || {};
      this.sessions = new Map(Object.entries(stored));
      this.loaded = true;
    }
  }
  private async persist(): Promise<void> {
    await this.ctx.storage.put('sessions', Object.fromEntries(this.sessions));
  }
  async updateSessionActivity(sessionId: string): Promise<void> {
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActive = Date.now();
      await this.persist();
    }
  }
  async saveMessage(sessionId: string, message: Message): Promise<void> {
    const key = `msg:${sessionId}:${message.id}`;
    await this.ctx.storage.put(key, message);
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActive = Date.now();
      if (session.title.startsWith('Chat ') && message.role === 'user') {
        session.title = message.content.slice(0, 40) + (message.content.length > 40 ? '...' : '');
      }
      await this.persist();
    }
  }
  async getConversationMessages(sessionId: string): Promise<Message[]> {
    const options = { prefix: `msg:${sessionId}:` };
    const list = await this.ctx.storage.list<Message>(options);
    return Array.from(list.values()).sort((a, b) => a.timestamp - b.timestamp);
  }
  async getSystemStats(): Promise<SystemStats> {
    const messages = await this.ctx.storage.list({ prefix: 'msg:' });
    const tasks = await this.ctx.storage.list({ prefix: 'task:' });
    const memories = await this.ctx.storage.list({ prefix: 'mem:' });
    await this.ensureLoaded();
    return {
      messages: messages.size,
      tasks: tasks.size,
      memories: memories.size,
      sessions: this.sessions.size
    };
  }
  async saveServiceTokens(sessionId: string, service: string, tokens: ServiceTokens, email: string): Promise<void> {
    const tokenKey = `tokens:${sessionId}:${service}:${email}`;
    const metaKey = `service:${sessionId}:${service}:${email}`;
    await this.ctx.storage.put(tokenKey, { ...tokens, email });
    const meta: ConnectedService = {
      name: service,
      email: email,
      status: 'active',
      lastSync: new Date().toISOString(),
      connectedAt: new Date().toISOString(),
      scopes: tokens.scopes
    };
    await this.ctx.storage.put(metaKey, meta);
    const accountsKey = `accounts:${sessionId}:${service}`;
    const accounts = await this.ctx.storage.get<string[]>(accountsKey) || [];
    if (!accounts.includes(email)) {
      accounts.push(email);
      await this.ctx.storage.put(accountsKey, accounts);
    }
  }
  async getServiceTokens(sessionId: string, service: string, email?: string): Promise<ServiceTokens | null> {
    if (!email) {
      const accounts = await this.ctx.storage.get<string[]>(`accounts:${sessionId}:${service}`) || [];
      if (accounts.length === 0) return null;
      email = accounts[0];
    }
    const key = `tokens:${sessionId}:${service}:${email}`;
    return await this.ctx.storage.get<ServiceTokens>(key) || null;
  }
  async listConnectedServices(sessionId: string): Promise<ConnectedService[]> {
    const options = { prefix: `service:${sessionId}:` };
    const list = await this.ctx.storage.list<ConnectedService>(options);
    const storedServices = Array.from(list.values());
    if (storedServices.length > 0) return storedServices;
    return [
      { name: 'gmail', status: 'disconnected', scopes: [] },
      { name: 'calendar', status: 'disconnected', scopes: [] }
    ];
  }
  async addSession(sessionId: string, title?: string): Promise<void> {
    await this.ensureLoaded();
    const now = Date.now();
    this.sessions.set(sessionId, {
      id: sessionId,
      title: title || `Chat ${new Date(now).toLocaleDateString()}`,
      createdAt: now,
      lastActive: now
    });
    await this.persist();
  }
  async removeSession(sessionId: string): Promise<boolean> {
    await this.ensureLoaded();
    const deleted = this.sessions.delete(sessionId);
    if (deleted) {
      await this.persist();
      const msgKeys = await this.ctx.storage.list({ prefix: `msg:${sessionId}:` });
      const taskKeys = await this.ctx.storage.list({ prefix: `task:${sessionId}:` });
      const memKeys = await this.ctx.storage.list({ prefix: `mem:${sessionId}:` });
      const serviceKeys = await this.ctx.storage.list({ prefix: `service:${sessionId}:` });
      const tokenKeys = await this.ctx.storage.list({ prefix: `tokens:${sessionId}:` });
      const accountKeys = await this.ctx.storage.list({ prefix: `accounts:${sessionId}:` });
      const allKeys = [
        ...msgKeys.keys(), ...taskKeys.keys(), ...memKeys.keys(),
        ...serviceKeys.keys(), ...tokenKeys.keys(), ...accountKeys.keys()
      ];
      if (allKeys.length > 0) await this.ctx.storage.delete(allKeys);
    }
    return deleted;
  }
  async listSessions(): Promise<SessionInfo[]> {
    await this.ensureLoaded();
    return Array.from(this.sessions.values()).sort((a, b) => b.lastActive - a.lastActive);
  }
  async addMemory(sessionId: string, memory: Omit<Memory, 'id' | 'timestamp'>): Promise<void> {
    const id = crypto.randomUUID();
    const key = `mem:${sessionId}:${id}`;
    const data: Memory = { ...memory, id, timestamp: Date.now() };
    await this.ctx.storage.put(key, data);
  }
  async listMemories(sessionId: string): Promise<Memory[]> {
    const list = await this.ctx.storage.list<Memory>({ prefix: `mem:${sessionId}:` });
    return Array.from(list.values());
  }
  async deleteMemory(sessionId: string, memoryId: string): Promise<void> {
    const key = `mem:${sessionId}:${memoryId}`;
    await this.ctx.storage.delete(key);
  }
  async createTask(sessionId: string, task: Omit<Task, 'id' | 'createdAt'>): Promise<void> {
    const id = crypto.randomUUID();
    const key = `task:${sessionId}:${id}`;
    const data: Task = { ...task, id, createdAt: Date.now() };
    await this.ctx.storage.put(key, data);
  }
  async listTasks(sessionId: string): Promise<Task[]> {
    const list = await this.ctx.storage.list<Task>({ prefix: `task:${sessionId}:` });
    return Array.from(list.values()).sort((a, b) => b.createdAt - a.createdAt);
  }
  async updateTaskStatus(sessionId: string, taskId: string, status: Task['status']): Promise<void> {
    const key = `task:${sessionId}:${taskId}`;
    const task = await this.ctx.storage.get<Task>(key);
    if (task) {
      task.status = status;
      await this.ctx.storage.put(key, task);
    }
  }
}