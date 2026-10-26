"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bot,
  Sparkles,
  Shield,
  Cpu,
  Zap,
  FileText,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Terminal,
  Server,
  Globe,
  MessageSquare,
  Code2,
  HardDrive,
  Copy,
  Check,
} from "lucide-react";

export default function LandingPage() {
  const [copiedCode, setCopiedCode] = useState(false);

  const dockerCommand = "docker compose up -d";

  function copyDockerCommand() {
    navigator.clipboard.writeText(dockerCommand);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Background Glow Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-purple-600/10 blur-[130px] rounded-full" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-blue-500/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-10 right-0 w-[500px] h-[400px] bg-indigo-500/10 blur-[130px] rounded-full" />
      </div>

      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 transition hover:opacity-90">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-500/25">
              <Bot className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Nexus<span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Chat</span>
            </span>
          </Link>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#privacy" className="hover:text-white transition">Local AI & Privacy</a>
            <a href="#rag" className="hover:text-white transition">RAG Documents</a>
            <a href="#deployment" className="hover:text-white transition">Self-Hosting</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/30 active:scale-95"
            >
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 sm:pt-28 sm:pb-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-300 shadow-inner backdrop-blur-sm mb-8 animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            <span>Self-Hosted & Multi-Provider AI Platform</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">Docker & Raspberry Pi Ready</span>
          </div>

          {/* Main Headline */}
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-white sm:text-6xl sm:leading-tight">
            Chat with Any AI.{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
              Keep 100% of Your Data Private.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 sm:text-xl leading-relaxed">
            Run local open-source LLMs offline with Ollama, or connect seamlessly to GPT-4o, Claude 3.5, Gemini, and Mistral. Integrated with smart RAG document search and custom prompt libraries.
          </p>

          {/* Call to Actions */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-indigo-500/25 transition hover:brightness-110 active:scale-98"
            >
              <Sparkles className="h-5 w-5" />
              <span>Start Chatting Now</span>
              <ArrowRight className="h-5 w-5 ml-1" />
            </Link>
            <a
              href="#preview"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-7 py-3.5 text-base font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <Terminal className="h-4 w-4 text-slate-400" />
              <span>Explore Features</span>
            </a>
          </div>

          {/* Quick Metrics */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-3xl mx-auto border-y border-slate-800/80 py-6">
            <div>
              <p className="text-2xl font-bold text-white">0%</p>
              <p className="text-xs text-slate-400 mt-1">Data Leakage with Local AI</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">5+ Providers</p>
              <p className="text-xs text-slate-400 mt-1">Ollama, OpenAI, Claude, etc.</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">RAG Enabled</p>
              <p className="text-xs text-slate-400 mt-1">PDF & Markdown Search</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">100%</p>
              <p className="text-xs text-slate-400 mt-1">Self-Hosted Docker Control</p>
            </div>
          </div>
        </div>

        {/* Product UI Mockup Preview */}
        <div id="preview" className="mt-16 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl shadow-indigo-950/50 backdrop-blur-xl overflow-hidden">
            {/* Window Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 bg-slate-950/60">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 text-xs font-mono text-slate-400">NexusChat Workspace — Local Ollama (llama3.2:1b)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
                  <Shield className="h-3 w-3" /> 100% Local Encrypted
                </span>
              </div>
            </div>

            {/* Chat Thread Demonstration */}
            <div className="p-6 space-y-5 bg-gradient-to-b from-slate-900/50 to-slate-950/70">
              {/* User Message */}
              <div className="flex justify-end">
                <div className="max-w-xl rounded-2xl rounded-tr-sm bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm text-white shadow-md">
                  Halo! Bisa bantu buatkan endpoint REST API sederhana di Node.js untuk upload dokumen dan query RAG secara lokal?
                </div>
              </div>

              {/* Bot Message */}
              <div className="flex gap-3 justify-start">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-blue-500 text-white shadow-md">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="max-w-2xl rounded-2xl rounded-tl-sm border border-slate-800 bg-slate-900/90 p-4 text-sm text-slate-200 space-y-3">
                  <p>
                    Tentu! Anda bisa menggunakan modul bawaan Express dan pipeline chunking lokal untuk memproses dokumen tanpa mengirim data keluar dari server Anda:
                  </p>
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-blue-300">
                    <div className="flex justify-between text-slate-400 mb-2 border-b border-slate-800 pb-1 text-[11px]">
                      <span>javascript</span>
                      <span className="text-emerald-400">RAG Chunking Pipeline</span>
                    </div>
                    <code>{`app.post('/api/documents', upload.single('file'), async (req, res) => {
  const chunks = await createDocumentChunks(req.file.buffer);
  await db.documentChunk.createMany({ data: chunks });
  res.json({ success: true, indexedChunks: chunks.length });
});`}</code>
                  </div>
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                    <span>Diproses secara offline menggunakan model Ollama lokal dalam waktu 0.4s.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-20 border-t border-slate-800/80 bg-slate-950/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-semibold tracking-wider uppercase text-blue-400">Enterprise Capabilities</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Everything You Need in a Modern AI Platform
            </p>
            <p className="mt-4 text-slate-400 text-base">
              Built from scratch with modern web standards, privacy-first architecture, and frictionless user experience.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group rounded-2xl border border-slate-800/90 bg-slate-900/50 p-7 transition hover:border-blue-500/50 hover:bg-slate-900/80">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20 group-hover:scale-105 transition">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">100% Local AI Privacy</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Connect directly to your local Ollama instance. Your conversations, confidential documents, and prompts never leave your private server or network.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-2xl border border-slate-800/90 bg-slate-900/50 p-7 transition hover:border-indigo-500/50 hover:bg-slate-900/80">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">Multi-Provider Freedom</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Seamlessly toggle between local Ollama models and cloud APIs like OpenAI (GPT-4o), Anthropic (Claude 3.5), Google (Gemini), and Mistral in a unified UI.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-2xl border border-slate-800/90 bg-slate-900/50 p-7 transition hover:border-purple-500/50 hover:bg-slate-900/80">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600/10 text-purple-400 border border-purple-500/20 group-hover:scale-105 transition">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">RAG Document Intelligence</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Upload your PDFs, Markdown, TXT, or CSV files. NexusChat chunks and indexes them for contextual, hyper-accurate answers backed by your own data.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group rounded-2xl border border-slate-800/90 bg-slate-900/50 p-7 transition hover:border-emerald-500/50 hover:bg-slate-900/80">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition">
                <HardDrive className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">Raspberry Pi & Homelab Ready</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Engineered with a lightweight footprint. Runs smoothly on a Raspberry Pi 4/5, mini PC, NAS, or home server using standard Docker Compose.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group rounded-2xl border border-slate-800/90 bg-slate-900/50 p-7 transition hover:border-amber-500/50 hover:bg-slate-900/80">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-600/10 text-amber-400 border border-amber-500/20 group-hover:scale-105 transition">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">Prompt Template Library</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Save and organize reusable prompts for coding, content writing, analysis, or daily tasks. Insert them into chat with a single click.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group rounded-2xl border border-slate-800/90 bg-slate-900/50 p-7 transition hover:border-cyan-500/50 hover:bg-slate-900/80">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-600/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-105 transition">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">Multi-User & Admin Console</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Includes role-based access control (Admin & User), user management, encrypted per-user API key storage, and usage statistics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Deployment & Docker Section */}
      <section id="deployment" className="py-20 border-t border-slate-800/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-8 sm:p-12 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-400 mb-4">
                  <Server className="h-3.5 w-3.5" /> Instant Self-Host
                </div>
                <h2 className="text-3xl font-bold text-white sm:text-4xl tracking-tight">
                  Deploy in Seconds with Docker Compose
                </h2>
                <p className="mt-4 text-slate-400 leading-relaxed">
                  Everything is pre-configured: Next.js frontend, PostgreSQL database with auto-migration, and Ollama engine orchestrated together out of the box.
                </p>

                <ul className="mt-6 space-y-3 text-sm text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>No complex database setup — automated Prisma initialization</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Works offline on isolated local networks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Zero telemetry or third-party tracking</span>
                  </li>
                </ul>

                <div className="mt-8">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                  >
                    <span>Launch NexusChat</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Terminal Code Snippet */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-xl font-mono text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                    <span className="ml-2 text-[11px]">bash — deploy</span>
                  </div>
                  <button
                    onClick={copyDockerCommand}
                    className="flex items-center gap-1 rounded px-2 py-1 hover:bg-slate-800 text-slate-400 hover:text-white transition"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-[11px] text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span className="text-[11px]">Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="pt-4 space-y-2 text-slate-300">
                  <p className="text-slate-500"># 1. Clone repository</p>
                  <p className="text-blue-400">git clone https://github.com/josapratama/nexus-chat.git</p>
                  <p className="text-blue-400">cd nexus-chat</p>
                  <p className="text-slate-500 pt-2"># 2. Run with Docker Compose</p>
                  <p className="text-emerald-400 font-semibold">docker compose up -d --build</p>
                  <p className="text-slate-500 pt-2"># 3. Access your private AI</p>
                  <p className="text-slate-400">Ready at: <span className="text-indigo-400 underline">http://localhost:3000</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white">
                <Bot className="h-4 w-4" />
              </div>
              <span className="text-base font-bold text-white">NexusChat</span>
              <span className="text-xs text-slate-500">© {new Date().getFullYear()} All rights reserved.</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-400">
              <Link href="/login" className="hover:text-white transition">Sign In</Link>
              <Link href="/register" className="hover:text-white transition">Register</Link>
              <a href="#features" className="hover:text-white transition">Features</a>
              <a href="#privacy" className="hover:text-white transition">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
