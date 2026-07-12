"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Bot, User, Copy, Check, Pencil, Trash2, X, Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  role: "user" | "assistant" | "system";
  content: string;
  onEdit?: (newContent: string) => void;
  onDelete?: () => void;
}

export function MessageBubble({
  role,
  content,
  onEdit,
  onDelete,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isUser = role === "user";

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [isEditing]);

  async function copyToClipboard() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleEdit() {
    setEditContent(content);
    setIsEditing(true);
  }

  function handleCancelEdit() {
    setIsEditing(false);
    setEditContent(content);
  }

  function handleSubmitEdit() {
    if (editContent.trim() && editContent !== content) {
      onEdit?.(editContent.trim());
    }
    setIsEditing(false);
  }

  function handleEditKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitEdit();
    }
    if (e.key === "Escape") {
      handleCancelEdit();
    }
  }

  return (
    <div
      className={cn(
        "group flex gap-3 px-4 py-6",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-600 text-white">
          <Bot className="h-5 w-5" />
        </div>
      )}

      <div
        className={cn(
          "relative max-w-[80%] rounded-2xl px-4 py-3",
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100",
        )}
      >
        {isEditing ? (
          <div className="min-w-[200px]">
            <textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => {
                setEditContent(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
              onKeyDown={handleEditKeyDown}
              className="w-full resize-none rounded-lg border-0 bg-blue-700 p-2 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30"
              rows={1}
            />
            <div className="mt-2 flex gap-2 justify-end">
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-blue-200 hover:text-white hover:bg-blue-700"
              >
                <X className="h-3 w-3" /> Cancel
              </button>
              <button
                onClick={handleSubmitEdit}
                className="flex items-center gap-1 rounded-lg bg-white/20 px-2 py-1 text-xs text-white hover:bg-white/30"
              >
                <Send className="h-3 w-3" /> Send
              </button>
            </div>
          </div>
        ) : isUser ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                pre: ({ children }) => (
                  <pre className="relative overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm">
                    {children}
                  </pre>
                ),
                code: ({ className, children, ...props }) => {
                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code
                        className="rounded bg-gray-200 px-1.5 py-0.5 text-sm dark:bg-gray-700"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}

        {/* Action buttons */}
        {!isEditing && (
          <div
            className={cn(
              "absolute -bottom-8 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100",
              isUser ? "right-0" : "left-0",
            )}
          >
            {isUser && onEdit && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Pencil className="h-3 w-3" /> Edit
              </button>
            )}
            {isUser && onDelete && (
              <button
                onClick={onDelete}
                className="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
              >
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            )}
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" /> Copy
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200">
          <User className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}
