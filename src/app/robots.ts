import type { MetadataRoute } from 'next';

const baseUrl = process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'https://fubao.co';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/_next/',
        '/static/',
        // Private areas — never indexable
        '/admin/',
        '/merchant/',
        '/account',
        '/cart',
        '/checkout',
        '/order/',
        '/wallet',
        '/notifications',
        '/wishlist',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
