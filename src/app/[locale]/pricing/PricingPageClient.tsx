'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { RobokassaWidget } from '@/components/RobokassaWidget';
import { LoginModal } from '@/components/LoginModal';
import { useAuth } from '@/components/AuthProvider';
import '@/styles/pricing-page.css';

interface Package {
  id: string;
  slug: string;
  name_ru: string;
  name_kk: string;
  generations: number;
  price_kzt: number;
}

export function PricingPageClient({ locale }: { locale: string }) {
  const t = useTranslations('pricing');
  const { user } = useAuth();
  const isKk = locale === 'kk';
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<{ url: string; params: Record<string, unknown> } | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/packages')
      .then((r) => r.json())
      .then((d) => setPackages(d.packages))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleBuy = useCallback(async (pkg: Package) => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    setBuying(pkg.id);
    setError('');
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: pkg.id, locale }),
      });
      const data = await res.json();
      if (res.ok && data.url && data.params) {
        setPaymentData({ url: data.url, params: data.params });
      } else if (res.status === 401) {
        setShowLogin(true);
        setBuying(null);
      } else {
        setError(t('buyError'));
        setBuying(null);
      }
    } catch {
      setError(t('buyError'));
      setBuying(null);
    }
  }, [locale, user, t]);

  return (
    <main className="pricing-page">
      <div className="container">
        <div className="pricing-page-header">
          <h1>{t('title')}</h1>
          <p>{t('subtitle')}</p>
        </div>

        {loading ? (
          <div className="pricing-page-loading">...</div>
        ) : (
          <div className="pricing-page-grid">
            {packages.map((pkg) => {
              const perGen = Math.round(pkg.price_kzt / pkg.generations);
              const isPopular = pkg.slug === 'standard';
              return (
                <div key={pkg.id} className={`pricing-page-card${isPopular ? ' popular' : ''}`}>
                  {isPopular && <span className="pricing-page-badge">{t('popular')}</span>}
                  <div className="pricing-page-name">{isKk ? pkg.name_kk : pkg.name_ru}</div>
                  <div className="pricing-page-gens">{pkg.generations}</div>
                  <div className="pricing-page-gens-label">{t('generations')}</div>
                  <div className="pricing-page-price">{pkg.price_kzt.toLocaleString()} &#8376;</div>
                  <div className="pricing-page-per">{perGen} &#8376; {t('perGen')}</div>
                  <button
                    className="btn btn-ai pricing-page-buy"
                    onClick={() => handleBuy(pkg)}
                    disabled={buying === pkg.id}
                  >
                    {buying === pkg.id ? '...' : t('buy')}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {error && <p className="pricing-page-error">{error}</p>}

        <p className="pricing-page-free">{t('free')}</p>
      </div>

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />

      {paymentData && (
        <RobokassaWidget
          params={paymentData.params}
          fallbackUrl={paymentData.url}
          onClose={() => {
            setPaymentData(null);
            setBuying(null);
          }}
        />
      )}
    </main>
  );
}
