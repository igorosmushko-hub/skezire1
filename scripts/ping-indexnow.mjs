// Ping IndexNow with all important URLs
// Usage: node scripts/ping-indexnow.mjs

const INDEXNOW_KEY = 'f9c28d4c10bfc42fc067525f933b8b2e';
const SITE_HOST = 'skezire.kz';
const SITE_URL = `https://${SITE_HOST}`;

const locales = ['kk', 'ru'];
const pages = [
  '', '/ai', '/encyclopedia', '/glossary', '/zheti-ata', '/blog',
  '/ai/past', '/ai/ancestor', '/ai/action-figure', '/ai/pet-humanize',
  '/ai/ghibli-style', '/ai/family-portrait', '/ai/national-costume',
  '/ai/family-portrait/create', '/order/canvas', '/pricing',
  '/leaderboard', '/shezhire-tree',
];

const urls = locales.flatMap((locale) =>
  pages.map((page) => `${SITE_URL}/${locale}${page}`)
);

console.log(`Submitting ${urls.length} URLs to IndexNow...\n`);

const res = await fetch('https://api.indexnow.org/IndexNow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: SITE_HOST,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  }),
});

console.log(`IndexNow response: ${res.status} ${res.statusText}`);
if (res.status === 200 || res.status === 202) {
  console.log(`✓ ${urls.length} URLs submitted successfully`);
} else {
  const text = await res.text();
  console.error('Response:', text);
}
