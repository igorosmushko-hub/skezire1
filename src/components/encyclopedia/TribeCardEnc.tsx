import Link from 'next/link';
import type { Tribe } from '@/lib/types';

interface TribeCardEncProps {
  tribe: Tribe;
  locale: string;
  zhuzId: string;
  moreLabel: string;
}

export function TribeCardEnc({ tribe, locale, zhuzId, moreLabel }: TribeCardEncProps) {
  const isKk = locale === 'kk';

  const name = isKk ? tribe.kk : tribe.ru;
  const altName = isKk ? tribe.ru : tribe.kk;
  const desc = isKk ? tribe.desc_kk : tribe.desc_ru;
  const region = isKk ? tribe.region_kk : tribe.region_ru;
  const subgroup = isKk ? tribe.subgroup_kk : tribe.subgroup_ru;

  return (
    <Link
      href={`/${locale}/encyclopedia/${zhuzId}/${tribe.id}`}
      className="tribe-card"
    >
      <div className="tribe-card-header">
        <div className="tribe-card-tamga">{tribe.tamga}</div>
        <div>
          <div className="tribe-card-name">{name}</div>
          {altName && <div className="tribe-card-subname">{altName}</div>}
        </div>
      </div>
      {subgroup && <div className="tribe-card-subgroup">{subgroup}</div>}
      <div className="tribe-card-desc">{desc}</div>
      <div className="tribe-card-meta">
        {region && <span>{'\uD83D\uDCCD'} {region}</span>}
        {tribe.uran && <span>{'\uD83D\uDCE3'} {tribe.uran}</span>}
      </div>
      <div className="tribe-card-link">{moreLabel}</div>
    </Link>
  );
}
