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
        Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      handleSubmit(e);
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

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
    >
      <div className="mx-auto max-w-4xl">
        {/* Attached Files Preview */}
        {attachedFiles.length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {attachedFiles.map((file, index) => (
              <div
                key={index}
                className="relative flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              >
                {file.isImage ? (
                  <ImageIcon className="h-4 w-4 text-blue-500" />
                ) : (
                  <Paperclip className="h-4 w-4 text-gray-500" />
                )}
                <span className="max-w-32 truncate text-gray-700 dark:text-gray-300">
                  {file.fileName}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="ml-1 text-gray-400 hover:text-red-500"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (Shift+Enter for new line)"
              disabled={disabled}
              rows={1}
              className={cn(
                "w-full resize-none rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500",
                disabled && "opacity-50 cursor-not-allowed",
              )}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.txt,.md,.json,.csv"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute bottom-2 right-2 h-7 w-7 text-gray-400 hover:text-gray-600"
              title="Attach file"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
              ) : (
                <Paperclip className="h-4 w-4" />
              )}
            </Button>
          </div>

          {isLoading ? (
            <Button
              type="button"
              onClick={onStop}
              variant="destructive"
              size="icon"
              className="h-11 w-11 rounded-xl"
              title="Stop generating"
            >
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={
                (!input.trim() && attachedFiles.length === 0) || disabled
              }
              size="icon"
              className="h-11 w-11 rounded-xl"
              title="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
