'use client';

export function LangSwitcher({ locale }: { locale: string }) {
  const switchLocale = (newLocale: 'kk' | 'ru') => {
    if (newLocale === locale) return;
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;
    localStorage.setItem('shejire-lang', newLocale);
    const path = window.location.pathname.replace(/^\/(?:kk|ru)(?=\/|$)/, `/${newLocale}`);
    window.location.assign(`${path}${window.location.search}${window.location.hash}`);
  };

  return (
    <div className="lang-switcher">
      <button
        className={`lang-btn ${locale === 'kk' ? 'active' : ''}`}
        onClick={() => switchLocale('kk')}
      >
        KK
      </button>
      <span className="lang-sep">/</span>
      <button
        className={`lang-btn ${locale === 'ru' ? 'active' : ''}`}
        onClick={() => switchLocale('ru')}
      >
        RU
      </button>
    </div>
  );
}
