'use client';

import { useEffect, useState } from 'react';

export interface Package {
  id: string;
  slug: string;
  name_ru: string;
  name_kk: string;
  generations: number;
  price_kzt: number;
}

export function usePackages(enabled = true) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    setLoading(true);
    setLoadError(false);
    setPackages([]);

    async function load() {
      try {
        const response = await fetch('/api/packages', {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Packages unavailable');
        const data = await response.json();
        if (!Array.isArray(data.packages)) throw new Error('Invalid packages');
        if (!controller.signal.aborted) setPackages(data.packages);
      } catch {
        if (!controller.signal.aborted) setLoadError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void load();
    return () => controller.abort();
  }, [enabled, attempt]);

  return { packages, loading, loadError, retry: () => setAttempt((value) => value + 1) };
}
