import { BLOG_POSTS } from '@/data/blog';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const baseUrl = 'https://skezire.kz';

  const items = BLOG_POSTS.map(
    (post) => `
    <item>
      <title>${escapeXml(post.titleRu)}</title>
      <link>${baseUrl}/ru/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/ru/blog/${post.slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${escapeXml(post.descRu)}</description>
    </item>
    <item>
      <title>${escapeXml(post.titleKk)}</title>
      <link>${baseUrl}/kk/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/kk/blog/${post.slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${escapeXml(post.descKk)}</description>
    </item>`,
  ).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Шежіре — Блог</title>
    <link>${baseUrl}</link>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>Қазақ тарихы, шежіре, генеалогия, AI фото трансформация</description>
    <language>ru</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
