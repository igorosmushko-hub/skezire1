import { useTranslations } from 'next-intl';
import { TribeCardEnc } from './TribeCardEnc';
import type { Zhuz } from '@/lib/types';

interface ZhuzSectionProps {
  zhuz: Zhuz;
  locale: string;
}

export function ZhuzSection({ zhuz, locale }: ZhuzSectionProps) {
  const t = useTranslations('enc');
  const isKk = locale === 'kk';
  const name = isKk ? zhuz.kk : zhuz.ru;
  const desc = isKk ? zhuz.desc_kk : zhuz.desc_ru;

  // Group tribes by subgroup for Kishi zhuz
  const subgroups = new Map<string, typeof zhuz.tribes>();
  if (zhuz.id === 'kishi') {
    for (const tribe of zhuz.tribes) {
      const sg = (isKk ? tribe.subgroup_kk : tribe.subgroup_ru) || '';
      if (!subgroups.has(sg)) subgroups.set(sg, []);
      subgroups.get(sg)!.push(tribe);
    }
  }

  return (
    <section id={`zhuz-${zhuz.id}`} style={{ marginBottom: 64 }}>
      <div className="section-header">
        <div className="orn-line gold" />
        <h2 style={{ fontFamily: 'var(--ff-head)', fontSize: '1.75rem', color: 'var(--gold)', whiteSpace: 'nowrap' }}>
          {name} ({zhuz.tribes.length})
        </h2>
        <div className="orn-line gold" />
      </div>
      <p className="section-desc" style={{ marginTop: -24 }}>{desc}</p>

      {zhuz.id === 'kishi' ? (
        Array.from(subgroups.entries()).map(([sgName, tribes]) => (
          <div key={sgName} style={{ marginBottom: 32 }}>
            {sgName && (
              <h3 style={{
                fontFamily: 'var(--ff-head)',
                fontSize: '1.2rem',
                color: 'var(--blue)',
                marginBottom: 16,
                paddingBottom: 8,
                borderBottom: '2px solid rgba(200,168,75,.2)',
              }}>
                {sgName} ({tribes.length})
              </h3>
            )}
            <div className="enc-tribe-grid">
              {tribes.map((tribe) => (
                <TribeCardEnc key={tribe.id} tribe={tribe} locale={locale} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="enc-tribe-grid">
          {zhuz.tribes.map((tribe) => (
            <TribeCardEnc key={tribe.id} tribe={tribe} locale={locale} />
          ))}
        </div>
      )}
    </section>
  );
}
