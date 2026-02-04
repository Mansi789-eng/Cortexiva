import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://cortexiva.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/create-bot/',
          '/create-bot-dashboard/',
          '/configuration-bot/',
          '/test-bot/',
          '/reset-password/',
          '/forgot-password/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
