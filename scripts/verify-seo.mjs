// Run against `npm run build && npm run start -- --port 3106`.
import assert from 'node:assert/strict';

const base = process.argv[2] || 'http://127.0.0.1:3106';
const get = async (path) => {
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 200, path);
  return response.text();
};
const robots = await get('/robots.txt');
for (const group of robots.split(/\n\s*\n/).filter((part) => part.includes('User-Agent:'))) {
  assert.match(group, /^Allow: \/$/m);
  assert.match(group, /^Disallow: \/api\/$/m);
  assert.match(group, /^Disallow: \/agents\/$/m);
  assert.doesNotMatch(group, /^Disallow: \/_next/m);
}
const sitemap = await get('/sitemap.xml');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert.ok(urls.length > 100, 'sitemap must retain the content inventory');
assert.equal(new Set(urls).size, urls.length);
assert.ok(!urls.includes('https://skezire.kz/'));
assert.ok(!urls.some((url) => url.endsWith('/ai/family-portrait/create')));

const titles = [];
for (const locale of ['kk', 'ru']) {
  assert.ok(urls.includes(`https://skezire.kz/${locale}/pricing`));
  assert.ok(urls.includes(`https://skezire.kz/${locale}/shezhire-tree`));
  assert.ok(urls.includes(`https://skezire.kz/${locale}/ai/family-portrait`));
  const html = await get(`/${locale}`);
  for (const path of ['pricing', 'shezhire-tree']) {
    assert.match(html, new RegExp(`<a\\b[^>]*href="/${locale}/${path}"`));
    await get(`/${locale}/${path}`);
  }
  const hero = html.match(/<img\b[^>]*src="[^"]*ornament-hero[^>]*>/)?.[0];
  const about = html.match(/<img\b[^>]*src="[^"]*ornament-about[^>]*>/)?.[0];
  assert.ok(hero && about, 'both decorative images must be rendered in HTML');
  assert.match(hero, /sizes="100vw"/);
  assert.doesNotMatch(hero, /loading="lazy"/);
  assert.match(html, /<link\b[^>]*rel="preload"[^>]*imageSrcSet="[^"]*ornament-hero/);
  assert.match(about, /loading="lazy"/);
  assert.match(hero, /q=5/);
  assert.match(about, /q=5/);
  const create = await get(`/${locale}/ai/family-portrait/create`);
  assert.match(create, /<meta name="robots" content="noindex"/);
  const hub = await get(`/${locale}/ai`);
  titles.push(hub.match(/<title>([^<]+)<\/title>/)?.[1]);
  assert.match(hub, new RegExp(`rel="canonical" href="https://skezire.kz/${locale}/ai"`));
}
assert.ok(titles.every(Boolean));
assert.notEqual(titles[0], titles[1]);
console.log(`PASS: robots, ${urls.length} sitemap URLs, kk/ru public links, image loading, form noindex and localized AI titles.`);
