import type { Metadata } from "next";
import { WishesClient } from "./client";

export const metadata: Metadata = {
  title: "Wishes & Reviews | FuBao",
  description:
    "Read heartfelt wishes and reviews from FuBao customers around the world. Share your own story.",
};

export default function WishesPage() {
  return (
    <main className="min-h-screen bg-[var(--paper)] pt-24 pb-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="font-serif text-3xl sm:text-4xl tracking-wide text-[var(--ink)]">
            Wishes & Stories
          </h1>
          <p className="mt-3 text-sm text-[var(--smoke)] max-w-xl mx-auto">
            Heartfelt words from our community. Each wish carries a personal story
            of cultural connection and meaningful experience.
          </p>
        </div>

        {/* Wishes Feed */}
        <WishesClient />
      </div>
    </main>
  );
}
