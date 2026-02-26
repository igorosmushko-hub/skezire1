import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://skezire.kz';
  const now = new Date();

  return [
    { url: `${baseUrl}/kk`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/ru`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/kk/encyclopedia`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/ru/encyclopedia`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
  ];
}
