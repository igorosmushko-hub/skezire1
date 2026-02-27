import type { MetadataRoute } from 'next';
import { TRIBES_DB } from '@/data/tribes';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://skezire.kz';
  const now = new Date();
  const locales = ['kk', 'ru'];

  const entries: MetadataRoute.Sitemap = [];

  // Main pages
  for (const locale of locales) {
    entries.push({
      url: `${baseUrl}/${locale}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    });
    entries.push({
      url: `${baseUrl}/${locale}/encyclopedia`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    });
  }

  // Zhuz and tribe pages
  for (const locale of locales) {
    for (const zhuz of TRIBES_DB) {
      entries.push({
        url: `${baseUrl}/${locale}/encyclopedia/${zhuz.id}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.9,
      });
      for (const tribe of zhuz.tribes) {
        entries.push({
          url: `${baseUrl}/${locale}/encyclopedia/${zhuz.id}/${tribe.id}`,
          lastModified: now,
          changeFrequency: 'monthly',
          priority: 0.8,
        });
      }
    }
  }

  return entries;
}
