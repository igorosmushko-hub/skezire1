'use client';

import { useState, useCallback } from 'react';
import { TRIBES_DB } from '@/data/tribes';
import { useTribeStats } from '@/hooks/useTribeStats';
import { TribeJoinModal } from './TribeJoinModal';
import type { Tribe, Zhuz } from '@/lib/types';

interface Props {
  locale: string;
  highlightTribeId?: string;
}

export function InteractiveTree({ locale, highlightTribeId }: Props) {
  const isKk = locale === 'kk';
  const { data: stats } = useTribeStats();
  const [expandedZhuz, setExpandedZhuz] = useState<string[]>(
    highlightTribeId ? TRIBES_DB.map((z) => z.id) : []
  );
  const [selectedTribe, setSelectedTribe] = useState<{ tribe: Tribe; zhuz: Zhuz } | null>(null);

  const getMemberCount = useCallback(
    (tribeId: string) => stats?.tribes.find((t) => t.tribe_id === tribeId)?.member_count ?? 0,
    [stats]
  );

  const getZhuzMemberCount = useCallback(
    (zhuzId: string) => stats?.zhuzStats.find((z) => z.zhuzId === zhuzId)?.memberCount ?? 0,
    [stats]
  );

  const toggleZhuz = (zhuzId: string) => {
    setExpandedZhuz((prev) =>
      prev.includes(zhuzId) ? prev.filter((id) => id !== zhuzId) : [...prev, zhuzId]
    );
  };

  const groupTribes = (zhuz: Zhuz) => {
    if (zhuz.id !== 'kishi') return [{ name: '', tribes: zhuz.tribes }];
    const groups: Record<string, Tribe[]> = {};
    for (const t of zhuz.tribes) {
      const key = (isKk ? t.subgroup_kk : t.subgroup_ru) ?? '';
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    }
    return Object.entries(groups).map(([name, tribes]) => ({ name, tribes }));
  };

  return (
    <div>
      {/* Алаш root */}
      <div className="tree-root">
        <div className="tree-root-badge">
          <span>АЛАШ</span>
          {stats && (
            <span className="tree-root-count">
              {stats.totalUsers.toLocaleString()} {isKk ? 'мүше' : 'участников'}
            </span>
          )}
        </div>
        <div className="tree-root-line" />
      </div>

      {/* Жузы */}
      <div className="tree-zhuzs">
        {TRIBES_DB.map((zhuz) => {
          const isExpanded = expandedZhuz.includes(zhuz.id);
          const zhuzCount = getZhuzMemberCount(zhuz.id);
          const groups = groupTribes(zhuz);

          return (
            <div key={zhuz.id} className="tree-zhuz">
              <button
                className="tree-zhuz-header"
                onClick={() => toggleZhuz(zhuz.id)}
              >
                <div className="tree-zhuz-header-left">
                  <div className={`tree-zhuz-icon tree-zhuz-icon--${zhuz.id}`}>
                    {zhuz.tribes.length}
                  </div>
                  <div>
                    <h3 className="tree-zhuz-name">{isKk ? zhuz.kk : zhuz.ru}</h3>
                    <p className="tree-zhuz-meta">
                      {zhuz.tribes.length} {isKk ? 'ру' : 'родов'}
                      {zhuzCount > 0 && ` · ${zhuzCount.toLocaleString()} ${isKk ? 'мүше' : 'уч.'}`}
                    </p>
                  </div>
                </div>
                <svg
                  className={`tree-zhuz-arrow ${isExpanded ? 'tree-zhuz-arrow--open' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isExpanded && (
                <div className="tree-zhuz-body">
                  {groups.map((group) => (
                    <div key={group.name || 'all'}>
                      {group.name && (
                        <h4 className={`tree-subgroup-label tree-subgroup-label--${zhuz.id}`}>
                          {group.name}
                        </h4>
                      )}
                      <div className="tree-tribes-grid">
                        {group.tribes.map((tribe) => {
                          const count = getMemberCount(tribe.id);
                          const isHighlighted = tribe.id === highlightTribeId;

                          return (
                            <button
                              key={tribe.id}
                              className={`tree-tribe-card ${isHighlighted ? `tree-tribe-card--highlighted tree-tribe-card--${zhuz.id}` : ''}`}
                              onClick={() => setSelectedTribe({ tribe, zhuz })}
                            >
                              <span className="tree-tribe-tamga">{tribe.tamga}</span>
                              <span className="tree-tribe-name">
                                {isKk ? tribe.kk : tribe.ru}
                              </span>
                              {count > 0 && (
                                <span className={`tree-tribe-count tree-tribe-count--${zhuz.id}`}>
                                  {count.toLocaleString()}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedTribe && (
        <TribeJoinModal
          tribe={selectedTribe.tribe}
          zhuz={selectedTribe.zhuz}
          locale={locale}
          onClose={() => setSelectedTribe(null)}
          onJoined={() => {
            setSelectedTribe(null);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
