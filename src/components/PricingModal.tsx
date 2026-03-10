'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { pricingBuy } from '@/lib/analytics';

interface Package {
  id: string;
  slug: string;
  name_ru: string;
  name_kk: string;
  generations: number;
  price_kzt: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  locale?: string;
}

const PACKAGES_CACHE: { data: Package[] | null } = { data: null };

export function PricingModal({ open, onClose, locale = 'ru' }: Props) {
  const t = useTranslations('pricing');
  const [packages, setPackages] = useState<Package[]>(PACKAGES_CACHE.data ?? []);
  const [loading, setLoading] = useState(!PACKAGES_CACHE.data);
  const [buying, setBuying] = useState<string | null>(null);

  useEffect(() => {
    if (!open || PACKAGES_CACHE.data) return;
    fetch('/api/packages')
      .then((r) => r.json())
      .then((d) => {
        PACKAGES_CACHE.data = d.packages;
        setPackages(d.packages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  const handleClose = useCallback(() => {
    setBuying(null);
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
    setBuying(pkg.id);
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: pkg.id, locale }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setBuying(null);
    }
  }, [locale]);

  if (!open) return null;

  const isKk = locale === 'kk';

  const modal = (
    <div
      className="modal open"
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="modal-card pricing-card">
        <button className="modal-close" onClick={handleClose} aria-label="Close">
          &#10005;
        </button>

        <div className="pricing-header">
          <div className="modal-icon">&#9889;</div>
          <h2 className="modal-title">{t('limitTitle')}</h2>
          <p className="modal-text">{t('limitDesc')}</p>
        </div>

        {loading ? (
          <div className="pricing-loading">...</div>
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

        <p className="pricing-free-note">{t('free')}</p>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
