import type { Metadata } from "next";
import Link from "next/link";
import { getArticles } from "@/lib/api";

export const metadata: Metadata = {
  title: "Articles & Culture | FuBao",
  description:
    "Explore articles about Taoist culture, talisman traditions, Five Elements philosophy, and Eastern spiritual practices.",
};

const categoryLabels: Record<string, string> = {
  news: "News",
  encyclopedia: "Encyclopedia",
  tutorial: "Tutorial",
  culture: "Culture",
};

const categoryColors: Record<string, string> = {
  news: "bg-[var(--cinnabar)]/10 text-[var(--cinnabar)]",
  encyclopedia: "bg-[var(--gold)]/10 text-[var(--gold)]",
  tutorial: "bg-[var(--ink)]/10 text-[var(--ink)]",
  culture: "bg-[var(--cinnabar)]/5 text-[var(--ink)]",
};

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function ArticlesPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const articles = await getArticles(category);
  const categoryKeys = Object.keys(categoryLabels);

  return (
    <main className="min-h-screen bg-[var(--paper)] pt-24 pb-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="font-serif text-3xl sm:text-4xl tracking-wide text-[var(--ink)]">
            Culture & Knowledge
          </h1>
          <p className="mt-3 text-sm text-[var(--smoke)] max-w-xl mx-auto">
            Dive deeper into Taoist traditions, talisman history, and Eastern
            spiritual wisdom through our curated articles.
          </p>
        </div>

        {/* Category Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <Link
            href="/articles"
            className={`px-4 py-2 text-sm rounded-full border transition-colors ${
              !category
                ? "border-[var(--cinnabar)]/40 text-[var(--cinnabar)] bg-[var(--cinnabar)]/10"
                : "border-[var(--gold)]/30 text-[var(--smoke)] hover:bg-[var(--jade)] hover:text-[var(--ink)]"
            }`}
          >
            All
          </Link>
          {categoryKeys.map((key) => {
            const selected = category === key;
            return (
              <Link
                key={key}
                href={`/articles?category=${key}`}
                className={`px-4 py-2 text-sm rounded-full border transition-colors ${
                  selected
                    ? "border-[var(--cinnabar)]/40 text-[var(--cinnabar)] bg-[var(--cinnabar)]/10"
                    : "border-[var(--gold)]/30 text-[var(--smoke)] hover:bg-[var(--jade)] hover:text-[var(--ink)]"
                }`}
              >
                {categoryLabels[key]}
              </Link>
            );
          })}
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/articles/${article.slug}`}
              className="group bg-[var(--jade)] rounded-lg border border-[var(--gold)]/20 overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              {/* Cover Image Placeholder */}
              <div className="aspect-[16/9] bg-[var(--paper)] flex items-center justify-center border-b border-[var(--gold)]/10">
                <span className="font-serif text-4xl text-[var(--cinnabar)]/20">
                  {article.category === "encyclopedia"
                    ? "典"
                    : article.category === "tutorial"
                      ? "修"
                      : article.category === "news"
                        ? "新"
                        : "文"}
                </span>
              </div>

              <div className="p-5">
                {/* Category Badge */}
                <span
                  className={`inline-block px-2 py-0.5 text-xs rounded ${categoryColors[article.category] || "bg-[var(--jade)] text-[var(--smoke)]"}`}
                >
                  {categoryLabels[article.category] || article.category}
                </span>

                {/* Title */}
                <h2 className="mt-3 font-serif text-lg text-[var(--ink)] group-hover:text-[var(--cinnabar)] transition-colors line-clamp-2">
                  {article.title}
                </h2>

                {/* Excerpt */}
                <p className="mt-2 text-sm text-[var(--smoke)] line-clamp-2">
                  {article.excerpt}
                </p>

                {/* Meta */}
                <div className="mt-4 flex items-center justify-between text-xs text-[var(--smoke)]">
                  <span>{article.author}</span>
                  <span>
                    {new Date(article.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {articles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[var(--smoke)]">No articles available yet.</p>
          </div>
        )}
      </div>
    </main>
  );
}
