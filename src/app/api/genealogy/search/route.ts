import { NextResponse } from 'next/server';
import {
  searchPublicGenealogy,
  searchRepositoryGenealogy,
} from '@/lib/genealogy-data';
import { normalizeTreeSearch } from '@/lib/tribe-tree';

const validLocale = (value: string | null) => value === 'ru' ? 'ru' : 'kk';
const validSource = (value: string | null) => Boolean(value && /^[a-z0-9_-]{1,64}$/.test(value));
const allowedSource = (value: string) => value === 'repo' || value === process.env.GENEALOGY_SOURCE?.trim();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get('source') ?? 'repo';
  const rawQuery = searchParams.get('q') ?? '';
  const query = source === 'repo' ? normalizeTreeSearch(rawQuery) : rawQuery.trim();
  const locale = validLocale(searchParams.get('locale'));
  const minQueryLength = source === 'repo' ? 2 : 3;
  if (!validSource(source) || !allowedSource(source) || query.length < minQueryLength || query.length > 80) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  try {
    const results = source === 'repo'
      ? searchRepositoryGenealogy(locale, query)
      : await searchPublicGenealogy(source, query);
    return NextResponse.json(
      { results },
      { headers: { 'Cache-Control': source === 'repo'
        ? 'public, s-maxage=60, stale-while-revalidate=300'
        : 'no-store' } },
    );
  } catch {
    return NextResponse.json({ error: 'genealogy_unavailable' }, { status: 503 });
  }
}
