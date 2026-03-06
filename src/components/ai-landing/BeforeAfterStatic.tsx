import Image from 'next/image';

interface Props {
  before: string;
  after: string;
  alt: string;
  locale: string;
}

export function BeforeAfterStatic({ before, after, alt, locale }: Props) {
  const isKk = locale === 'kk';

  return (
    <div className="ba-static">
      <div className="ba-static-side">
        <Image src={before} alt={`${alt} — ${isKk ? 'бұрын' : 'до'}`} width={540} height={540} sizes="(max-width: 768px) 45vw, 200px" />
        <span className="ba-static-tag">{isKk ? 'Бұрын' : 'До'}</span>
      </div>

      <div className="ba-static-arrow" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div className="ba-static-side">
        <Image src={after} alt={`${alt} — ${isKk ? 'кейін' : 'после'}`} width={540} height={540} sizes="(max-width: 768px) 45vw, 200px" />
        <span className="ba-static-tag ba-static-tag--after">{isKk ? 'Кейін' : 'После'}</span>
      </div>
    </div>
  );
}
