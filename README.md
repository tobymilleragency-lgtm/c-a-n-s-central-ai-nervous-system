# Cloudflare Workers AI Chat Agent

[cloudflarebutton]

A production-ready **Cloudflare Workers** template for building AI-powered chat applications. Features persistent multi-session chat with streaming responses, tool calling (weather, web search, MCP integration), and a modern React frontend. Powered by Cloudflare's Durable Objects, Agents SDK, and AI Gateway.

## ✨ Features

- **Multi-Session Chat**: Create, list, switch, rename, and delete persistent chat sessions
- **AI-Powered Conversations**: Streaming chat with Google Gemini models (Flash/Pro) via Cloudflare AI Gateway
- **Tool Calling**: Built-in tools for weather (`get_weather`), web search (`web_search`), and extensible MCP (Model Context Protocol) integration
- **Modern UI**: Responsive React app with shadcn/ui, Tailwind CSS, dark mode, and session sidebar
- **Production-Ready**: TypeScript, error handling, session stats, client error reporting
- **Session Management**: Activity tracking, auto-generated titles from first message, bulk clear
- **Developer-Friendly**: Hot reload, Bun scripts, Vite bundling, Cloudflare deploy-ready

## 🛠️ Tech Stack

- **Backend**: Cloudflare Workers, Durable Objects, [Agents SDK](https://developers.cloudflare.com/agents/), Hono
- **AI**: Cloudflare AI Gateway, OpenAI SDK (Gemini compatible), OpenRouter support
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui
- **Tools**: SerpAPI (web search), MCP SDK (extensible tools)
- **Package Manager**: Bun
- **Other**: Zustand (state), TanStack Query, Framer Motion, Lucide Icons

## 🚀 Quick Start

1. **Clone & Install**
   ```bash
   git clone <your-repo>
   cd cans-neural-system-hz-0jddlmjuvlct-4kq6a
   bun install
   ```

2. **Configure Environment**
   Edit `wrangler.jsonc` and set your secrets:
   ```json
   {
     "vars": {
       "CF_AI_BASE_URL": "https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/openai",
       "CF_AI_API_KEY": "{your_ai_gateway_token}",
       "SERPAPI_KEY": "{your_serpapi_key}",
       "OPENROUTER_API_KEY": "{optional_openrouter_key}"
     }
   }
   ```
   Or use Wrangler CLI:
   ```bash
   bunx wrangler secret put CF_AI_BASE_URL
   bunx wrangler secret put CF_AI_API_KEY
   bunx wrangler secret put SERPAPI_KEY
   ```

3. **Run Locally**
   ```bash
   bun dev  # Starts Vite dev server (frontend + worker proxy)
   ```
   Open `http://localhost:3000` (or `$PORT`).

4. **Deploy**
   ```bash
   bun run deploy  # Builds & deploys to Cloudflare
   ```

## 💻 Development

- **Frontend**: Edit `src/` – hot reloads on `bun dev`
- **Worker Routes**: Add custom API routes in `worker/userRoutes.ts`
- **Tools**: Extend in `worker/tools.ts` or add MCP servers in `worker/mcp-client.ts`
- **Chat Logic**: Customize `worker/chat.ts` or `worker/agent.ts`
- **Models**: Switch via UI or API (`POST /api/chat/{id}/model`)
- **Type Generation**: `bun cf-typegen` (generates `worker/env.d.ts`)
- **Lint**: `bun lint`
- **Build**: `bun build` (outputs to `dist/`)

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/sessions` | List sessions |
| `POST` | `/api/sessions` | Create session `{title?, sessionId?, firstMessage?}` |
| `DELETE` | `/api/sessions/:id` | Delete session |
| `PUT` | `/api/sessions/:id/title` | Update title `{title}` |
| `GET` | `/api/sessions/stats` | Session count |
| `DELETE` | `/api/sessions` | Clear all |
| `POST/GET/DELETE` | `/api/chat/:sessionId/{chat\|messages\|clear\|model}` | Chat operations |

Chat payload: `{message, model?, stream?}`

## ☁️ Deployment to Cloudflare

1. **Connect GitHub Repo** (recommended for CI/CD)
2. **Configure via Dashboard** or CLI:
   ```bash
   bunx wrangler deploy --name my-chat-app
   ```
3. **Custom Domain**: Add in Workers dashboard
4. **Environment Vars**: Set in dashboard under "Settings > Variables"

[cloudflarebutton]

## 🤝 Contributing

1. Fork & clone
2. `bun install`
3. Make changes in `src/` (UI) or `worker/` (backend)
4. Test locally: `bun dev`
5. PR to `main`

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.

## 🙌 Support

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare AI Gateway](https://developers.cloudflare.com/ai-gateway/)
- Issues: [GitHub Issues](https://github.com/user/repo/issues)

Built with ❤️ for Cloudflare developers.