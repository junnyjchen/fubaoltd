/**
 * Article store — the single source of truth for culture articles.
 *
 * Previously `/api/articles` route.ts kept its own module-level array while
 * `/articles` pages read a *different* static array in `lib/api/index.ts`,
 * so articles published from the admin AI-training console never appeared
 * on the storefront. Both sides now read/write this store.
 *
 * Persists on globalThis (`__fubaoArticles`) so dev-mode module
 * re-instantiation never wipes published articles.
 */

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

const globalStore = globalThis as unknown as {
  __fubaoArticles?: Article[];
};

const seedArticles: Article[] = [
  {
    id: "art-001",
    slug: "history-of-taoist-talismans",
    title: "The Ancient History of Taoist Talismans",
    excerpt:
      "Explore the 2000-year tradition of Taoist talisman creation and its significance in Chinese spiritual culture.",
    content:
      "# The Ancient History of Taoist Talismans\n\nTaoist talismans, known as \"Fu\" (符) in Chinese, represent one of the most fascinating aspects of Eastern spiritual tradition. For over two millennia, these hand-drawn symbols have carried the hopes and intentions of their keepers.\n\n## Origins in the Han Dynasty\n\nThe earliest recorded talismans date back to the Han Dynasty (206 BCE – 220 CE), when Taoist practitioners began codifying the brushwork traditions that survive to this day.\n\n## The Art of the Brush\n\nEach talisman begins with a single uninterrupted stroke — the \"cloud seal\" script that practitioners spend years mastering. The ink, the paper, and the intention are considered inseparable.\n\n## A Living Cultural Artifact\n\nAt FuBao, every piece follows these traditional practices. Our artisans study under masters who trace their lineage back generations, ensuring each talisman honors the craft's deep history.",
    category: "encyclopedia",
    tags: ["history", "talisman", "culture"],
    author: "Master Chen",
    published: true,
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "art-002",
    slug: "five-elements-guide",
    title: "Understanding the Five Elements (Wu Xing)",
    excerpt:
      "A comprehensive guide to Metal, Wood, Water, Fire, and Earth—the fundamental forces in Taoist philosophy.",
    content:
      "# Understanding the Five Elements (Wu Xing)\n\nThe Five Elements theory is a fundamental concept in Taoist philosophy, describing the interactions and relationships between all things in the universe.\n\n## The Five Elements\n\n- **Wood (木)** — growth, expansion, vitality\n- **Fire (火)** — energy, passion, transformation\n- **Earth (土)** — stability, nourishment, grounding\n- **Metal (金)** — structure, precision, clarity\n- **Water (水)** — flow, wisdom, adaptability\n\n## Generating and Overcoming Cycles\n\nThe elements exist in dynamic balance: Wood feeds Fire, Fire creates Earth (ash), Earth bears Metal, Metal collects Water, and Water nourishes Wood. This \"generative cycle\" (相生) is balanced by the \"overcoming cycle\" (相克).\n\n## Finding Your Element\n\nOur Five Elements quiz uses your birth year and season to identify your dominant element — the same traditional method our artisans apply when recommending talismans.",
    category: "encyclopedia",
    tags: ["five elements", "wu xing", "philosophy"],
    author: "Master Chen",
    published: true,
    createdAt: "2025-01-20T14:00:00Z",
    updatedAt: "2025-01-20T14:00:00Z",
  },
  {
    id: "art-003",
    slug: "consecration-ritual-explained",
    title: "The Consecration Ritual: A Step-by-Step Guide",
    excerpt:
      "Learn about the sacred seven-step process that transforms a hand-drawn talisman into a blessed cultural artifact.",
    content:
      "# The Consecration Ritual\n\nEvery FuBao talisman undergoes a traditional seven-step consecration ritual before it ships to its keeper.\n\n## The Seven Steps\n\n1. **Purification** — the workshop is cleansed with sandalwood incense\n2. **Invocation** — the artisan sets their intention for the piece\n3. **The First Stroke** — the cloud-seal script is drawn in one continuous breath\n4. **Sealing** — the vermillion seal is applied with the master's chop\n5. **Drying** — the piece rests on a cedar rack for 24 hours\n6. **Registration** — each talisman receives its unique verification code\n7. **Wrapping** — the artifact is wrapped in traditional red paper\n\n## Verification\n\nEvery piece carries a unique code you can verify on our verification page, connecting your talisman to its ceremony record.",
    category: "tutorial",
    tags: ["ritual", "consecration", "process"],
    author: "Master Chen",
    published: true,
    createdAt: "2025-02-01T09:00:00Z",
    updatedAt: "2025-02-01T09:00:00Z",
  },
  {
    id: "art-004",
    slug: "new-spring-collection-2025",
    title: "Spring 2025 Collection: Renewal and Growth",
    excerpt:
      "Introducing our new Wood element talismans, designed for the season of renewal and fresh beginnings.",
    content:
      "# Spring 2025 Collection\n\nAs spring approaches, we're excited to introduce our seasonal Wood element collection — pieces designed around themes of renewal, growth, and fresh beginnings.\n\n## What's New\n\nThe collection features three new designs, each drawn by our senior artisans during the first week of the lunar new year.\n\n## Limited Availability\n\nSpring collection pieces are drawn in limited batches. Each is consecrated during the Jingzhe (惊蛰) solar term, traditionally associated with awakening and new energy.\n\n*All pieces are cultural artifacts and keepsakes — for entertainment purposes only.*",
    category: "news",
    tags: ["spring", "collection", "wood element"],
    author: "FuBao Team",
    published: true,
    createdAt: "2025-02-10T11:00:00Z",
    updatedAt: "2025-02-10T11:00:00Z",
  },
];

