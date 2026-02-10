import { DurableObject } from 'cloudflare:workers';
import type { SessionInfo, ConnectedService } from './types';
import type { Env } from './core-utils';
export interface ServiceTokens {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
  scopes: string[];
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
  async saveServiceTokens(sessionId: string, service: string, tokens: ServiceTokens): Promise<void> {
    const key = `tokens:${sessionId}:${service}`;
    const metaKey = `service:${sessionId}:${service}`;
    await this.ctx.storage.put(key, tokens);
    const meta: ConnectedService = {
      name: service,
      status: 'active',
      lastSync: new Date().toISOString(),
      connectedAt: new Date().toISOString(),
      scopes: tokens.scopes
    };
    await this.ctx.storage.put(metaKey, meta);
  }
  async getServiceTokens(sessionId: string, service: string): Promise<ServiceTokens | null> {
    const key = `tokens:${sessionId}:${service}`;
    return await this.ctx.storage.get<ServiceTokens>(key) || null;
  }
  async listConnectedServices(sessionId: string): Promise<ConnectedService[]> {
    const options = { prefix: `service:${sessionId}:` };
    const list = await this.ctx.storage.list<ConnectedService>(options);
    return Array.from(list.values());
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
      // Cleanup tokens for this session
      const tokenPrefix = `tokens:${sessionId}:`;
      const metaPrefix = `service:${sessionId}:`;
      const keys = await this.ctx.storage.list({ prefix: tokenPrefix });
      const metaKeys = await this.ctx.storage.list({ prefix: metaPrefix });
      const allKeys = [...Array.from(keys.keys()), ...Array.from(metaKeys.keys())];
      if (allKeys.length > 0) {
        await this.ctx.storage.delete(allKeys);
      }
    }
    return deleted;
  }
  async updateSessionActivity(sessionId: string): Promise<void> {
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActive = Date.now();
      await this.persist();
    }
  }
  async updateSessionTitle(sessionId: string, title: string): Promise<boolean> {
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.title = title;
      await this.persist();
      return true;
    }
    return false;
  }
  async listSessions(): Promise<SessionInfo[]> {
    await this.ensureLoaded();
    return Array.from(this.sessions.values()).sort((a, b) => b.lastActive - a.lastActive);
  }
  async getSessionCount(): Promise<number> {
    await this.ensureLoaded();
    return this.sessions.size;
  }
  async getSession(sessionId: string): Promise<SessionInfo | null> {
    await this.ensureLoaded();
    return this.sessions.get(sessionId) || null;
  }
  async clearAllSessions(): Promise<number> {
    await this.ensureLoaded();
    const count = this.sessions.size;
    this.sessions.clear();
    await this.persist();
    await this.ctx.storage.deleteAll();
    return count;
  }
}