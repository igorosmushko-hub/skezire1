'use client';

import { useState, useEffect, useCallback } from 'react';

interface TribeStat {
  tribe_id: string;
  zhuz_id: string;
  member_count: number;
  today_count: number;
}

interface ZhuzStat {
  zhuzId: string;
  name_kk: string;
  name_ru: string;
  memberCount: number;
  tribes: TribeStat[];
}

interface TribeStatsData {
  totalUsers: number;
  zhuzStats: ZhuzStat[];
  tribes: TribeStat[];
}

export function useTribeStats(refreshInterval = 30000) {
  const [data, setData] = useState<TribeStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/tribe/stats');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchStats, refreshInterval]);

  return { data, loading, refetch: fetchStats };
}
