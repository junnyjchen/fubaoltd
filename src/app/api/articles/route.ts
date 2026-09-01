import { NextRequest, NextResponse } from "next/server";

// In-memory storage for articles (replace with database in production)
export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: "news" | "encyclopedia" | "tutorial" | "culture";
  tags: string[];
  author: string;
  coverImage?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

// Mock articles for demonstration
const mockArticles: Article[] = [
  {
    id: "art-001",
    slug: "history-of-taoist-talismans",
    title: "The Ancient History of Taoist Talismans",
    excerpt: "Explore the 2000-year tradition of Taoist talisman creation and its significance in Chinese spiritual culture.",
    content: `# The Ancient History of Taoist Talismans

Taoist talismans, known as "Fu" (符) in Chinese, represent one of the most fascinating aspects of Eastern spiritual tradition. Their history stretches back over two millennia, intertwined with the development of Taoism itself.

## Origins in Ancient China

The earliest talismans can be traced to the Han Dynasty (202 BCE - 220 CE), when Taoist masters began developing systematic approaches to spiritual protection. These early practitioners observed natural patterns—the flow of water, the movement of stars, the growth of plants—and encoded these observations into symbolic representations.

## The Evolution of Talisman Arts

During the Tang Dynasty (618-918 CE), talisman creation became more sophisticated. Masters developed specific rituals for consecration, incorporating:

- **Cinnabar ink**: Made from mercury sulfide, believed to carry yang energy
- **Peach wood**: Associated with immortality and protection
- **Yellow paper**: Representing the earth element and imperial authority

## Modern Practice

Today, Taoist talismans continue to be created by ordained masters in temples across China, Hong Kong, and Taiwan. The tradition has evolved while maintaining its core principles:

1. The master must undergo years of training
2. Each talisman is hand-drawn with intention
3. Consecration rituals invoke spiritual blessings
4. The recipient's sincerity is considered essential

## Cultural Significance

Beyond their spiritual purpose, talismans represent a living connection to ancient wisdom. They embody centuries of philosophical thought, artistic tradition, and cultural heritage.

For collectors and enthusiasts, each talisman tells a story—a bridge between the ancient world and our modern lives.`,
    category: "encyclopedia",
    tags: ["history", "talisman", "culture", "tradition"],
    author: "Master Chen",
    published: true,
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "art-002",
    slug: "five-elements-guide",
    title: "Understanding the Five Elements (Wu Xing)",
    excerpt: "A comprehensive guide to Metal, Wood, Water, Fire, and Earth—the fundamental forces in Taoist philosophy.",
    content: `# Understanding the Five Elements (Wu Xing)

The Five Elements theory, or "Wu Xing" (五行), is a fundamental concept in Taoist philosophy that describes how different forces interact and influence our world.

## The Five Elements

### Metal (金 - Jīn)
- **Qualities**: Precision, clarity, determination
- **Season**: Autumn
- **Direction**: West
- **Color**: White, silver, gold
- **Organs**: Lungs, large intestine

### Wood (木 - Mù)
- **Qualities**: Growth, flexibility, creativity
- **Season**: Spring
- **Direction**: East
- **Color**: Green
- **Organs**: Liver, gallbladder

### Water (水 - Shuǐ)
- **Qualities**: Wisdom, adaptability, flow
- **Season**: Winter
- **Direction**: North
- **Color**: Black, dark blue
- **Organs**: Kidneys, bladder

### Fire (火 - Huǒ)
- **Qualities**: Passion, transformation, joy
- **Season**: Summer
- **Direction**: South
- **Color**: Red, orange
- **Organs**: Heart, small intestine

### Earth (土 - Tǔ)
- **Qualities**: Stability, nurturing, balance
- **Season**: Late summer / transitions
- **Direction**: Center
- **Color**: Yellow, brown
- **Organs**: Spleen, stomach

## The Cycles of Interaction

The elements interact through two main cycles:

### Generating Cycle (相生)
Wood feeds Fire → Fire creates Earth → Earth bears Metal → Metal collects Water → Water nourishes Wood

### Controlling Cycle (相克)
Wood parts Earth → Earth dams Water → Water extinguishes Fire → Fire melts Metal → Metal chops Wood

## Practical Applications

Understanding your dominant element can help you:
- Choose appropriate talismans
- Balance your living space
- Make decisions aligned with natural cycles
- Understand personal strengths and challenges

## Taking the Five Elements Quiz

Our Five Elements Quiz helps you discover your dominant element based on your birth information and personal focus areas. The results can guide you in selecting talismans that complement your natural tendencies.`,
    category: "encyclopedia",
    tags: ["five elements", "wu xing", "philosophy", "quiz"],
    author: "Master Chen",
    published: true,
    createdAt: "2025-01-20T14:00:00Z",
    updatedAt: "2025-01-20T14:00:00Z",
  },
  {
    id: "art-003",
    slug: "consecration-ritual-explained",
    title: "The Consecration Ritual: A Step-by-Step Guide",
    excerpt: "Learn about the sacred seven-step process that transforms a hand-drawn talisman into a blessed cultural artifact.",
    content: `# The Consecration Ritual: A Step-by-Step Guide

Every FuBao talisman undergoes a traditional seven-step consecration ritual performed by Master Chen in his Hong Kong temple. This ancient process transforms a hand-drawn design into a spiritually blessed cultural artifact.

## Step 1: Selection of Auspicious Date (择日)

The ritual begins with consulting the Chinese almanac to select an auspicious date. Factors considered include:

- Lunar calendar alignment
- Celestial configurations
- The intended purpose of the talisman
- The recipient's birth chart (for personalized talismans)

## Step 2: Purification (斋戒)

Before beginning the ritual, the master undergoes a period of purification:

- Fasting or dietary restrictions
- Meditation and mental preparation
- Cleansing of the ritual space
- Burning of purifying incense

## Step 3: Cinnabar Ink Preparation (朱砂)

The sacred cinnabar ink is prepared with care:

- High-quality cinnabar powder is selected
- Mixed with traditional binding agents
- Blessed through preliminary chants
- Tested for proper consistency

## Step 4: Hand-drawing the Talisman (手绘符箓)

The master enters a meditative state while drawing:

- Each stroke is deliberate and intentional
- Traditional symbols are rendered precisely
- The master's qi (energy) flows into the design
- No corrections or erasures are permitted

## Step 5: Chanting (诵经)

Sacred texts are recited throughout the process:

- Classic Taoist scriptures
- Invocations of protective deities
- Blessings for the recipient
- Mantras specific to the talisman's purpose

## Step 6: Consecration Ceremony (开光)

The formal consecration brings spiritual energy:

- Burning of specific incense blends
- Presentation before temple deities
- Final blessings and invocations
- Sealing of spiritual intent

## Step 7: Sealing (封装)

The completed talisman is carefully preserved:

- Placed in protective packaging
- Accompanied by a certificate of authenticity
- Sealed with the master's chop (stamp)
- Prepared for journey to recipient

## The Living Tradition

This seven-step process has been passed down through generations of Taoist masters. While the world has changed dramatically, the core principles remain: intention, craftsmanship, and respect for tradition.

Each FuBao talisman carries this living heritage—a connection to centuries of spiritual practice and cultural wisdom.`,
    category: "tutorial",
    tags: ["ritual", "consecration", "process", "tradition"],
    author: "Master Chen",
    published: true,
    createdAt: "2025-02-01T09:00:00Z",
    updatedAt: "2025-02-01T09:00:00Z",
  },
  {
    id: "art-004",
    slug: "new-spring-collection-2025",
    title: "Spring 2025 Collection: Renewal and Growth",
    excerpt: "Introducing our new Wood element talismans, designed for the season of renewal and fresh beginnings.",
    content: `# Spring 2025 Collection: Renewal and Growth

As spring approaches, we're excited to introduce our seasonal collection inspired by the Wood element—the force of growth, renewal, and new beginnings.

## The Wood Element in Spring

In Taoist philosophy, spring corresponds to the Wood element, representing:

- **Growth**: New projects, relationships, and opportunities
- **Flexibility**: Adapting to change with grace
- **Creativity**: Fresh ideas and artistic expression
- **Vitality**: Renewed energy and enthusiasm

## New Talismans in the Collection

### Spring Growth Talisman
Designed for those embarking on new ventures, this talisman incorporates:
- Flowing wood-grain patterns
- Green jade accents
- Symbols of sprouting and renewal

### Creative Flow Talisman
For artists, writers, and innovators:
- Brush-stroke inspired designs
- Bamboo motifs
- Energy channeling symbols

### Harmony Talisman
For balancing relationships and family:
- Intertwining branch patterns
- Flower blossom accents
- Unity and connection symbols

## Limited Edition Gift Sets

Our Spring Collection gift sets include:
- One seasonal talisman
- Hand-carved wooden stand
- Seasonal tea blend
- Cultural guide booklet

## Pre-order Information

Spring Collection items will be available for pre-order starting February 15th, with shipping beginning March 1st (coinciding with the traditional start of spring in the Chinese calendar).

## The Artisan's Note

"Each spring talisman is created during the weeks leading up to the season, absorbing the building energy of renewal. The master enters a contemplative state, connecting with the Wood element's growth energy while drawing each piece."

— Master Chen`,
    category: "news",
    tags: ["spring", "collection", "wood element", "new products"],
    author: "FuBao Team",
    published: true,
    createdAt: "2025-02-10T11:00:00Z",
    updatedAt: "2025-02-10T11:00:00Z",
  },
];

