import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getArticleBySlug } from "@/lib/api";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return { title: "Article Not Found" };
  }

  return {
    title: `${article.title} | FuBao`,
    description: article.excerpt,
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  // Simple markdown-like rendering
  const renderContent = (content: string) => {
    const lines = content.split("\n");
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];
    let inList = false;

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 my-3 text-[var(--ink)]/80">
            {listItems.map((item, i) => (
              <li key={i} className="text-sm leading-relaxed">{item}</li>
            ))}
          </ul>
        );
        listItems = [];
      }
      inList = false;
    };

    lines.forEach((line, index) => {
      if (line.startsWith("# ")) {
        flushList();
        elements.push(
          <h1 key={index} className="font-serif text-2xl sm:text-3xl text-[var(--ink)] mt-8 mb-4">
            {line.slice(2)}
          </h1>
        );
      } else if (line.startsWith("## ")) {
        flushList();
        elements.push(
          <h2 key={index} className="font-serif text-xl sm:text-2xl text-[var(--ink)] mt-6 mb-3">
            {line.slice(3)}
          </h2>
        );
      } else if (line.startsWith("### ")) {
        flushList();
        elements.push(
          <h3 key={index} className="font-serif text-lg text-[var(--ink)] mt-4 mb-2">
            {line.slice(4)}
          </h3>
        );
      } else if (line.startsWith("- ")) {
        inList = true;
        listItems.push(line.slice(2));
      } else if (line.trim() === "") {
        flushList();
      } else {
        flushList();
        elements.push(
          <p key={index} className="text-sm sm:text-base text-[var(--ink)]/80 leading-relaxed mb-3">
            {line}
          </p>
        );
      }
    });

    flushList();
    return elements;
  };

  return (
    <main className="min-h-screen bg-[var(--paper)] pt-24 pb-16">
      <article className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-[var(--smoke)]">
          <Link href="/articles" className="hover:text-[var(--cinnabar)] transition-colors">
            Articles
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[var(--ink)]">{article.title}</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <span className="inline-block px-3 py-1 text-xs rounded-full bg-[var(--cinnabar)]/10 text-[var(--cinnabar)] mb-4">
            {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl tracking-wide text-[var(--ink)] leading-tight">
            {article.title}
          </h1>
          <p className="mt-4 text-base text-[var(--smoke)] leading-relaxed">
            {article.excerpt}
          </p>
          <div className="mt-4 flex items-center gap-4 text-sm text-[var(--smoke)]">
            <span>By {article.author}</span>
            <span>•</span>
            <span>
              {new Date(article.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs rounded bg-[var(--jade)] text-[var(--smoke)]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Divider */}
        <div className="border-t border-[var(--gold)]/20 mb-8" />

        {/* Content */}
        <div className="prose-custom">{renderContent(article.content)}</div>

        {/* Divider */}
        <div className="border-t border-[var(--gold)]/20 mt-12 mb-8" />

        {/* Footer */}
        <div className="text-center">
          <Link
            href="/articles"
            className="inline-block px-6 py-3 text-sm rounded-lg border border-[var(--gold)]/30 text-[var(--ink)] hover:bg-[var(--jade)] transition-colors"
          >
            Back to Articles
          </Link>
        </div>
      </article>
    </main>
  );
}
