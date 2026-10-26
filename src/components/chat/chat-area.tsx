"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import {
  PanelLeft,
  RotateCcw,
  Plus,
  Sparkles,
  Code2,
  Lightbulb,
  Mail,
  FileText,
  Bot,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "./message-bubble";
import { ChatInput } from "./chat-input";
import { ModelSelector } from "./model-selector";
import { useChatStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface UploadedFile {
  url: string;
  fileName: string;
  fileType: string;
  isImage: boolean;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const STARTER_PROMPTS = [
  {
    icon: Lightbulb,
    title: "Explain a concept",
    description: "Simplify quantum computing with everyday analogies",
    prompt: "Explain quantum computing in simple terms that anyone can understand, using everyday analogies.",
  },
  {
    icon: Code2,
    title: "Code Assistant",
    description: "Write a clean debounce hook in TypeScript",
    prompt: "Write a high-performance custom useDebounce hook in React and TypeScript with unit tests.",
  },
  {
    icon: Mail,
    title: "Draft an Email",
    description: "Write a professional proposal follow-up",
    prompt: "Write a polite and professional follow-up email to a client regarding an outstanding project proposal.",
  },
  {
    icon: FileText,
    title: "Analyze Documents",
    description: "Ask questions based on your uploaded RAG files",
    prompt: "Can you summarize the key findings and actionable recommendations from my uploaded documents?",
  },
];

export function ChatArea() {
  const {
    activeConversationId,
    messages: storedMessages,
    isSidebarOpen,
    selectedModel,
    selectedProvider,
    toggleSidebar,
    setConversations,
    setActiveConversation,
    conversations,
  } = useChatStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  // Ref to track currently loaded conversation ID to avoid wiping optimistic messages
  const loadedConvIdRef = useRef<string | null>(null);
  const isCreatingConvRef = useRef(false);

  // Sync messages from store when switching to a different existing conversation
  useEffect(() => {
    if (isCreatingConvRef.current) return;

    if (activeConversationId !== loadedConvIdRef.current) {
      loadedConvIdRef.current = activeConversationId;
      setMessages(
        storedMessages.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      );
      setStreamingContent("");
    }
  }, [storedMessages, activeConversationId]);

  // Auto-scroll to bottom on new messages or streaming chunk
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent, isLoading]);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    }
  }, [setConversations]);

  async function createNewChat() {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          provider: selectedProvider,
        }),
      });

      if (res.ok) {
        const conversation = await res.json();
        setConversations([conversation, ...conversations]);
        loadedConvIdRef.current = conversation.id;
        setActiveConversation(conversation.id);
        setMessages([]);
        setStreamingContent("");
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  }

  async function handleSend(content: string, files?: UploadedFile[]) {
    let convId = activeConversationId;

    // Build message text with attachment references
    let messageText = content;
    if (files && files.length > 0) {
      const fileSummary = files.map((f) => f.fileName).join(", ");
      messageText += `\n\n[Attached: ${fileSummary}]`;
    }

    // 1. Immediately render user message so it NEVER disappears
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageText,
    };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    // 2. If no active conversation, create one first
    if (!convId) {
      isCreatingConvRef.current = true;
      try {
        const res = await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: selectedModel,
            provider: selectedProvider,
          }),
        });

        if (res.ok) {
          const newConv = await res.json();
          convId = newConv.id;
          loadedConvIdRef.current = newConv.id;
          useChatStore.getState().setActiveConversation(newConv.id);
          useChatStore
            .getState()
            .setConversations([newConv, ...conversations]);
        }
      } catch (error) {
        console.error("Failed to create conversation:", error);
      } finally {
        isCreatingConvRef.current = false;
      }
    }

    // 3. Send to API and stream response
    await streamChat(convId || "", updatedMessages, files);
  }

  async function streamChat(
    convId: string,
    allMessages: ChatMessage[],
    files?: UploadedFile[],
    isRegenerate: boolean = false,
  ) {
    setIsLoading(true);
    setStreamingContent("");

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          conversationId: convId || undefined,
          model: selectedModel,
          provider: selectedProvider,
          attachments: files,
          isRegenerate,
          messages: allMessages.map((m) => ({
            role: m.role,
            parts: [{ type: "text", text: m.content }],
          })),
        }),
      });

      if (!res.ok) {
        let errorMsg = "Gagal memproses pesan AI.";
        try {
          const errData = await res.json();
          errorMsg = errData.error || errorMsg;
        } catch {
          const rawText = await res.text();
          if (rawText) errorMsg = rawText;
        }

        const errorAssistantMsg: ChatMessage = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `⚠️ ${errorMsg}`,
        };
        setMessages((prev) => [...prev, errorAssistantMsg]);
        setIsLoading(false);
        return;
      }

      // Read streaming response
      const reader = res.body?.getReader();
      if (!reader) {
        setIsLoading(false);
        return;
      }

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        setStreamingContent(fullContent);
      }

      // Commit completed assistant message
      if (fullContent) {
        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: fullContent,
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setStreamingContent("");
      }

      // Refresh conversations list to update title
      fetchConversations();
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Stream error:", error);
        const errorAssistantMsg: ChatMessage = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `⚠️ Terjadi kesalahan: ${(error as Error).message}`,
        };
        setMessages((prev) => [...prev, errorAssistantMsg]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }

  async function handleEditMessage(index: number, newContent: string) {
    const targetMsg = messages[index];
    const editedMessages = messages.slice(0, index);
    const editedMsg: ChatMessage = {
      ...targetMsg,
      content: newContent,
    };
    editedMessages.push(editedMsg);

    setMessages(editedMessages);

    // Persist edit to database if message exists in DB
    if (activeConversationId && targetMsg.id && !targetMsg.id.startsWith("user-")) {
      try {
        await fetch(
          `/api/conversations/${activeConversationId}/messages/${targetMsg.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: newContent }),
          },
        );
      } catch (err) {
        console.error("Failed to update message in database:", err);
      }
    }

    if (activeConversationId) {
      await streamChat(activeConversationId, editedMessages, undefined, true);
    }
  }

  async function handleDeleteMessage(index: number) {
    const targetMsg = messages[index];
    const newMessages = [...messages];

    // If next message is assistant, remove it too
    if (
      index + 1 < newMessages.length &&
      newMessages[index + 1].role === "assistant"
    ) {
      newMessages.splice(index, 2);
    } else {
      newMessages.splice(index, 1);
    }
    setMessages(newMessages);

    // Persist deletion to database
    if (activeConversationId && targetMsg.id && !targetMsg.id.startsWith("user-")) {
      try {
        await fetch(
          `/api/conversations/${activeConversationId}/messages/${targetMsg.id}`,
          { method: "DELETE" },
        );
      } catch (err) {
        console.error("Failed to delete message in database:", err);
      }
    }
  }

  async function handleRegenerate() {
    if (messages.length === 0 || !activeConversationId) return;

    // Remove last assistant message
    const withoutLast =
      messages[messages.length - 1].role === "assistant"
        ? messages.slice(0, -1)
        : messages;
    setMessages(withoutLast);

    await streamChat(activeConversationId, withoutLast, undefined, true);
  }

  function handleStop() {
    abortControllerRef.current?.abort();
    if (streamingContent) {
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: streamingContent,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setStreamingContent("");
    }
    setIsLoading(false);
  }

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden bg-slate-950 text-slate-100">
      {/* Header (Clean, Non-Redundant, Balanced) */}
      <header className="sticky top-0 z-20 flex h-13 shrink-0 items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-3.5 sm:px-5 backdrop-blur-xl">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Only show hamburger button if sidebar is closed or on mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn(
              "h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-900",
              isSidebarOpen && "md:hidden",
            )}
            title="Open Sidebar"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>

          {/* Clean Model Selector */}
          <ModelSelector />
        </div>

        {/* Right Header Actions (Zero Redundancy - Clean & Focused) */}
        <div className="flex items-center gap-1.5">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRegenerate}
              disabled={isLoading}
              className="h-8 text-xs font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
              title="Regenerate last response"
            >
              <RotateCcw className="h-3.5 w-3.5 sm:mr-1" />
              <span className="hidden sm:inline">Regenerate</span>
            </Button>
          )}
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        {messages.length === 0 && !streamingContent ? (
          /* Empty State / Welcome Screen */
          <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center text-center px-4 py-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 text-white shadow-xl shadow-indigo-500/25">
              <Bot className="h-7 w-7" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
              What can I help you with today?
            </h1>
            <p className="max-w-md text-xs sm:text-sm text-slate-400 mb-8 leading-relaxed">
              Ask anything, run local models with Ollama, or upload documents to query them using RAG.
            </p>

            {/* Prompt Cards Grid */}
            <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {STARTER_PROMPTS.map((card, idx) => {
                const IconComponent = card.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(card.prompt)}
                    className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-slate-900/60 p-4 shadow-sm transition-all hover:border-blue-500/50 hover:bg-slate-900/90 text-left"
                  >
                    <div>
                      <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <IconComponent className="h-3.5 w-3.5" />
                      </div>
                      <h3 className="text-xs font-semibold text-white mb-0.5 group-hover:text-blue-300 transition">
                        {card.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {card.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Conversation Thread - Max Width 3XL Perfectly Matching Input Box */
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id || index}
                role={message.role}
                content={message.content}
                onEdit={
                  message.role === "user"
                    ? (newContent) => handleEditMessage(index, newContent)
                    : undefined
                }
                onDelete={
                  message.role === "user"
                    ? () => handleDeleteMessage(index)
                    : undefined
                }
                onRegenerate={
                  message.role === "assistant" && index === messages.length - 1
                    ? handleRegenerate
                    : undefined
                }
              />
            ))}

            {/* In-progress streaming bubble */}
            {streamingContent && (
              <MessageBubble
                role="assistant"
                content={streamingContent}
                isStreaming={true}
              />
            )}

            {/* Thinking indicator before first stream token arrives */}
            {isLoading && !streamingContent && (
              <div className="flex gap-3 py-2 items-center">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-blue-500 text-white shadow-xs">
                  <Bot className="h-4 w-4 animate-spin" />
                </div>
                <div className="flex items-center rounded-2xl border border-gray-200/80 bg-white px-4 py-2 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex gap-1.5 items-center mr-2">
                    <span className="h-2 w-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Thinking...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Input Area (Max Width 3XL Perfectly Matching Messages) */}
      <ChatInput
        onSend={handleSend}
        onStop={handleStop}
        isLoading={isLoading}
        disabled={false}
      />
    </div>
  );
}
