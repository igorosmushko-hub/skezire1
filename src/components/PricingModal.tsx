'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { pricingBuy } from '@/lib/analytics';
import { RobokassaWidget } from '@/components/RobokassaWidget';
import { LoginModal } from '@/components/LoginModal';
import { useAuth } from '@/components/AuthProvider';
import { usePackages, type Package } from '@/hooks/usePackages';
import { PackagesStatus } from '@/components/PackagesStatus';

interface Props {
  open: boolean;
  onClose: () => void;
  locale?: string;
}

export function PricingModal({ open, onClose, locale = 'ru' }: Props) {
  const t = useTranslations('pricing');
  const { user } = useAuth();
  const { packages, loading, loadError, retry } = usePackages(open);
  const [buying, setBuying] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<{ url: string; params: Record<string, unknown> } | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [error, setError] = useState('');

  const handleClose = useCallback(() => {
    setBuying(null);
    setError('');
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, handleClose]);

  const handleBuy = useCallback(async (pkg: Package) => {
    pricingBuy(pkg.slug);
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

  if (!open) return null;

  const modal = (
    <div
      className="modal open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pricing-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="modal-card pricing-card">
        <button className="modal-close" onClick={handleClose} aria-label={t('close')}>
          &#10005;
        </button>

        <div className="pricing-header">
          <div className="modal-icon">&#9889;</div>
          <h2 id="pricing-modal-title" className="modal-title">{t('limitTitle')}</h2>
          <p className="modal-text">{t('limitDesc')}</p>
        </div>

        {loading || loadError || packages.length === 0 ? (
          <PackagesStatus loading={loading} loadError={loadError} retry={retry} />
        ) : (
          <div className="pricing-grid">
            {packages.map((pkg) => {
              const perGen = Math.round(pkg.price_kzt / pkg.generations);
              const isPopular = pkg.slug === 'standard';
              return (
                <div key={pkg.id} className={`pricing-item${isPopular ? ' popular' : ''}`}>
                  {isPopular && <span className="pricing-badge">{t('popular')}</span>}
                  <div className="pricing-gens">{pkg.generations}</div>
                  <div className="pricing-gens-label">{t('generations')}</div>
                  <div className="pricing-price">{pkg.price_kzt.toLocaleString()} &#8376;</div>
                  <div className="pricing-per">{perGen} &#8376; {t('perGen')}</div>
                  <button
                    className="btn btn-ai pricing-buy"
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

        {error && <p className="login-error">{error}</p>}

        <p className="pricing-free-note">{t('free')}</p>
      </div>
    </div>
  );

  return (
    <>
      {createPortal(modal, document.body)}
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
    </>
  );
}
