import type { MetadataRoute } from 'next';
import { TRIBES_DB } from '@/data/tribes';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://skezire.kz';
  const lastMod = new Date('2026-02-27');
  const locales = ['kk', 'ru'];

  const entries: MetadataRoute.Sitemap = [];

  // Root — redirects to /kk
  entries.push({
    url: `${baseUrl}/`,
    lastModified: lastMod,
    changeFrequency: 'weekly',
    priority: 1.0,
  });

  // Main pages
  for (const locale of locales) {
    entries.push({
      url: `${baseUrl}/${locale}`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 1.0,
    });
    entries.push({
      url: `${baseUrl}/${locale}/encyclopedia`,
      lastModified: lastMod,
      changeFrequency: 'monthly',
      priority: 0.9,
    });
  }

  // Zhuz and tribe pages
  for (const locale of locales) {
    for (const zhuz of TRIBES_DB) {
      entries.push({
        url: `${baseUrl}/${locale}/encyclopedia/${zhuz.id}`,
        lastModified: lastMod,
        changeFrequency: 'monthly',
        priority: 0.9,
      });
      for (const tribe of zhuz.tribes) {
        entries.push({
          url: `${baseUrl}/${locale}/encyclopedia/${zhuz.id}/${tribe.id}`,
          lastModified: lastMod,
          changeFrequency: 'monthly',
          priority: 0.8,
        });
      }
    }
  }

  return entries;
}
