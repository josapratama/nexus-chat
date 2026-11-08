"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import {
  Bot,
  User,
  Copy,
  Check,
  Pencil,
  Trash2,
  X,
  Send,
  RotateCcw,
  Volume2,
  VolumeX,
  GitFork,
  Eye,
  Code as CodeIcon,
  ExternalLink,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  role: "user" | "assistant" | "system";
  content: string;
  isStreaming?: boolean;
  onEdit?: (newContent: string) => void;
  onDelete?: () => void;
  onRegenerate?: () => void;
  onBranch?: () => void;
}

function CodeBlock({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1].toLowerCase() : "";
  const codeString = String(children).replace(/\n$/, "");

  const canPreview = ["html", "svg", "xml"].includes(language);

  async function copyCode() {
    await navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function openPreviewInNewWindow() {
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(codeString);
      win.document.close();
    }
  }

  return (
    <div className="relative my-3 overflow-hidden rounded-xl border border-gray-700/60 bg-gray-950 shadow-md">
      <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900/90 px-3.5 py-1.5 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-gray-300">
            {language || "code"}
          </span>

          {canPreview && (
            <div className="flex items-center rounded-lg bg-gray-800/80 p-0.5 border border-gray-700/50">
              <button
                type="button"
                onClick={() => setActiveTab("code")}
                className={cn(
                  "flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium transition",
                  activeTab === "code"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:text-white"
                )}
              >
                <CodeIcon className="h-3 w-3" /> Code
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={cn(
                  "flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium transition",
                  activeTab === "preview"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:text-white"
                )}
              >
                <Eye className="h-3 w-3" /> Live Preview
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {canPreview && activeTab === "preview" && (
            <button
              onClick={openPreviewInNewWindow}
              type="button"
              className="flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium text-gray-400 transition hover:bg-gray-800 hover:text-white"
              title="Open preview in new tab"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Pop Out</span>
            </button>
          )}

          <button
            onClick={copyCode}
            type="button"
            className="flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium text-gray-400 transition hover:bg-gray-800 hover:text-white"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {activeTab === "preview" && canPreview ? (
        <div className="p-4 bg-white dark:bg-slate-900 min-h-[160px] flex items-center justify-center">
          {language === "svg" ? (
            <div
              className="max-w-full overflow-auto flex items-center justify-center p-2"
              dangerouslySetInnerHTML={{ __html: codeString }}
            />
          ) : (
            <iframe
              srcDoc={codeString}
              sandbox="allow-scripts allow-modals"
              title="HTML Artifact Preview"
              className="w-full h-72 border-0 rounded-lg bg-white"
            />
          )}
        </div>
      ) : (
        <pre className="overflow-x-auto p-4 text-xs font-mono leading-relaxed text-gray-100">
          <code className={className}>{children}</code>
        </pre>
      )}
    </div>
  );
}

export function MessageBubble({
  role,
  content,
  isStreaming = false,
  onEdit,
  onDelete,
  onRegenerate,
  onBranch,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isUser = role === "user";

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [isEditing]);

  async function copyToClipboard() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function toggleSpeech() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown code blocks from speech output for natural listening
    const cleanText = content.replace(/```[\s\S]*?```/g, "Code block omitted.");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
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
        "group relative flex w-full gap-3 py-3 transition-colors",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {/* Bot Avatar */}
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-blue-500 text-white shadow-md shadow-indigo-500/20">
          <Bot className="h-4 w-4" />
        </div>
      )}

      {/* Bubble Container */}
      <div
        className={cn(
          "relative flex flex-col",
          isUser ? "max-w-[85%] sm:max-w-[75%]" : "max-w-[92%] sm:max-w-[85%]",
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm shadow-sm transition-all",
            isUser
              ? "rounded-tr-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/10"
              : "rounded-tl-sm border border-slate-800/90 bg-slate-900/90 text-slate-100 shadow-md shadow-indigo-950/20",
          )}
        >
          {isEditing ? (
            <div className="min-w-[240px] sm:min-w-[320px]">
              <textarea
                ref={textareaRef}
                value={editContent}
                onChange={(e) => {
                  setEditContent(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
                onKeyDown={handleEditKeyDown}
                className="w-full resize-none rounded-xl border border-white/20 bg-blue-700/80 p-2.5 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-white/40"
                rows={1}
              />
              <div className="mt-2.5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-blue-200 transition hover:bg-blue-700 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" /> Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitEdit}
                  className="flex items-center gap-1 rounded-lg bg-white px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50"
                >
                  <Send className="h-3.5 w-3.5" /> Save & Resend
                </button>
              </div>
            </div>
          ) : isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  code: ({ className, children, ...props }) => {
                    const isInline = !className;
                    if (isInline) {
                      return (
                        <code
                          className="rounded-md bg-gray-100 px-1.5 py-0.5 font-mono text-[13px] text-indigo-600 dark:bg-gray-800 dark:text-indigo-400"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }
                    return (
                      <CodeBlock className={className}>
                        {children}
                      </CodeBlock>
                    );
                  },
                }}
              >
                {content}
              </ReactMarkdown>

              {isStreaming && (
                <span className="inline-block h-4 w-1.5 animate-pulse rounded-full bg-indigo-500 ml-1 align-middle" />
              )}
            </div>
          )}
        </div>

        {/* Action Toolbar */}
        {!isEditing && (
          <div
            className={cn(
              "mt-1.5 flex items-center gap-1.5 px-1 text-xs text-slate-400 transition-opacity",
              isUser ? "justify-end" : "justify-start",
              "opacity-80 sm:opacity-0 sm:group-hover:opacity-100",
            )}
          >
            {/* Token Badge for Assistant Messages */}
            {!isUser && !isStreaming && content.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 mr-1.5 select-none">
                <span>⚡ ~{Math.round(content.length / 4)} tokens</span>
              </span>
            )}

            {isUser && onEdit && (
              <button
                type="button"
                onClick={handleEdit}
                className="flex items-center gap-1 rounded px-1.5 py-0.5 transition hover:bg-slate-800 hover:text-slate-200"
                title="Edit message"
              >
                <Pencil className="h-3 w-3" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            )}

            {isUser && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="flex items-center gap-1 rounded px-1.5 py-0.5 transition hover:bg-red-950/40 hover:text-red-400"
                title="Delete message"
              >
                <Trash2 className="h-3 w-3" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}

            {!isUser && onRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                className="flex items-center gap-1 rounded px-1.5 py-0.5 transition hover:bg-slate-800 hover:text-slate-200"
                title="Regenerate response"
              >
                <RotateCcw className="h-3 w-3" />
                <span className="hidden sm:inline">Regenerate</span>
              </button>
            )}

            {/* Read Aloud (Text to Speech) */}
            {!isUser && content.length > 0 && (
              <button
                type="button"
                onClick={toggleSpeech}
                className={cn(
                  "flex items-center gap-1 rounded px-1.5 py-0.5 transition",
                  isSpeaking
                    ? "bg-indigo-500/20 text-indigo-400 font-semibold"
                    : "hover:bg-slate-800 hover:text-slate-200"
                )}
                title={isSpeaking ? "Stop speaking" : "Read aloud"}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="h-3 w-3 text-indigo-400 animate-pulse" />
                    <span className="hidden sm:inline">Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3 w-3" />
                    <span className="hidden sm:inline">Speak</span>
                  </>
                )}
              </button>
            )}

            {/* Branch / Fork Chat */}
            {onBranch && (
              <button
                type="button"
                onClick={onBranch}
                className="flex items-center gap-1 rounded px-1.5 py-0.5 transition hover:bg-slate-800 hover:text-slate-200"
                title="Fork / Branch chat from this message"
              >
                <GitFork className="h-3 w-3" />
                <span className="hidden sm:inline">Branch</span>
              </button>
            )}

            <button
              type="button"
              onClick={copyToClipboard}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 transition hover:bg-slate-800 hover:text-slate-200"
              title="Copy message"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-gray-700 to-gray-900 text-white shadow-sm dark:from-gray-800 dark:to-gray-700">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
