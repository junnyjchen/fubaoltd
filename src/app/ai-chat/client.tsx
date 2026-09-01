"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Model {
  id: string;
  name: string;
  description: string;
  default: boolean;
}

export function AIChatClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("doubao-seed-2-0-mini-260215");
  const [models, setModels] = useState<Model[]>([]);
  const [showModelSelect, setShowModelSelect] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let assistantMessage = "";

      // Add empty assistant message
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                assistantMessage += parsed.content;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: assistantMessage,
                  };
                  return updated;
                });
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I apologize, but I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, selectedModel]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

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
              {models.find((m) => m.id === selectedModel)?.name || "AI Model"}
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

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                message.role === "user"
                  ? "bg-[var(--cinnabar)] text-white"
                  : "bg-[var(--paper)] text-[var(--ink)] border border-[var(--gold)]/20"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

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
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 rounded-lg bg-[var(--cinnabar)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
        <p className="mt-2 text-xs text-[var(--smoke)] text-center">
          For entertainment and educational purposes only. Not a substitute for professional guidance.
        </p>
      </div>
    </div>
  );
}
