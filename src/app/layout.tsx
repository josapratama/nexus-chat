import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NexusChat - Multi-Provider AI Platform",
  description:
    "Chat with multiple AI models including OpenRouter, local Ollama, GPT-4o, Claude 3.5, and Gemini with RAG document search.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
