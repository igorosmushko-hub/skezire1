import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/_next/', '/agents/', '/api/'],
      },
      {
        userAgent: 'Yandex',
        allow: '/',
        disallow: ['/_next/', '/agents/', '/api/'],
      },
    ],
    sitemap: 'https://skezire.kz/sitemap.xml',
    host: 'https://skezire.kz',
  };
}
