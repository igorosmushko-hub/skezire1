'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from './AuthProvider';
import { LoginModal } from './LoginModal';

function formatPhone(phone: string): string {
  if (phone.length < 6) return phone;
  // Show ••1234 format — compact, fits mobile
  return '••' + phone.slice(-4);
}

export function NavbarAuth() {
  const { user, loading, logout } = useAuth();
  const t = useTranslations('auth');
  const [showLogin, setShowLogin] = useState(false);

  if (loading) return null;

  if (user) {
    return (
      <div className="nav-auth">
        <span className="nav-user-phone">{formatPhone(user.phone)}</span>
        <button className="nav-logout-btn" onClick={logout}>{t('logout')}</button>
      </div>
    );
  }

  return (
    <>
      <button className="nav-login-btn" onClick={() => setShowLogin(true)}>
        {t('login')}
      </button>
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}
