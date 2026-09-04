import { NextRequest, NextResponse } from "next/server";
import {
  createArticle,
  hasArticleSlug,
  isValidArticleCategory,
  listArticles,
  getArticleById,
  updateArticle,
} from "@/lib/articles/article-store";
import type { Article } from "@/lib/articles/article-store";

export const dynamic = "force-dynamic";

// GET /api/articles - List articles (filtering + pagination) or fetch one by slug
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const category = searchParams.get("category");
  const slug = searchParams.get("slug");
  const published = searchParams.get("published");

  if (slug) {
    const article = listArticles().find((a) => a.slug === slug);
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: article });
  }

  // Default: only published articles. Explicit `published` param overrides.
  const publishedOnly =
    published !== null && published !== ""
      ? published === "true"
      : true;

  const filteredArticles = listArticles({
    category: category ?? undefined,
    publishedOnly,
  });

  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedArticles = filteredArticles.slice(start, end);

  return NextResponse.json({
    success: true,
    data: {
      articles: paginatedArticles,
      pagination: {
        page,
        limit,
        total: filteredArticles.length,
        totalPages: Math.ceil(filteredArticles.length / limit),
      },
    },
  });
}

// POST /api/articles - Create a new article
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      excerpt,
      content,
      category,
      tags = [],
      author,
      coverImage,
      slug,
      published,
    } = body;

    if (!title || !content || !category || !author) {
      return NextResponse.json(
        { error: "title, content, category, and author are required" },
        { status: 400 }
      );
    }

    if (!isValidArticleCategory(String(category))) {
      return NextResponse.json(
        { error: "category must be one of: news, encyclopedia, tutorial, culture" },
        { status: 400 }
      );
    }

    const articleSlug =
      slug ||
      String(title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    if (!articleSlug) {
      return NextResponse.json(
        { error: "Could not derive a slug from the title — provide a slug" },
        { status: 400 }
      );
    }

    if (hasArticleSlug(articleSlug)) {
      return NextResponse.json(
        { error: "Article with this slug already exists" },
        { status: 409 }
      );
    }

    const newArticle = createArticle({
      title: String(title),
      excerpt: excerpt ? String(excerpt) : undefined,
      content: String(content),
      category: category as Article["category"],
      tags: Array.isArray(tags) ? tags.map(String) : [],
      author: String(author),
      coverImage: coverImage ? String(coverImage) : undefined,
      slug: articleSlug,
      published: published === undefined ? true : Boolean(published),
    });

    return NextResponse.json(
      {
        success: true,
        data: newArticle,
        message: "Article created successfully",
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 400 }
    );
  }
}

// PUT /api/articles - Update an article by id
export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Article ID is required" },
        { status: 400 }
      );
    }

    if (!getArticleById(String(id))) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    if (updates.category !== undefined && !isValidArticleCategory(String(updates.category))) {
      return NextResponse.json(
        { error: "category must be one of: news, encyclopedia, tutorial, culture" },
        { status: 400 }
      );
    }

    const article = updateArticle(String(id), updates);
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: article });
  } catch {
    return NextResponse.json(
      { error: "Failed to update article" },
      { status: 400 }
    );
  }
}
