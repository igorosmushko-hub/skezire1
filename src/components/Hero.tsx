import { useTranslations } from 'next-intl';

export function Hero() {
  const t = useTranslations('hero');

  return (
    <section id="hero" className="hero">
      <div className="hero-pattern" />

      <div className="hero-ornament-wrap" aria-hidden="true">
        <svg className="hero-ornament-svg" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <circle cx="200" cy="200" r="188" fill="none" stroke="#C8A84B" strokeWidth="1" opacity=".25" />
          <circle cx="200" cy="200" r="155" fill="none" stroke="#C8A84B" strokeWidth=".5" opacity=".15" />
          <polygon
            points="200,20 231,126 327,73 274,169 380,200 274,231 327,327 231,274 200,380 169,274 73,327 126,231 20,200 126,169 73,73 169,126"
            fill="none" stroke="#C8A84B" strokeWidth="1.5" opacity=".5"
          />
          <polygon points="200,50 350,200 200,350 50,200" fill="none" stroke="#C8A84B" strokeWidth="1" opacity=".35" />
          <path d="M200,70 Q245,115 200,160 Q155,115 200,70" fill="none" stroke="#C8A84B" strokeWidth="2" opacity=".55" />
          <path d="M330,200 Q285,245 240,200 Q285,155 330,200" fill="none" stroke="#C8A84B" strokeWidth="2" opacity=".55" />
          <path d="M200,330 Q245,285 200,240 Q155,285 200,330" fill="none" stroke="#C8A84B" strokeWidth="2" opacity=".55" />
          <path d="M70,200 Q115,245 160,200 Q115,155 70,200" fill="none" stroke="#C8A84B" strokeWidth="2" opacity=".55" />
          <circle cx="200" cy="200" r="28" fill="none" stroke="#C8A84B" strokeWidth="2" opacity=".7" />
          <circle cx="200" cy="200" r="7" fill="#C8A84B" opacity=".9" />
          <circle cx="200" cy="20" r="4" fill="#C8A84B" opacity=".7" />
          <circle cx="380" cy="200" r="4" fill="#C8A84B" opacity=".7" />
          <circle cx="200" cy="380" r="4" fill="#C8A84B" opacity=".7" />
          <circle cx="20" cy="200" r="4" fill="#C8A84B" opacity=".7" />
        </svg>
      </div>

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
