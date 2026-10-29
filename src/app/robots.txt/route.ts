// robots.txt is a route handler instead of src/app/robots.ts: the Next.js
// MetadataRoute.Robots API has no `Clean-param` (a Yandex-only directive),
// so the file is written by hand. The output otherwise matches what robots.ts produced.

export const dynamic = 'force-static';

const DISALLOW = ['/agents/', '/api/'];

// Yandex: ignore these query parameters on the map page (article links use #hash;
// the parameters stay valid for shared links).
const CLEAN_PARAMS = ['/kk/shezhire-tree', '/ru/shezhire-tree'].map(
  (path) => `Clean-param: highlight&view ${path}`,
);

const body = [
  'User-Agent: *',
  'Allow: /',
  ...DISALLOW.map((path) => `Disallow: ${path}`),
  '',
  'User-Agent: Yandex',
  'Allow: /',
  ...DISALLOW.map((path) => `Disallow: ${path}`),
  ...CLEAN_PARAMS,
  '',
  'Host: https://skezire.kz',
  'Sitemap: https://skezire.kz/sitemap.xml',
  '',
].join('\n');

export function GET() {
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
