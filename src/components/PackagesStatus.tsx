'use client';

import { useTranslations } from 'next-intl';

export function PackagesStatus({ loading, loadError, retry, variant = 'modal' }: {
  loading: boolean;
  loadError: boolean;
  retry: () => void;
  variant?: 'modal' | 'page';
}) {
  const t = useTranslations('pricing');
  return (
    <div className={variant === 'page' ? 'pricing-page-loading' : 'pricing-loading'} role="status" aria-live="polite">
      <p>{t(loading ? 'loading' : loadError ? 'loadError' : 'empty')}</p>
      {!loading && <button type="button" className="btn btn-ai" onClick={retry}>{t('retry')}</button>}
    </div>
  );
}
