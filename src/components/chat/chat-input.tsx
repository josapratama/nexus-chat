"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Square, Paperclip, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadedFile {
  url: string;
  fileName: string;
  fileType: string;
  isImage: boolean;
}

interface ChatInputProps {
  onSend: (message: string, files?: UploadedFile[]) => void;
  onStop?: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({
  onSend,
  onStop,
  isLoading,
  disabled,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 180) + "px";
    }
  }, [input]);

  function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if ((!input.trim() && attachedFiles.length === 0) || isLoading || disabled)
      return;
    onSend(input.trim(), attachedFiles.length > 0 ? attachedFiles : undefined);
    setInput("");
    setAttachedFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          setAttachedFiles((prev) => [...prev, data]);
        } else {
          const err = await res.json();
          alert(err.error || "Upload failed");
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeFile(index: number) {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  const hasContent = input.trim().length > 0 || attachedFiles.length > 0;
  const isMultiLine = input.includes("\n") || input.length > 90;

  return (
    <div className="w-full bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent p-3 pt-2 sm:p-4">
      <div className="mx-auto max-w-3xl">
        <form
          onSubmit={handleSubmit}
          className="relative rounded-2xl border border-slate-800/90 bg-slate-900/90 p-2 shadow-xl shadow-indigo-950/20 transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20"
        >
          {/* Attached Files Preview */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 px-2 pb-2 pt-1 border-b border-slate-800">
              {attachedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200"
                >
                  {file.isImage ? (
                    <ImageIcon className="h-3.5 w-3.5 text-indigo-400" />
                  ) : (
                    <Paperclip className="h-3.5 w-3.5 text-slate-400" />
                  )}
                  <span className="max-w-[140px] truncate">{file.fileName}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="ml-1 rounded p-0.5 text-slate-400 hover:bg-slate-700 hover:text-rose-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Text Input Row - Perfectly Centered Horizontally & Vertically */}
          <div
            className={cn(
              "flex gap-2 px-1",
              isMultiLine ? "items-end" : "items-center",
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.txt,.md,.json,.csv"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || disabled}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
              title="Attach document or image"
            >
              {uploading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
              ) : (
                <Paperclip className="h-4 w-4" />
              )}
            </button>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything or request a task... (Shift+Enter for newline)"
              disabled={disabled}
              rows={1}
              className="max-h-44 min-h-[36px] flex-1 resize-none bg-transparent py-2 text-sm leading-5 text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />

            {isLoading ? (
              <Button
                type="button"
                onClick={onStop}
                variant="destructive"
                size="icon"
                className="h-9 w-9 shrink-0 rounded-xl shadow-xs transition hover:scale-105"
                title="Stop generating"
              >
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <button
                type="submit"
                disabled={!hasContent || disabled}
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all",
                  hasContent && !disabled
                    ? "bg-blue-600 text-white shadow-xs hover:bg-blue-500 hover:scale-105 active:scale-95"
                    : "cursor-not-allowed bg-slate-800 text-slate-500",
                )}
                title="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>

        <p className="mt-1.5 text-center text-[11px] text-slate-500">
          NexusChat can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
