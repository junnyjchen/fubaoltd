import type { Metadata } from "next";
import { AIChatClient } from "./client";

export const metadata: Metadata = {
  title: "AI Cultural Assistant | FuBao",
  description:
    "Chat with our AI assistant about Taoist culture, talismans, and Eastern spiritual traditions.",
};

export default function AIChatPage() {
  return (
    <main className="min-h-screen bg-[var(--paper)] pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl sm:text-4xl tracking-wide text-[var(--ink)]">
            AI Cultural Assistant
          </h1>
          <p className="mt-3 text-sm text-[var(--smoke)]">
            Ask about Taoist culture, talismans, Five Elements, and Eastern traditions
          </p>
        </div>

        {/* Chat Interface */}
        <AIChatClient />
      </div>
    </main>
  );
}
