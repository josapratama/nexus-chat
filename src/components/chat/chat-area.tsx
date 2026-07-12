"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import {
  PanelLeft,
  RotateCcw,
  Settings,
  BookOpen,
  FileText,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "./message-bubble";
import { ChatInput } from "./chat-input";
import { ModelSelector } from "./model-selector";
import { useChatStore } from "@/lib/store";
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

export function ChatArea() {
  const {
    activeConversationId,
    messages: storedMessages,
    isSidebarOpen,
    selectedModel,
    selectedProvider,
    toggleSidebar,
    setConversations,
    conversations,
  } = useChatStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync messages from store when conversation changes
  useEffect(() => {
    setMessages(
      storedMessages.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    );
    setStreamingContent("");
  }, [storedMessages, activeConversationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

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

  async function handleSend(content: string, files?: UploadedFile[]) {
    let convId = activeConversationId;

    // If no active conversation, create one first
    if (!convId) {
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
          convId = conversation.id;
          useChatStore.getState().setActiveConversation(conversation.id);
          useChatStore
            .getState()
            .setConversations([conversation, ...conversations]);
        } else {
          return;
        }
      } catch (error) {
        console.error("Failed to create conversation:", error);
        return;
      }
    }

    // Build message text
    let messageText = content;
    if (files && files.length > 0) {
      const imageFiles = files.filter((f) => f.isImage);
      if (imageFiles.length > 0) {
        messageText +=
          "\n\n[Attached images: " +
          imageFiles.map((f) => f.fileName).join(", ") +
          "]";
      }
    }

    // Add user message to UI immediately
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageText,
    };
    setMessages((prev) => [...prev, userMsg]);

    // Send to API and stream response
    await streamChat(convId!, [...messages, userMsg]);
  }

  async function streamChat(convId: string, allMessages: ChatMessage[]) {
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
          conversationId: convId,
          model: selectedModel,
          provider: selectedProvider,
          messages: allMessages.map((m) => ({
            role: m.role,
            parts: [{ type: "text", text: m.content }],
          })),
        }),
      });

      if (!res.ok) {
        const error = await res.text();
        console.error("Chat API error:", error);
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

      // Add assistant message
      if (fullContent) {
        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: fullContent,
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setStreamingContent("");
      }

      // Refresh conversations for updated title
      fetchConversations();
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Stream error:", error);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }

  async function handleEditMessage(index: number, newContent: string) {
    // Edit message: keep all messages up to and including the edited one,
    // then regenerate AI response. Previous AI responses stay intact (like ChatGPT).
    const editedMessages = messages.slice(0, index);
    const editedMsg: ChatMessage = {
      ...messages[index],
      content: newContent,
    };
    editedMessages.push(editedMsg);

    setMessages(editedMessages);

    // Regenerate AI response with edited context
    if (activeConversationId) {
      await streamChat(activeConversationId, editedMessages);
    }
  }

  function handleDeleteMessage(index: number) {
    // Delete the user message and the AI response after it (if any)
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
  }

  async function handleRegenerate() {
    if (messages.length === 0 || !activeConversationId) return;

    // Remove last assistant message
    const withoutLast =
      messages[messages.length - 1].role === "assistant"
        ? messages.slice(0, -1)
        : messages;
    setMessages(withoutLast);

    await streamChat(activeConversationId, withoutLast);
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
    <div className="flex flex-1 flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          {!isSidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              title="Open Sidebar"
            >
              <PanelLeft className="h-5 w-5" />
            </Button>
          )}
          <ModelSelector />
        </div>

        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRegenerate}
              disabled={isLoading}
              title="Regenerate last response"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Regenerate
            </Button>
          )}
          <Link href="/documents">
            <Button variant="ghost" size="icon" title="Documents (RAG)">
              <FileText className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/prompts">
            <Button variant="ghost" size="icon" title="Prompt Library">
              <BookOpen className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/settings">
            <Button variant="ghost" size="icon" title="Settings">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant="ghost" size="icon" title="Admin">
              <Shield className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && !streamingContent ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-8">
            <div className="mb-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 p-4">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Start a conversation
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
              Choose a model above and type your message below. You can switch
              between different AI providers and models at any time.
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
              <Link href="/documents">
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-1" />
                  Upload Documents
                </Button>
              </Link>
              <Link href="/prompts">
                <Button variant="outline" size="sm">
                  <BookOpen className="h-4 w-4 mr-1" />
                  Prompt Library
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-4xl">
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
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
              />
            ))}
            {streamingContent && (
              <MessageBubble role="assistant" content={streamingContent} />
            )}
            {isLoading && !streamingContent && (
              <div className="flex gap-3 px-4 py-6">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-600 text-white">
                  <svg
                    className="h-5 w-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                </div>
                <div className="flex items-center rounded-2xl bg-gray-100 px-4 py-3 dark:bg-gray-800">
                  <div className="flex gap-1">
                    <span
                      className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                  <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                    Thinking...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        onStop={handleStop}
        isLoading={isLoading}
        disabled={false}
      />
    </div>
  );
}