let articles = [...mockArticles];

// GET - List articles (with filtering and pagination)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const category = searchParams.get("category");
  const slug = searchParams.get("slug");
  const published = searchParams.get("published");

  // Get single article by slug
  if (slug) {
    const article = articles.find((a) => a.slug === slug);
    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      data: article,
    });
  }

  let filteredArticles = articles;

  // Filter by published status
  if (published !== null) {
    filteredArticles = articles.filter(
      (a) => a.published === (published === "true")
    );
  } else {
    // By default, only show published articles
    filteredArticles = articles.filter((a) => a.published);
  }

  // Filter by category
  if (category) {
    filteredArticles = filteredArticles.filter((a) => a.category === category);
  }

  // Sort by creation date (newest first)
  filteredArticles.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

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

// POST - Create a new article
export async function POST(request: NextRequest) {
  try {
    const {
      title,
      excerpt,
      content,
      category,
      tags = [],
      author,
      coverImage,
      slug,
    } = await request.json();

    if (!title || !content || !category || !author) {
      return NextResponse.json(
        { error: "title, content, category, and author are required" },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const articleSlug =
      slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    // Check for duplicate slug
    if (articles.some((a) => a.slug === articleSlug)) {
      return NextResponse.json(
        { error: "Article with this slug already exists" },
        { status: 409 }
      );
    }

    const newArticle: Article = {
      id: `art-${Date.now()}`,
      slug: articleSlug,
      title,
      excerpt: excerpt || content.substring(0, 150) + "...",
      content,
      category,
      tags,
      author,
      coverImage,
      published: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    articles.push(newArticle);

    return NextResponse.json(
      {
        success: true,
        data: newArticle,
        message: "Article created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create article error:", error);
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
}

// PUT - Update article
export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Article ID is required" },
        { status: 400 }
      );
    }

    const articleIndex = articles.findIndex((a) => a.id === id);
    if (articleIndex === -1) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    articles[articleIndex] = {
      ...articles[articleIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: articles[articleIndex],
    });
  } catch (error) {
    console.error("Update article error:", error);
    return NextResponse.json(
      { error: "Failed to update article" },
      { status: 500 }
    );
  }
}
