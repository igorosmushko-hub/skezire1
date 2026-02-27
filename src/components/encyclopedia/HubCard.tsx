import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import type { Zhuz } from '@/lib/types';

const ZHUZ_ICONS: Record<string, string> = {
  uly: '\uD83C\uDFD4\uFE0F',   // mountain
  orta: '\uD83C\uDF3E',          // grain
  kishi: '\uD83D\uDC0E',         // horse
  other: '\uD83D\uDC51',         // crown
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
      <div className="hub-card-icon">{ZHUZ_ICONS[zhuz.id] || '\uD83C\uDFD4\uFE0F'}</div>
      <h2 className="hub-card-name">{name}</h2>
      <div className="hub-card-count">
        {zhuz.tribes.length} {t('tribesWord')}
      </div>
      <p className="hub-card-desc">{desc}</p>
      <span className="hub-card-link">{t('openZhuz')}</span>
    </Link>
  );
}
