# NexusChat

<div align="center">

**A self-hosted, multi-provider AI chat application built with Next.js 16**

Chat with OpenAI, Anthropic, Google Gemini, Mistral, and local Ollama models — all in one beautiful interface.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)](https://prisma.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](https://docker.com)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

</div>

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Development](#local-development)
  - [Docker Deployment](#docker-deployment)
- [Environment Variables](#environment-variables)
- [API Keys](#api-keys)
- [Ollama (Local AI)](#ollama-local-ai)
- [Available Scripts](#available-scripts)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Core Chat

- **Multi-provider support** — Switch between OpenAI, Anthropic, Google Gemini, Mistral, and Ollama without leaving the app
- **Real-time streaming** — Token-by-token streaming response with live typing indicator
- **Conversation history** — All chats are persisted to PostgreSQL and accessible across sessions
- **Edit & delete messages** — Edit any sent message and get a fresh AI response; delete messages and their replies
- **Regenerate response** — Re-run the last message with the same or different model
- **Markdown rendering** — Full GFM support including tables, code blocks with syntax highlighting, and math formulas
- **Model selector** — Switch provider and model per conversation from the header

### User & Auth

- **Email/password authentication** — Secure login and registration powered by NextAuth.js v5
- **BYOK (Bring Your Own Key)** — Users can add their own API keys per provider; personal keys take priority over system keys
- **Role-based access** — `USER` and `ADMIN` roles with different permissions

### RAG (Retrieval Augmented Generation)

- **Document upload** — Upload `.txt`, `.md`, `.csv`, `.json`, and `.pdf` files
- **Automatic chunking** — Documents are split into overlapping chunks for better retrieval
- **Keyword search** — Search across all uploaded documents before starting a chat

### Productivity

- **Prompt Library** — Create, browse, and copy reusable prompt templates with categories (General, Coding, Writing, Business)
- **Export conversations** — Download any conversation as Markdown or JSON
- **File attachments** — Attach images and files to messages (for vision-capable models)

### Admin

- **Dashboard** — View total users, conversations, messages, and token usage
- **Usage breakdown** — See token consumption per AI provider
- **User management** — Promote/demote users to admin role

### Infrastructure

- **Rate limiting** — Configurable per-user request limits (default: 50 req/min)
- **Docker Compose** — One-command setup with PostgreSQL, Ollama, and the app
- **Standalone output** — Optimized Next.js standalone build for minimal Docker image size
- **GPU support** — Optional NVIDIA GPU passthrough for Ollama (commented in docker-compose)

---

## Tech Stack

| Category         | Technology                                                                       |
| ---------------- | -------------------------------------------------------------------------------- |
| Framework        | [Next.js 16](https://nextjs.org) (App Router)                                    |
| Language         | [TypeScript 5](https://typescriptlang.org)                                       |
| Styling          | [Tailwind CSS 4](https://tailwindcss.com)                                        |
| State Management | [Zustand 5](https://zustand-demo.pmnd.rs)                                        |
| Database         | [PostgreSQL](https://postgresql.org)                                             |
| ORM              | [Prisma 7](https://prisma.io) with `@prisma/adapter-pg`                          |
| Auth             | [NextAuth.js v5](https://authjs.dev) (Credentials)                               |
| AI SDK           | [Vercel AI SDK](https://sdk.vercel.ai)                                           |
| AI Providers     | OpenAI, Anthropic, Google, Mistral, Ollama                                       |
| Markdown         | [react-markdown](https://github.com/remarkjs/react-markdown) + rehype-highlight  |
| Icons            | [Lucide React](https://lucide.dev)                                               |
| Containerization | [Docker](https://docker.com) + [Docker Compose](https://docs.docker.com/compose) |

---

## Project Structure

```
nexus-chat/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Demo data seeder
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/         # Login page
│   │   │   └── register/      # Registration page
│   │   ├── admin/             # Admin dashboard page
│   │   ├── api/
│   │   │   ├── admin/         # Admin stats & user management
│   │   │   ├── auth/          # NextAuth routes + register
│   │   │   ├── chat/          # Streaming chat endpoint
│   │   │   ├── conversations/ # CRUD conversations & export
│   │   │   ├── documents/     # RAG document management
│   │   │   ├── models/        # Available models list
│   │   │   ├── prompts/       # Prompt templates
│   │   │   ├── upload/        # File upload handler
│   │   │   └── user/          # API key management
│   │   ├── chat/              # Main chat UI page
│   │   ├── documents/         # RAG documents page
│   │   ├── prompts/           # Prompt library page
│   │   └── settings/          # User settings page
│   ├── components/
│   │   ├── admin/             # Admin dashboard component
│   │   ├── chat/              # Chat UI (area, input, sidebar, bubbles)
│   │   ├── documents/         # Document manager component
│   │   ├── prompts/           # Prompt library component
│   │   ├── settings/          # Settings form component
│   │   └── ui/                # Reusable UI primitives
│   ├── lib/
│   │   ├── ai/providers.ts    # AI provider configuration
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── rag/chunker.ts     # Document chunking utilities
│   │   ├── rate-limit.ts      # In-memory rate limiter
│   │   ├── store.ts           # Zustand global state
│   │   └── utils.ts           # Shared utilities
│   ├── proxy.ts               # Auth middleware (Next.js 16 proxy)
│   └── types/
│       └── next-auth.d.ts     # NextAuth type extensions
├── .env.example               # Environment variable template
├── docker-compose.yml         # Full stack Docker setup
├── Dockerfile                 # Multi-stage production build
├── next.config.ts             # Next.js configuration
├── prisma.config.ts           # Prisma 7 configuration
└── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** 20 or later
- **Docker** and **Docker Compose** (for database and Ollama)
- A GitHub account (optional, for deployment)

### Local Development

**1. Clone the repository**

```bash
git clone https://github.com/josapratama/nexus-chat.git
cd nexus-chat
```

**2. Install dependencies**

```bash
npm install
# or
bun install
```

**3. Set up environment variables**

```bash
cp .env.example .env
```

Edit `.env` and at minimum set:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nexuschat"
AUTH_SECRET="your-secret-here"   # generate: openssl rand -base64 32
```

**4. Start the database**

```bash
docker compose up db -d
```

**5. Run database migrations and seed**

```bash
npx prisma db push
npm run db:seed
```

**6. Start the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Demo accounts:**

| Role  | Email               | Password   |
| ----- | ------------------- | ---------- |
| Admin | `admin@example.com` | `admin123` |
| User  | `demo@example.com`  | `demo1234` |

---

### Docker Deployment

Deploy the full stack (app + PostgreSQL + Ollama) on any VPS with a single command.

**1. Clone and configure**

```bash
git clone https://github.com/josapratama/nexus-chat.git
cd nexus-chat
cp .env.example .env
# Edit .env with your values
```

**2. Build and start all services**

```bash
docker compose up -d
```

**3. Initialize the database**

```bash
docker compose exec app npx prisma db push
docker compose exec app npx tsx prisma/seed.ts
```

**4. Pull Ollama models** (optional)

```bash
docker compose exec ollama ollama pull llama3.1
docker compose exec ollama ollama pull mistral
docker compose exec ollama ollama pull codellama
```

**5. Access the app**

Open `http://your-server-ip:3000`

#### GPU Support (NVIDIA)

Uncomment the GPU section in `docker-compose.yml` for Ollama hardware acceleration:

```yaml
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: all
          capabilities: [gpu]
```

---

## Environment Variables

| Variable                       | Required | Default                  | Description                                 |
| ------------------------------ | -------- | ------------------------ | ------------------------------------------- |
| `DATABASE_URL`                 | ✅       | —                        | PostgreSQL connection string                |
| `AUTH_SECRET`                  | ✅       | —                        | NextAuth.js secret key                      |
| `AUTH_URL`                     | ✅       | —                        | App base URL (e.g. `http://localhost:3000`) |
| `OPENAI_API_KEY`               | ❌       | `""`                     | OpenAI API key (system fallback)            |
| `ANTHROPIC_API_KEY`            | ❌       | `""`                     | Anthropic API key (system fallback)         |
| `GOOGLE_GENERATIVE_AI_API_KEY` | ❌       | `""`                     | Google AI API key (system fallback)         |
| `MISTRAL_API_KEY`              | ❌       | `""`                     | Mistral API key (system fallback)           |
| `OLLAMA_BASE_URL`              | ❌       | `http://localhost:11434` | Ollama server URL                           |
| `RATE_LIMIT_MAX_REQUESTS`      | ❌       | `50`                     | Max requests per window per user            |
| `RATE_LIMIT_WINDOW_MS`         | ❌       | `60000`                  | Rate limit window in milliseconds           |
| `NEXT_PUBLIC_APP_NAME`         | ❌       | `AI Chat`                | Display name in the UI                      |

---

## API Keys

NexusChat supports two levels of API keys:

### System Keys (`.env`)

Set these for all users as a fallback. Users who don't add their own key will use the system key.

### User Keys (BYOK)

Users can add their own API keys at `/settings`. Personal keys always take priority over system keys. Keys are stored securely in the database.

**Supported providers:**

| Provider  | Get API Key                                                 |
| --------- | ----------------------------------------------------------- |
| OpenAI    | [platform.openai.com](https://platform.openai.com/api-keys) |
| Anthropic | [console.anthropic.com](https://console.anthropic.com)      |
| Google AI | [aistudio.google.com](https://aistudio.google.com/apikey)   |
| Mistral   | [console.mistral.ai](https://console.mistral.ai/api-keys)   |
| Ollama    | No key needed — runs locally                                |

---

## Ollama (Local AI)

Run AI models locally without any API costs using [Ollama](https://ollama.com).

**Quick setup with Docker:**

```bash
# Start Ollama container
docker compose up ollama -d

# Pull models
docker compose exec ollama ollama pull llama3.1      # 4.9 GB — general purpose
docker compose exec ollama ollama pull mistral       # 4.1 GB — fast and capable
docker compose exec ollama ollama pull codellama     # 3.8 GB — code generation
docker compose exec ollama ollama pull llava         # vision model
```

**Available Ollama models in the app:**

| Model      | Size   | Use Case               |
| ---------- | ------ | ---------------------- |
| Llama 3.1  | 4.9 GB | General purpose        |
| Mistral 7B | 4.1 GB | Fast, multilingual     |
| Code Llama | 3.8 GB | Code generation        |
| LLaVA      | ~4 GB  | Images + text (vision) |

> Models are fetched dynamically from your Ollama instance — any model you pull will appear automatically.

---

## Available Scripts

| Script               | Description                                                                            |
| -------------------- | -------------------------------------------------------------------------------------- |
| `npm run dev`        | Start development server with Turbopack                                                |
| `npm run build`      | Build for production                                                                   |
| `npm run start`      | Start production server (use `node .next/standalone/server.js` with standalone output) |
| `npm run lint`       | Run ESLint                                                                             |
| `npm run db:push`    | Push Prisma schema to database                                                         |
| `npm run db:migrate` | Run Prisma migrations                                                                  |
| `npm run db:seed`    | Seed demo users and prompt templates                                                   |
| `npm run db:studio`  | Open Prisma Studio (database GUI)                                                      |

---

## Supported Models

### OpenAI

- GPT-4o, GPT-4o Mini, GPT-4 Turbo

### Anthropic

- Claude Sonnet 4, Claude 3.5 Sonnet, Claude 3 Haiku

### Google

- Gemini 2.0 Flash, Gemini 1.5 Pro

### Mistral

- Mistral Large, Mistral Small

### Ollama (Local)

- Llama 3.1, Mistral 7B, Code Llama, LLaVA, and any other model you pull

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit using conventional commits: `git commit -m "feat: add your feature"`
4. Push and open a Pull Request

**Commit types:**

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation changes
- `refactor:` — code refactoring
- `chore:` — maintenance tasks

---

## License

MIT © [josapratama](https://github.com/josapratama)
