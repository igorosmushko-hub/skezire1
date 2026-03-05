import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const sessionUser = getSessionUser(req);
  if (!sessionUser) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const url = req.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'missing_url' }, { status: 400 });
  }

  // Only allow proxying from known Kie AI result domains
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith('aiquickdraw.com')) {
      return NextResponse.json({ error: 'invalid_url' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'invalid_url' }, { status: 400 });
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json({ error: 'fetch_failed' }, { status: 502 });
    }

    const blob = await res.blob();
    return new NextResponse(blob, {
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'image/jpeg',
        'Content-Disposition': 'attachment; filename="skezire-ai-result.jpg"',
      },
    });
  } catch {
    return NextResponse.json({ error: 'fetch_failed' }, { status: 502 });
  }
}
