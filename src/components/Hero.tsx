import { useTranslations } from 'next-intl';

export function Hero() {
  const t = useTranslations('hero');

  return (
    <section id="hero" className="hero">
      <div className="hero-ornament" />
      <div className="hero-content">
        <div className="hero-badge">{t('badge')}</div>
        <h1 className="hero-title">
          <span className="title-kaz">Шежіре</span>
          <span className="title-sub">{t('sub')}</span>
        </h1>
        <p className="hero-desc">{t('desc')}</p>
        <div className="hero-btns">
          <a href="#form-section" className="btn btn-primary">{t('btn.create')}</a>
          <a href="#about" className="btn btn-outline">{t('btn.learn')}</a>
        </div>
      </div>

      <div className="hero-scroll-hint"><span>↓</span></div>
    </section>
  );
}
