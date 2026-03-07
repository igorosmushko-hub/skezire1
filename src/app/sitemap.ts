import type { MetadataRoute } from 'next';
import { TRIBES_DB } from '@/data/tribes';
import { BLOG_POSTS } from '@/data/blog';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://skezire.kz';
  const locales = ['kk', 'ru'];

  // Meaningful dates per section (updated when content actually changes)
  const DATES = {
    home: new Date('2026-03-06'),
    ai: new Date('2026-03-06'),
    encyclopedia: new Date('2026-03-01'),
    glossary: new Date('2026-02-28'),
    zhetiAta: new Date('2026-02-28'),
    blog: new Date('2026-03-03'),
    legal: new Date('2026-03-07'),
  };

  const entries: MetadataRoute.Sitemap = [];

  // Root — redirects to /kk
  entries.push({
    url: `${baseUrl}/`,
    lastModified: DATES.home,
    changeFrequency: 'weekly',
    priority: 1.0,
  });

  // Main pages
  for (const locale of locales) {
    entries.push({
      url: `${baseUrl}/${locale}`,
      lastModified: DATES.home,
      changeFrequency: 'weekly',
      priority: 1.0,
    });
    entries.push({
      url: `${baseUrl}/${locale}/glossary`,
      lastModified: DATES.glossary,
      changeFrequency: 'monthly',
      priority: 0.8,
    });
    entries.push({
      url: `${baseUrl}/${locale}/zheti-ata`,
      lastModified: DATES.zhetiAta,
      changeFrequency: 'monthly',
      priority: 0.9,
    });
    entries.push({
      url: `${baseUrl}/${locale}/encyclopedia`,
      lastModified: DATES.encyclopedia,
      changeFrequency: 'monthly',
      priority: 0.9,
    });
  }

  // Legal pages
  const legalPages = ['oferta', 'privacy', 'delivery', 'refund', 'contacts'];
  for (const locale of locales) {
    for (const page of legalPages) {
      entries.push({
        url: `${baseUrl}/${locale}/${page}`,
        lastModified: DATES.legal,
        changeFrequency: 'yearly',
        priority: 0.3,
      });
    }
  }

  // AI pages
  const aiFeatures = ['', '/past', '/ancestor', '/action-figure', '/pet-humanize', '/ghibli-style'];
  for (const locale of locales) {
    for (const feature of aiFeatures) {
      entries.push({
        url: `${baseUrl}/${locale}/ai${feature}`,
        lastModified: DATES.ai,
        changeFrequency: 'weekly',
        priority: 0.9,
      });
    }
  }

  // Blog
  for (const locale of locales) {
    // Blog hub uses the latest post date
    const latestPostDate = BLOG_POSTS.reduce((latest, post) => {
      const d = new Date(post.date);
      return d > latest ? d : latest;
    }, new Date('2026-01-01'));

    entries.push({
      url: `${baseUrl}/${locale}/blog`,
      lastModified: latestPostDate,
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
        lastModified: DATES.encyclopedia,
        changeFrequency: 'monthly',
        priority: 0.9,
      });
      for (const tribe of zhuz.tribes) {
        entries.push({
          url: `${baseUrl}/${locale}/encyclopedia/${zhuz.id}/${tribe.id}`,
          lastModified: DATES.encyclopedia,
          changeFrequency: 'monthly',
          priority: 0.8,
        });
      }
    }
  }

  return entries;
}
