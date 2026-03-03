import type { MetadataRoute } from 'next';
import { TRIBES_DB } from '@/data/tribes';
import { BLOG_POSTS } from '@/data/blog';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://skezire.kz';
  const lastMod = new Date();
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
      url: `${baseUrl}/${locale}/glossary`,
      lastModified: lastMod,
      changeFrequency: 'monthly',
      priority: 0.8,
    });
    entries.push({
      url: `${baseUrl}/${locale}/zheti-ata`,
      lastModified: lastMod,
      changeFrequency: 'monthly',
      priority: 0.9,
    });
    entries.push({
      url: `${baseUrl}/${locale}/encyclopedia`,
      lastModified: lastMod,
      changeFrequency: 'monthly',
      priority: 0.9,
    });
  }

  // AI pages
  const aiFeatures = ['', '/action-figure', '/pet-humanize', '/ghibli-style'];
  for (const locale of locales) {
    for (const feature of aiFeatures) {
      entries.push({
        url: `${baseUrl}/${locale}/ai${feature}`,
        lastModified: lastMod,
        changeFrequency: 'weekly',
        priority: 0.9,
      });
    }
  }

  // Blog
  for (const locale of locales) {
    entries.push({
      url: `${baseUrl}/${locale}/blog`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
    for (const post of BLOG_POSTS) {
      entries.push({
        url: `${baseUrl}/${locale}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }
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
