'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { buildTreeSVG } from '@/lib/tree-svg';
import { ShareImage } from './ShareImage';
import type { TreeFormData } from '@/lib/types';

interface TreeSectionProps {
  data: TreeFormData;
  locale: string;
}

export function TreeSection({ data, locale }: TreeSectionProps) {
  const t = useTranslations('tree');
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data]);

  // Build nodes: ancestors reversed (oldest first) + user node
  const ancestors = [...data.ancestors].reverse();
  const nodes = [
    ...ancestors.map((a) => ({ kaz: a.kaz, label: a.label, name: a.name })),
    { kaz: '', label: '', name: data.name, isUser: true },
  ];

  const isKk = locale === 'kk';
  const title = data.ru
    ? isKk
      ? `${data.ru} шежіресі`
      : `Шежіре рода ${data.ru}`
    : isKk
      ? `${data.name} шежіресі`
      : `Шежіре ${data.name}`;

  const svgString = buildTreeSVG(nodes, t('unknown'));

  // Calculate stats
  const stats = useMemo(() => {
    const filledAncestors = data.ancestors.filter((a) => a.name.trim()).length;
    const totalAncestors = data.ancestors.length;
    const pct = Math.round((filledAncestors / totalAncestors) * 100);
    const yearsSpan = filledAncestors * 25; // ~25 years per generation
    const deepestGen = (() => {
      // Find the deepest filled generation (ancestors are in order 1->7)
      for (let i = totalAncestors - 1; i >= 0; i--) {
        if (data.ancestors[i].name.trim()) return i + 1;
      }
      return 0;
    })();

    return { filledAncestors, totalAncestors, pct, yearsSpan, deepestGen };
  }, [data]);

  return (
    <section id="tree-section" className="tree-section" ref={sectionRef}>
      <div className="container">
        <div className="section-header">
          <div className="orn-line" />
          <h2>{title}</h2>
          <div className="orn-line" />
        </div>

        <div className="tree-meta" id="tree-meta">
          {data.zhuzLabel && (
            <div className="tree-tag">
              <span>{t('tag.zhuz')}:</span> <strong>{data.zhuzLabel}</strong>
            </div>
          )}
          {data.ru && (
            <div className="tree-tag">
              <span>{t('tag.ru')}:</span> <strong>{data.ru}</strong>
            </div>
          )}
          {data.birthYear && (
            <div className="tree-tag">
              <span>{t('tag.year')}:</span> <strong>{data.birthYear}</strong>
            </div>
          )}
        </div>

        {/* ── Stats block ── */}
        <div className="tree-stats">
          <div className="tree-stat-card">
            <span className="tree-stat-value">{stats.filledAncestors}/{stats.totalAncestors}</span>
            <span className="tree-stat-label">{t('stats.known')}</span>
          </div>
          <div className="tree-stat-card">
            <span className="tree-stat-value">{stats.deepestGen > 0 ? stats.deepestGen : '—'}</span>
            <span className="tree-stat-label">{t('stats.deepest')}</span>
          </div>
          <div className="tree-stat-card">
            <span className="tree-stat-value">~{stats.yearsSpan}</span>
            <span className="tree-stat-label">{t('stats.years')}</span>
          </div>
          <div className="tree-stat-card tree-stat-accent">
            <span className="tree-stat-value">{stats.pct}%</span>
            <span className="tree-stat-label">{t('stats.filled')}</span>
          </div>
        </div>

        {/* Motivational message */}
        {stats.pct < 100 && (
          <div className="tree-encourage">
            {stats.pct === 0 && t('encourage.empty')}
            {stats.pct > 0 && stats.pct < 50 && t('encourage.low')}
            {stats.pct >= 50 && stats.pct < 100 && t('encourage.mid')}
          </div>
        )}
        {stats.pct === 100 && (
          <div className="tree-encourage tree-encourage-gold">
            {t('encourage.full')}
          </div>
        )}

        <div className="tree-wrapper">
          <div
            className="tree-container"
            dangerouslySetInnerHTML={{ __html: svgString }}
          />
        </div>

        <div className="tree-legend">
          <div className="legend-item">
            <div className="legend-dot legend-blue" />
            <span>{t('legend.known')}</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot legend-empty" />
            <span>{t('legend.unknown')}</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot legend-gold" />
            <span>{t('legend.you')}</span>
          </div>
        </div>

        <ShareImage data={data} locale={locale} nodes={nodes} />
      </div>
    </section>
  );
}
