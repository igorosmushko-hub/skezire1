'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { aiCardTry, aiCardDetails } from '@/lib/analytics';
import { AiModal } from './AiModal';
import { AiPastModal } from './AiPastModal';
import { AiAncestorModal } from './AiAncestorModal';
import { AiActionFigureModal } from './AiActionFigureModal';
import { AiPetHumanModal } from './AiPetHumanModal';
import { AiGhibliModal } from './AiGhibliModal';
import { AiNationalModal } from './AiNationalModal';

type AiType = 'fp' | 'past' | 'grandma' | 'figure' | 'pet' | 'ghibli' | 'national';

const SLUG_MAP: Record<string, string> = {
  fp: 'family-portrait',
  past: 'past',
  grandma: 'ancestor',
  figure: 'action-figure',
  pet: 'pet-humanize',
  ghibli: 'ghibli-style',
  national: 'national-costume',
};

const PAGE_TYPES = new Set(['fp']);

export function AiSection() {
  const t = useTranslations('ai');
  const locale = useLocale();
  const router = useRouter();
  const [modalType, setModalType] = useState<AiType | null>(null);

  const handleCardClick = (type: AiType) => {
    aiCardTry(type);
    if (PAGE_TYPES.has(type) && SLUG_MAP[type]) {
      router.push(`/${locale}/ai/${SLUG_MAP[type]}/create`);
    } else {
      setModalType(type);
    }
  };

  const cards: { type: AiType; icon: string; h3Key: string; pKey: string; tag1Key: string; tag2Key: string; featured?: boolean; live?: boolean; thumb?: string; popular?: boolean }[] = [
    { type: 'fp', icon: '👨‍👩‍👧‍👦', h3Key: 'fp.h3', pKey: 'fp.p', tag1Key: 'fp.tag1', tag2Key: 'fp.tag2', featured: true, live: true, thumb: '/ai-backgrounds/yurt.jpg', popular: true },
    { type: 'past', icon: '🕰️', h3Key: 'past.h3', pKey: 'past.p', tag1Key: 'past.tag1', tag2Key: 'past.tag2', live: true, thumb: '/ai-examples/past-1.webp', popular: true },
    { type: 'grandma', icon: '👵', h3Key: 'gm.h3', pKey: 'gm.p', tag1Key: 'gm.tag1', tag2Key: 'gm.tag2', featured: true, live: true, thumb: '/ai-examples/ancestor-rejuvenated.webp' },
    { type: 'figure', icon: '🎯', h3Key: 'figure.h3', pKey: 'figure.p', tag1Key: 'figure.tag1', tag2Key: 'figure.tag2', live: true, thumb: '/ai-examples/action-figure-1.webp', popular: true },
    { type: 'pet', icon: '🐾', h3Key: 'pet.h3', pKey: 'pet.p', tag1Key: 'pet.tag1', tag2Key: 'pet.tag2', live: true, thumb: '/ai-examples/pet-humanize-1.webp' },
    { type: 'ghibli', icon: '🎌', h3Key: 'ghibli.h3', pKey: 'ghibli.p', tag1Key: 'ghibli.tag1', tag2Key: 'ghibli.tag2', live: true, thumb: '/ai-examples/ghibli-style-1.webp' },
    { type: 'national', icon: '🏕️', h3Key: 'national.h3', pKey: 'national.p', tag1Key: 'national.tag1', tag2Key: 'national.tag2', live: true, popular: true },
  ];

  return (
    <>
      <section id="ai-section" className="ai-section">
        <div className="container">
          <div className="section-header">
            <h2>{t('h2')}</h2>
          </div>
          <p className="section-desc dim">{t('desc')}</p>

          <div className="ai-grid">
            {cards.map((card) => (
              <div key={card.type} className={`ai-card ${card.featured ? 'featured' : ''}`}>
                <div className="ai-glow" />
                <div className="ai-card-top">
                  <span className="ai-badge">AI</span>
                  {card.popular && <span className="ai-popular-badge">{locale === 'kk' ? 'Танымал' : 'Популярное'}</span>}
                </div>
                {card.thumb ? (
                  <div className="ai-card-thumb">
                    <Image src={card.thumb} alt={t(card.h3Key)} width={400} height={300} loading="lazy" />
                  </div>
                ) : (
                  <div className="ai-icon">{card.icon}</div>
                )}
                <h3>{t(card.h3Key)}</h3>
                <p>{t(card.pKey)}</p>
                <div className="ai-tags">
                  <span className="tag">{t(card.tag1Key)}</span>
                  <span className="tag">{t(card.tag2Key)}</span>
                </div>
                <div className="ai-card-actions">
                  <button className="btn btn-ai" onClick={() => handleCardClick(card.type)}>
                    <span>{t('btn')}</span>
                    {!card.live && <span className="soon-badge">{t('soon')}</span>}
                  </button>
                  <span className="ai-card-micro">{card.live ? (locale === 'kk' ? '10 сек • 3 тегін генерация' : '10 сек • 3 генерации бесплатно') : ''}</span>
                </div>
                {card.live && SLUG_MAP[card.type] && (
                  <Link
                    href={`/${locale}/ai/${SLUG_MAP[card.type]}`}
                    className="ai-card-details"
                    onClick={() => aiCardDetails(SLUG_MAP[card.type])}
                  >
                    {locale === 'kk' ? 'Толығырақ' : 'Подробнее'}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <AiPastModal open={modalType === 'past'} onClose={() => setModalType(null)} />
      <AiAncestorModal open={modalType === 'grandma'} onClose={() => setModalType(null)} />
      <AiActionFigureModal open={modalType === 'figure'} onClose={() => setModalType(null)} />
      <AiPetHumanModal open={modalType === 'pet'} onClose={() => setModalType(null)} />
      <AiGhibliModal open={modalType === 'ghibli'} onClose={() => setModalType(null)} />
      <AiNationalModal open={modalType === 'national'} onClose={() => setModalType(null)} />
      <AiModal type={modalType === 'past' || modalType === 'grandma' || modalType === 'figure' || modalType === 'pet' || modalType === 'ghibli' || modalType === 'fp' ? null : modalType as 'past' | 'grandma' | null} onClose={() => setModalType(null)} />
    </>
  );
}
