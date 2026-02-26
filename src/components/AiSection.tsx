'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AiModal } from './AiModal';

type AiType = 'past' | 'grandma' | 'story';

export function AiSection() {
  const t = useTranslations('ai');
  const [modalType, setModalType] = useState<AiType | null>(null);

  const cards: { type: AiType; icon: string; h3Key: string; pKey: string; tag1Key: string; tag2Key: string; featured?: boolean }[] = [
    { type: 'past', icon: '🕰️', h3Key: 'past.h3', pKey: 'past.p', tag1Key: 'past.tag1', tag2Key: 'past.tag2' },
    { type: 'grandma', icon: '👵', h3Key: 'gm.h3', pKey: 'gm.p', tag1Key: 'gm.tag1', tag2Key: 'gm.tag2', featured: true },
    { type: 'story', icon: '📖', h3Key: 'story.h3', pKey: 'story.p', tag1Key: 'story.tag1', tag2Key: 'story.tag2' },
  ];

  return (
    <>
      <section id="ai-section" className="ai-section">
        <div className="container">
          <div className="section-header">
            <div className="orn-line gold" />
            <h2 className="gold">{t('h2')}</h2>
            <div className="orn-line gold" />
          </div>
          <p className="section-desc dim">{t('desc')}</p>

          <div className="ai-grid">
            {cards.map((card) => (
              <div key={card.type} className={`ai-card ${card.featured ? 'featured' : ''}`}>
                <div className="ai-glow" />
                <span className="ai-badge">AI</span>
                <div className="ai-icon">{card.icon}</div>
                <h3>{t(card.h3Key)}</h3>
                <p>{t(card.pKey)}</p>
                <div className="ai-tags">
                  <span className="tag">{t(card.tag1Key)}</span>
                  <span className="tag">{t(card.tag2Key)}</span>
                </div>
                <button className="btn btn-ai" onClick={() => setModalType(card.type)}>
                  <span>{t('btn')}</span>
                  <span className="soon-badge">{t('soon')}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AiModal type={modalType} onClose={() => setModalType(null)} />
    </>
  );
}
