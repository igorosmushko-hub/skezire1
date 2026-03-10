'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useAuth } from './AuthProvider';
import { LoginModal } from './LoginModal';
import { authLoginOpen, authLogout } from '@/lib/analytics';

function formatPhone(phone: string): string {
  if (phone.length < 6) return phone;
  return '••' + phone.slice(-4);
}

export function NavbarAuth() {
  const { user, loading, logout } = useAuth();
  const t = useTranslations('auth');
  const locale = useLocale();
  const [showLogin, setShowLogin] = useState(false);

  if (loading) return null;

  if (user) {
    return (
      <div className="nav-auth">
        {typeof user.remaining === 'number' && (
          <span className="nav-balance" title={t('login')}>
            &#9889; {user.remaining}
          </span>
        )}
        <Link href="/profile" locale={locale} className="nav-user-phone nav-profile-link">
          {formatPhone(user.phone)}
        </Link>
        <button className="nav-logout-btn" onClick={() => { authLogout(); logout(); }}>{t('logout')}</button>
      </div>
    );
  }

  return (
    <>
      <button className="nav-login-btn" onClick={() => { authLoginOpen(); setShowLogin(true); }}>
        {t('login')}
      </button>
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}
