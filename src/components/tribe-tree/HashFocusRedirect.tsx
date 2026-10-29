'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

// Node ids produced by buildTribeTree: `tribe:argyn`, `subtribe:argyn-meiram`, `zhuz:orta`, ...
const NODE_HASH = /^(?:(?:tribe|subtribe|zhuz|subgroup):.+|alash)$/;

/**
 * Article links point to the map as `/shezhire-tree?view=reference#tribe:argyn`, so the
 * crawlable href carries no `highlight=` query. The server builds the focused branch from
 * `?highlight=`, so on arrival the hash is turned into that query for the actual view.
 */
export function HashFocusRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasHighlight = searchParams.has('highlight');

  useEffect(() => {
    if (hasHighlight) return;
    const applyHash = () => {
      let focusId = '';
      try {
        focusId = decodeURIComponent(window.location.hash.replace(/^#/, ''));
      } catch {
        return;
      }
      if (!NODE_HASH.test(focusId)) return;
      const params = new URLSearchParams(window.location.search);
      params.set('highlight', focusId);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };
    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, [hasHighlight, pathname, router]);

  return null;
}
