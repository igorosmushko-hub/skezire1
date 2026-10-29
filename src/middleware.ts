import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const LOCALE_PREFIX = /^\/(kk|ru)(\/|$)/;

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // `/` is negotiated by next-intl (Accept-Language); `/kk/...` and `/ru/...` pass through.
  if (pathname === '/' || LOCALE_PREFIX.test(pathname)) {
    return intlMiddleware(request);
  }

  // Any other path without a locale prefix is a permanent move to the default locale.
  // nextUrl.clone() keeps the query string.
  const url = request.nextUrl.clone();
  url.pathname = `/${routing.defaultLocale}${pathname}`;
  return NextResponse.redirect(url, 308);
}

export const config = {
  // Skip /api, /_next, /admin and anything with a dot (robots.txt, sitemap.xml, feed.xml, icon.svg, ...).
  matcher: ['/((?!api(?:/|$)|_next(?:/|$)|admin(?:/|$)|.*\\..*).*)'],
};
