"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MessageCircle, X, ArrowUp } from "lucide-react";

const QUICK_QUESTIONS = [
  "How do I choose the right talisman?",
  "How can I verify my talisman is authentic?",
  "What is the significance of the Five Elements?",
  "Do you ship worldwide?",
];

/**
 * Floating AI Assistant entry point.
 *
 * A quiet cinnabar button pinned to the bottom-right corner of every
 * storefront page. Clicking it opens a small panel with suggested
 * questions and a free-text input — both hand off to /ai-chat via ?q=
 * (the chat page auto-sends the prefilled question).
 *
 * Hidden on /ai-chat itself and in the admin / merchant dashboards.
 */
export function AIAssistantFab() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Storefront only: hide on the chat page itself and dashboard areas
  const hidden =
    pathname === "/ai-chat" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/merchant");

  // Close on route change
  useEffect(() => {
    setOpen(false);
    setQuestion("");
  }, [pathname]);

  // Close on Escape + click outside
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    inputRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  if (hidden) return null;

  const ask = (q: string) => {
    const query = q.trim();
    if (!query) return;
    router.push(`/ai-chat?q=${encodeURIComponent(query)}`);
  };

  return (
    <div ref={rootRef} className="fixed bottom-6 right-6 z-50 print:hidden">
      {/* Panel */}
      {open && (
        <div className="absolute bottom-16 right-0 w-[340px] max-w-[calc(100vw-3rem)] overflow-hidden rounded-lg border border-[var(--gold)]/30 bg-[var(--paper)] shadow-xl animate-fade-in-up [animation-duration:0.35s]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--gold)]/20 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 items-center rounded-sm bg-[var(--cinnabar)] px-1.5 font-serif text-[10px] tracking-[0.2em] text-[var(--paper)]">
                AI
              </span>
              <span className="font-serif text-sm tracking-wide text-[var(--ink)]">
                FuBao Assistant
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-sm p-1 text-[var(--smoke)] transition-colors hover:bg-[var(--jade)] hover:text-[var(--ink)]"
              aria-label="Close assistant"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-4 py-4">
            <p className="text-xs leading-relaxed text-[var(--smoke)]">
              Ask about talismans, Taoist culture, orders, shipping, and more.
            </p>

            {/* Suggested questions */}
            <div className="mt-3 flex flex-col gap-1.5">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => ask(q)}
                  className="rounded-sm border border-[var(--gold)]/20 bg-[var(--jade)]/60 px-3 py-2 text-left text-xs text-[var(--ink)] transition-all duration-300 hover:-translate-y-[2px] hover:border-[var(--gold)]/40 hover:bg-[var(--jade)]"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                ask(question);
              }}
              className="mt-4 flex items-center gap-2"
            >
              <input
                ref={inputRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question..."
                maxLength={200}
                className="h-9 flex-1 rounded-sm border border-[var(--gold)]/30 bg-[var(--jade)]/40 px-3 text-xs text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--smoke)] focus:border-[var(--cinnabar)]/60"
              />
              <button
                type="submit"
                disabled={!question.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-[var(--cinnabar)] text-[var(--paper)] transition-all duration-300 hover:-translate-y-[2px] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                aria-label="Ask the assistant"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </form>

            {/* Compliance */}
            <p className="mt-3 text-[10px] text-[var(--smoke)]">
              For entertainment purposes only.
            </p>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
        aria-expanded={open}
        className={`group flex h-14 w-14 items-center justify-center rounded-full border shadow-lg transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          open
            ? "border-[var(--gold)]/50 bg-[var(--ink)] text-[var(--paper)]"
            : "border-[var(--gold)]/40 bg-[var(--cinnabar)] text-[var(--paper)] hover:-translate-y-1 hover:shadow-xl"
        }`}
      >
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}
