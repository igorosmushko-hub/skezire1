import { NextRequest, NextResponse } from 'next/server';

const INDEXNOW_KEY = 'f9c28d4c10bfc42fc067525f933b8b2e';
const SITE_HOST = 'skezire.kz';
const SITE_URL = `https://${SITE_HOST}`;

/**
 * POST /api/indexnow — submit URLs for instant indexing via IndexNow.
 * Body: { urls: string[], secret: string }
 */
export async function POST(req: NextRequest) {
  let body: { urls?: string[]; secret?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { urls, secret } = body;

  // Simple secret check to prevent abuse
  if (secret !== process.env.INDEXNOW_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json({ error: 'urls_required' }, { status: 400 });
  }

  // Ensure all URLs belong to our domain
  const validUrls = urls
    .filter((u) => typeof u === 'string' && u.startsWith(SITE_URL))
    .slice(0, 100); // Max 100 URLs per batch

  if (validUrls.length === 0) {
    return NextResponse.json({ error: 'no_valid_urls' }, { status: 400 });
  }

  try {
    const response = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: SITE_HOST,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: validUrls,
      }),
    });

    return NextResponse.json({
      status: response.status,
      submitted: validUrls.length,
      message: response.status === 200 || response.status === 202
        ? 'URLs submitted successfully'
        : `IndexNow responded with ${response.status}`,
    });
  } catch (err) {
    console.error('IndexNow submission error:', err);
    return NextResponse.json({ error: 'submission_failed' }, { status: 502 });
  }
}

/**
 * GET /api/indexnow — submit all important URLs at once (manual trigger).
 * Use: curl https://skezire.kz/api/indexnow?secret=YOUR_SECRET
 */
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.INDEXNOW_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

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

  try {
    const response = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: SITE_HOST,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    });

    return NextResponse.json({
      status: response.status,
      submitted: urls.length,
      urls,
    });
  } catch (err) {
    console.error('IndexNow bulk submission error:', err);
    return NextResponse.json({ error: 'submission_failed' }, { status: 502 });
  }
}
