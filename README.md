# NexusChat

**NexusChat** is a modern, self-hosted AI chat interface supporting multiple providers — OpenAI, Anthropic, Google Gemini, Mistral, and local Ollama models — all in one place.

![NexusChat](https://img.shields.io/badge/Next.js-16-black?logo=next.js) ![Prisma](https://img.shields.io/badge/Prisma-7-blue?logo=prisma) ![Docker](https://img.shields.io/badge/Docker-ready-blue?logo=docker)

## Features

- **Multi-Provider** — Switch between OpenAI, Anthropic, Google, Mistral, and Ollama in one click
- **Streaming Responses** — Real-time token-by-token output
- **Conversation History** — Persistent chat with PostgreSQL
- **BYOK** — Bring your own API keys per provider
- **Local AI (Ollama)** — Run LLMs locally without API costs
- **Edit & Delete Messages** — Edit sent messages and regenerate AI responses
- **RAG** — Chat with your own documents (PDF, Markdown, CSV, JSON)
- **Prompt Library** — Save and reuse prompt templates
- **Admin Dashboard** — Monitor usage, manage users
- **Rate Limiting** — Built-in per-user request limits
- **Export Chats** — Download as Markdown or JSON
- **Docker Ready** — Full Docker Compose setup for VPS

## Tech Stack

| Layer    | Tech                                       |
| -------- | ------------------------------------------ |
| Frontend | Next.js 16, Tailwind CSS 4, Zustand        |
| Backend  | Next.js API Routes, Vercel AI SDK          |
| Database | PostgreSQL, Prisma 7                       |
| Auth     | NextAuth.js v5                             |
| AI       | OpenAI, Anthropic, Google, Mistral, Ollama |
| Deploy   | Docker Compose                             |

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/nexus-chat.git
cd nexus-chat
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env — set DATABASE_URL and optionally API keys
```

### 3. Start database and Ollama

```bash
docker compose up db ollama -d
```

### 4. Setup database

```bash
npx prisma db push
npm run db:seed
```

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Demo accounts:**

- Admin: `admin@example.com` / `admin123`
- User: `demo@example.com` / `demo1234`

## Docker Deployment (VPS)

```bash
# Clone, configure .env, then:
docker compose up -d

# Run migrations
docker compose exec app npx prisma db push
docker compose exec app npx tsx prisma/seed.ts

# Pull Ollama models
docker compose exec ollama ollama pull llama3.1
```

## Environment Variables

| Variable                       | Description                                               |
| ------------------------------ | --------------------------------------------------------- |
| `DATABASE_URL`                 | PostgreSQL connection string                              |
| `AUTH_SECRET`                  | NextAuth secret (generate with `openssl rand -base64 32`) |
| `OPENAI_API_KEY`               | OpenAI API key (optional)                                 |
| `ANTHROPIC_API_KEY`            | Anthropic API key (optional)                              |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI API key (optional)                              |
| `MISTRAL_API_KEY`              | Mistral API key (optional)                                |
| `OLLAMA_BASE_URL`              | Ollama URL (default: `http://localhost:11434`)            |

## Scripts

| Command             | Description              |
| ------------------- | ------------------------ |
| `npm run dev`       | Start development server |
| `npm run build`     | Build for production     |
| `npm run db:push`   | Push schema to database  |
| `npm run db:seed`   | Seed demo data           |
| `npm run db:studio` | Open Prisma Studio       |

## License

MIT
