import { NextResponse } from 'next/server';
import {
  getPublicGenealogyChildren,
  getRepositoryChildren,
} from '@/lib/genealogy-data';

const validLocale = (value: string | null) => value === 'ru' ? 'ru' : 'kk';
const validKey = (value: string | null) => Boolean(value && value.length <= 200 && !/[\u0000-\u001f]/.test(value));
const validSource = (value: string | null) => Boolean(value && /^[a-z0-9_-]{1,64}$/.test(value));
const allowedSource = (value: string) => value === 'repo' || value === process.env.GENEALOGY_SOURCE?.trim();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const node = searchParams.get('node');
  const source = searchParams.get('source') ?? 'repo';
  const offsetValue = searchParams.get('offset') ?? '0';
  const offset = Number(offsetValue);
  if (!/^\d{1,7}$/.test(offsetValue) || !Number.isSafeInteger(offset) || offset > 1000000) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }
  const locale = validLocale(searchParams.get('locale'));
  if (!validKey(node) || !validSource(source) || !allowedSource(source)) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  try {
    const children = source === 'repo'
      ? getRepositoryChildren(locale, node!)
      : node!.startsWith(`${source}:`)
        ? await getPublicGenealogyChildren(node!, offset)
        : null;
    if (children === null) {
      return NextResponse.json({ error: 'node_not_found' }, { status: 404 });
    }
    return NextResponse.json(
      source === 'repo' ? { children, nextOffset: null } : children,
      { headers: { 'Cache-Control': source === 'repo'
        ? 'public, s-maxage=300, stale-while-revalidate=3600'
        : 'no-store' } },
    );
  } catch {
    return NextResponse.json({ error: 'genealogy_unavailable' }, { status: 503 });
  }
}
