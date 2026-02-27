import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
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
}

export function HubCard({ zhuz, locale }: HubCardProps) {
  const t = useTranslations('enc');
  const isKk = locale === 'kk';
  const name = isKk ? zhuz.kk : zhuz.ru;
  const desc = isKk ? zhuz.desc_kk : zhuz.desc_ru;

  return (
    <Link href={`/encyclopedia/${zhuz.id}`} className="hub-card">
      <div className="hub-card-icon">{ZHUZ_ICONS[zhuz.id] || '\uD83D\uDCDC'}</div>
      <div className="hub-card-title">{name}</div>
      <div className="hub-card-desc">{desc}</div>
      <div className="hub-card-count">
        {zhuz.tribes.length} {t('tribesWord')}
      </div>
      <div className="hub-card-btn">{t('openZhuz')} &rarr;</div>
    </Link>
  );
}
