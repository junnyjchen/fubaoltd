import type { MetadataRoute } from 'next';
import { getProducts, getArticles } from '@/lib/api';

const baseUrl = process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'https://fubao.co';

function staticPage(
  path: string,
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'],
  priority: number
): MetadataRoute.Sitemap[number] {
  return {
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, articles] = await Promise.all([
    getProducts(),
    getArticles(),
  ]);

  const productUrls: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/talisman/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const articleUrls: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/articles/${article.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [
    staticPage('/', 'daily', 1),
    staticPage('/talisman', 'daily', 0.9),
    ...productUrls,
    ...articleUrls,
    staticPage('/articles', 'weekly', 0.7),
    staticPage('/artisans', 'monthly', 0.6),
    staticPage('/blessing', 'weekly', 0.8),
    staticPage('/coupons', 'weekly', 0.7),
    staticPage('/rewards', 'weekly', 0.7),
    staticPage('/giveaways', 'weekly', 0.7),
    staticPage('/wishes', 'daily', 0.6),
    staticPage('/elements-quiz', 'monthly', 0.7),
    staticPage('/ai-chat', 'monthly', 0.6),
    staticPage('/referral', 'monthly', 0.5),
    staticPage('/verify', 'monthly', 0.6),
    staticPage('/about', 'monthly', 0.5),
    staticPage('/faq', 'monthly', 0.5),
  ];
}
