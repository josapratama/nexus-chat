"use client";

import { useState, useEffect } from "react";
import { SlidersHorizontal, Sparkles, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/lib/store";

export function ModelParametersModal() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    temperature,
    maxTokens,
    customSystemPrompt,
    setTemperature,
    setMaxTokens,
    setCustomSystemPrompt,
    activeConversationId,
  } = useChatStore();

  const [localTemp, setLocalTemp] = useState(temperature);
  const [localTokens, setLocalTokens] = useState<number | "default">(
    maxTokens || "default"
  );
  const [localPrompt, setLocalPrompt] = useState(customSystemPrompt);

  useEffect(() => {
    setLocalTemp(temperature);
    setLocalTokens(maxTokens || "default");
    setLocalPrompt(customSystemPrompt);
  }, [temperature, maxTokens, customSystemPrompt, isOpen]);

  const handleSave = async () => {
    setTemperature(localTemp);
    setMaxTokens(localTokens === "default" ? undefined : localTokens);
    setCustomSystemPrompt(localPrompt);

    if (activeConversationId) {
      try {
        await fetch(`/api/conversations/${activeConversationId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            temperature: localTemp,
            systemPrompt: localPrompt || null,
          }),
        });
      } catch (err) {
        console.error("Failed to persist conversation parameters:", err);
      }
    }

    setIsOpen(false);
  };

  const handleReset = () => {
    setLocalTemp(0.7);
    setLocalTokens("default");
    setLocalPrompt("");
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
        title="Model Parameters (Temperature, Persona, Max Tokens)"
      >
        <SlidersHorizontal className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400">
                  <SlidersHorizontal className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Model Parameters</h3>
                  <p className="text-[11px] text-slate-400">Tuning temperature, persona, and output length</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Controls */}
            <div className="space-y-5 text-xs">
              {/* Temperature Slider */}
              <div>
                <div className="flex justify-between items-center mb-1.5 font-medium">
                  <span className="text-slate-200">Creativity (Temperature)</span>
                  <span className="font-mono text-indigo-400 font-semibold">{localTemp.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  value={localTemp}
                  onChange={(e) => setLocalTemp(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                {/* Presets */}
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setLocalTemp(0.2)}
                    className={`flex-1 py-1 rounded-md border text-[11px] transition ${
                      localTemp <= 0.3
                        ? "border-indigo-500 bg-indigo-500/10 text-indigo-300 font-medium"
                        : "border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Precise (0.2)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocalTemp(0.7)}
                    className={`flex-1 py-1 rounded-md border text-[11px] transition ${
                      localTemp > 0.3 && localTemp <= 0.8
                        ? "border-indigo-500 bg-indigo-500/10 text-indigo-300 font-medium"
                        : "border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Balanced (0.7)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocalTemp(1.1)}
                    className={`flex-1 py-1 rounded-md border text-[11px] transition ${
                      localTemp > 0.8
                        ? "border-indigo-500 bg-indigo-500/10 text-indigo-300 font-medium"
                        : "border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Creative (1.1)
                  </button>
                </div>
              </div>

              {/* Max Output Tokens */}
              <div>
                <label className="block text-slate-200 font-medium mb-1.5">Max Output Length</label>
                <select
                  value={localTokens}
                  onChange={(e) =>
                    setLocalTokens(
                      e.target.value === "default" ? "default" : parseInt(e.target.value, 10)
                    )
                  }
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="default">Model Default</option>
                  <option value="1024">Short (1,024 tokens)</option>
                  <option value="2048">Medium (2,048 tokens)</option>
                  <option value="4096">Long (4,096 tokens)</option>
                  <option value="8192">Very Long (8,192 tokens)</option>
                </select>
              </div>

              {/* Custom Persona / System Instructions */}
              <div>
                <label className="block text-slate-200 font-medium mb-1.5">
                  Custom System Persona / Instructions
                </label>
                <textarea
                  value={localPrompt}
                  onChange={(e) => setLocalPrompt(e.target.value)}
                  placeholder="e.g. You are an expert software architect. Respond with clean, idiomatic code examples and architectural trade-offs."
                  rows={3}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-5">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset Defaults
              </button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30"
                >
                  Apply Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

