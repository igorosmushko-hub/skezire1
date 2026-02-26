'use client';

import { useRouter, usePathname } from '@/i18n/routing';

export function LangSwitcher({ locale }: { locale: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: 'kk' | 'ru') => {
    if (newLocale === locale) return;
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;
    localStorage.setItem('shejire-lang', newLocale);
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="lang-switcher">
      <button
        className={`lang-btn ${locale === 'kk' ? 'active' : ''}`}
        onClick={() => switchLocale('kk')}
      >
        ҚАЗ
      </button>
      <span className="lang-sep">|</span>
      <button
        className={`lang-btn ${locale === 'ru' ? 'active' : ''}`}
        onClick={() => switchLocale('ru')}
      >
        РУС
      </button>
    </div>
  );
}