function getStore(): Article[] {
  globalStore.__fubaoArticles ??= seedArticles.map((a) => ({ ...a }));
  return globalStore.__fubaoArticles;
}

export function listArticles(options?: {
  category?: string;
  publishedOnly?: boolean;
}): Article[] {
  let list = getStore();
  if (options?.publishedOnly) {
    list = list.filter((a) => a.published);
  }
  if (options?.category) {
    list = list.filter((a) => a.category === options.category);
  }
  return [...list].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getArticleBySlug(slug: string): Article | null {
  return getStore().find((a) => a.slug === slug) ?? null;
}

export function getArticleById(id: string): Article | null {
  return getStore().find((a) => a.id === id) ?? null;
}

export function hasArticleSlug(slug: string): boolean {
  return getStore().some((a) => a.slug === slug);
}

const VALID_CATEGORIES: Article["category"][] = [
  "news",
  "encyclopedia",
  "tutorial",
  "culture",
];

export function isValidArticleCategory(category: string): boolean {
  return VALID_CATEGORIES.includes(category as Article["category"]);
}

export function slugifyArticleTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export interface CreateArticleInput {
  title: string;
  excerpt?: string;
  content: string;
  category: Article["category"];
  tags?: string[];
  author: string;
  coverImage?: string;
  slug?: string;
  published?: boolean;
}

export function createArticle(input: CreateArticleInput): Article {
  const store = getStore();
  const now = new Date().toISOString();
  const article: Article = {
    id: `art-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    slug: input.slug ?? slugifyArticleTitle(input.title),
    title: input.title,
    excerpt:
      input.excerpt && input.excerpt.trim().length > 0
        ? input.excerpt
        : `${input.content.replace(/[#*\n]/g, " ").trim().slice(0, 147)}...`,
    content: input.content,
    category: input.category,
    tags: input.tags ?? [],
    author: input.author,
    coverImage: input.coverImage,
    published: input.published ?? true,
    createdAt: now,
    updatedAt: now,
  };
  store.push(article);
  return article;
}

export function updateArticle(
  id: string,
  updates: Partial<Omit<Article, "id" | "createdAt">>
): Article | null {
  const store = getStore();
  const index = store.findIndex((a) => a.id === id);
  if (index === -1) return null;
  store[index] = {
    ...store[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return store[index];
}
