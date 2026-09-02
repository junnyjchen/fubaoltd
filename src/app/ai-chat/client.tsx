"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy, RotateCcw, Square } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  usedKnowledge?: boolean;
}

interface Model {
  id: string;
  name: string;
  description: string;
  default: boolean;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — ignore
    }
  };

  return (
    <button
      onClick={copy}
      className="p-1.5 rounded text-[var(--smoke)] hover:text-[var(--ink)] hover:bg-[var(--jade)] transition-colors"
      title="Copy message"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-[var(--gold)]" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

/** Typing cursor shown at the end of a streaming assistant message */
function StreamingCursor() {
  return (
    <span className="inline-block w-[2px] h-[1em] align-text-bottom bg-[var(--cinnabar)] animate-pulse ml-0.5" />
  );
}

export function AIChatClient({ initialQuery }: { initialQuery?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedModel, setSelectedModel] = useState("doubao-seed-2-0-mini-260215");
  const [models, setModels] = useState<Model[]>([]);
  const [showModelSelect, setShowModelSelect] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const autoSentRef = useRef(false);

  // Fetch available models
  useEffect(() => {
    fetch("/api/ai/models")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setModels(data.data);
          const defaultModel = data.data.find((m: Model) => m.default);
          if (defaultModel) {
            setSelectedModel(defaultModel.id);
          }
        }
      })
      .catch(console.error);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  /** Core streaming request. Returns the full assistant text. */
  const runStream = useCallback(
    async (history: Message[]): Promise<string> => {
      const abortController = new AbortController();
      abortRef.current = abortController;
      setIsStreaming(true);

      // Add empty assistant message for streaming target
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      let assistantMessage = "";
      let usedKnowledge = false;

      try {
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history,
            model: selectedModel,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to get response");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No reader available");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.meta?.usedKnowledge) {
                usedKnowledge = true;
              }
              if (parsed.content) {
                assistantMessage += parsed.content;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: assistantMessage,
                    usedKnowledge,
                  };
                  return updated;
                });
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Chat error:", error);
          setMessages((prev) => [
            ...prev.slice(0, -1), // remove empty streaming placeholder
            {
              role: "assistant",
              content:
                "I apologize, but I encountered an error. Please try again.",
            },
          ]);
          return "";
        }
        // Aborted: keep the partial message as-is
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }

      return assistantMessage;
    },
    [selectedModel]
  );

  // Auto-send the prefilled question from ?q= (floating assistant hand-off).
  // Guarded so a change in runStream identity (model list loading) never re-sends.
  useEffect(() => {
    const query = initialQuery?.trim();
    if (!query || autoSentRef.current) return;
    autoSentRef.current = true;

    const history: Message[] = [{ role: "user", content: query }];
    setMessages(history);
    setIsLoading(true);
    // Clean the URL so a refresh starts a fresh conversation instead of re-sending
    window.history.replaceState(null, "", "/ai-chat");
    runStream(history).then(() => setIsLoading(false));
  }, [initialQuery, runStream]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    await runStream(newMessages);
    setIsLoading(false);
  }, [input, isLoading, messages, runStream]);

  /** Stop an in-flight generation */
  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
    setIsStreaming(false);
  }, []);

  /** Regenerate: drop the last assistant message and re-ask */
  const regenerate = useCallback(async () => {
    if (isLoading || messages.length === 0) return;

    // Find last user message index; everything after (the assistant reply) gets re-generated
    let lastUserIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        lastUserIndex = i;
        break;
      }
    }
    if (lastUserIndex === -1) return;

    const history = messages.slice(0, lastUserIndex + 1);
    setMessages(history);
    setIsLoading(true);
    await runStream(history);
    setIsLoading(false);
  }, [isLoading, messages, runStream]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    if (isStreaming) abortRef.current?.abort();
    setMessages([]);
  };

  const lastMessage = messages[messages.length - 1];
  const canRegenerate =
    !isLoading && lastMessage?.role === "assistant" && messages.length >= 2;

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] min-h-[500px] bg-[var(--jade)] rounded-lg border border-[var(--gold)]/20 overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--gold)]/20 bg-[var(--paper)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--cinnabar)] flex items-center justify-center">
            <span className="text-white text-sm font-serif">道</span>
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--ink)]">FuBao Assistant</p>
            <p className="text-xs text-[var(--smoke)]">
              {isStreaming
                ? "Typing..."
                : models.find((m) => m.id === selectedModel)?.name || "AI Model"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Model Selector */}
          <div className="relative">
            <button
              onClick={() => setShowModelSelect(!showModelSelect)}
              className="px-3 py-1.5 text-xs rounded border border-[var(--gold)]/30 text-[var(--smoke)] hover:bg-[var(--jade)] transition-colors"
            >
              Change Model
            </button>
            {showModelSelect && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-[var(--paper)] border border-[var(--gold)]/30 rounded shadow-lg z-10">
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setShowModelSelect(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-[var(--jade)] transition-colors ${
                      selectedModel === model.id ? "bg-[var(--jade)]" : ""
                    }`}
                  >
                    <p className="font-medium text-[var(--ink)]">{model.name}</p>
                    <p className="text-xs text-[var(--smoke)]">{model.description}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Clear Button */}
          <button
            onClick={clearChat}
            className="px-3 py-1.5 text-xs rounded border border-[var(--gold)]/30 text-[var(--smoke)] hover:bg-[var(--jade)] transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--cinnabar)]/10 flex items-center justify-center">
              <span className="text-2xl font-serif text-[var(--cinnabar)]">道</span>
            </div>
            <h3 className="text-lg font-serif text-[var(--ink)] mb-2">
              Welcome to FuBao AI Assistant
            </h3>
            <p className="text-sm text-[var(--smoke)] max-w-md mx-auto">
              Ask me about Taoist culture, talisman traditions, the Five Elements,
              or anything related to Eastern spiritual practices.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[
                "What is a Taoist talisman?",
                "Explain the Five Elements",
                "How are talismans consecrated?",
                "Which talisman is right for me?",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-3 py-1.5 text-xs rounded-full border border-[var(--gold)]/30 text-[var(--smoke)] hover:bg-[var(--paper)] hover:text-[var(--ink)] transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => {
          const isLastAssistant =
            message.role === "assistant" && index === messages.length - 1;
          const streamingThis = isLastAssistant && isStreaming;

          return (
            <div
              key={index}
              className={`group flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-3 ${
                  message.role === "user"
                    ? "bg-[var(--cinnabar)] text-white"
                    : "bg-[var(--paper)] text-[var(--ink)] border border-[var(--gold)]/20"
                }`}
              >
                {message.role === "assistant" && message.usedKnowledge && (
                  <span className="inline-flex items-center gap-1 mb-1.5 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/30">
                    Knowledge Base
                  </span>
                )}

                {message.role === "assistant" ? (
                  <div className="text-sm leading-relaxed [&_p]:mb-2 last:[&_p]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 [&_li]:mb-1 [&_strong]:font-semibold [&_a]:text-[var(--cinnabar)] [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-[var(--ink)] [&_h3]:font-serif [&_h3]:text-base [&_h3]:mt-3 [&_h3]:mb-1.5 [&_h4]:font-serif [&_h4]:mt-2 [&_h4]:mb-1 [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--gold)] [&_blockquote]:pl-3 [&_blockquote]:text-[var(--smoke)] [&_code]:bg-[var(--jade)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_pre]:bg-[var(--jade)] [&_pre]:p-3 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre]:mb-2 [&_table]:w-full [&_table]:mb-2 [&_th]:border [&_th]:border-[var(--gold)]/30 [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:bg-[var(--jade)] [&_td]:border [&_td]:border-[var(--gold)]/30 [&_td]:px-2 [&_td]:py-1 [&_hr]:border-[var(--gold)]/30 [&_hr]:my-3">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                    {streamingThis && <StreamingCursor />}
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                )}
              </div>

              {/* Hover actions on completed assistant messages */}
              {message.role === "assistant" && !streamingThis && message.content && (
                <div className="self-end ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <CopyButton text={message.content} />
                  {isLastAssistant && canRegenerate && (
                    <button
                      onClick={regenerate}
                      className="p-1.5 rounded text-[var(--smoke)] hover:text-[var(--ink)] hover:bg-[var(--jade)] transition-colors"
                      title="Regenerate response"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="bg-[var(--paper)] border border-[var(--gold)]/20 rounded-lg px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-[var(--smoke)] animate-bounce" />
                <span
                  className="w-2 h-2 rounded-full bg-[var(--smoke)] animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <span
                  className="w-2 h-2 rounded-full bg-[var(--smoke)] animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[var(--gold)]/20 bg-[var(--paper)] p-4">
        <div className="flex gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about Taoist culture, talismans, Five Elements..."
            className="flex-1 resize-none rounded-lg border border-[var(--gold)]/30 bg-[var(--jade)] px-4 py-3 text-sm text-[var(--ink)] placeholder:text-[var(--smoke)] focus:outline-none focus:border-[var(--cinnabar)] transition-colors"
            rows={1}
            disabled={isLoading}
          />
          {isLoading ? (
            <button
              onClick={stopGeneration}
              className="px-6 py-3 rounded-lg border border-[var(--cinnabar)] text-[var(--cinnabar)] text-sm font-medium hover:bg-[var(--cinnabar)]/5 transition-colors flex items-center gap-2"
            >
              <Square className="w-4 h-4" />
              Stop
            </button>
          ) : (
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="px-6 py-3 rounded-lg bg-[var(--cinnabar)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-[var(--smoke)] text-center">
          For entertainment and educational purposes only. Not a substitute for professional guidance.
        </p>
      </div>
    </div>
  );
}
