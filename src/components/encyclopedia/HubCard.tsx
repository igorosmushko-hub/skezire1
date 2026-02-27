import Link from 'next/link';
import type { Zhuz } from '@/lib/types';

const ZHUZ_ICONS: Record<string, string> = {
  uly: '\uD83C\uDFD4\uFE0F',
  orta: '\uD83C\uDF3E',
  kishi: '\uD83D\uDC0E',
  other: '\uD83D\uDC51',
};

interface HubCardProps {
  zhuz: Zhuz;
  locale: string;
  tribesWord: string;
  openLabel: string;
}

export function HubCard({ zhuz, locale, tribesWord, openLabel }: HubCardProps) {
  const isKk = locale === 'kk';
  const name = isKk ? zhuz.kk : zhuz.ru;
  const desc = isKk ? zhuz.desc_kk : zhuz.desc_ru;

  return (
    <Link href={`/${locale}/encyclopedia/${zhuz.id}`} className="hub-card">
      <div className="hub-card-icon">{ZHUZ_ICONS[zhuz.id] || '\uD83D\uDCDC'}</div>
      <div className="hub-card-title">{name}</div>
      <div className="hub-card-desc">{desc}</div>
      <div className="hub-card-count">
        {zhuz.tribes.length} {tribesWord}
      </div>
      <div className="hub-card-btn">{openLabel} &rarr;</div>
    </Link>
  );
}
