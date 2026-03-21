'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { LoginModal } from '@/components/LoginModal';
import { TRIBES_DB } from '@/data/tribes';
import '@/styles/profile.css';
import '@/styles/order.css';

interface Profile {
  id: string;
  phone: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  usageCount: number;
  paidGenerations: number;
  totalAvailable: number;
  remaining: number;
  zhuzId: string | null;
  tribeId: string | null;
  createdAt: string;
}

interface Generation {
  id: string;
  type: string;
  result_url: string;
  status: string;
  created_at: string;
}

interface Order {
  id: string;
  order_number: number;
  image_url: string;
  amount_kzt: number;
  status: string;
  payment_status: string;
  tracking_number: string | null;
  tracking_url: string | null;
  created_at: string;
  products: {
    name_kk: string;
    name_ru: string;
    size: string;
  };
}

interface Payment {
  id: string;
  amount_kzt: number;
  status: string;
  created_at: string;
  paid_at: string | null;
  packages: {
    name_kk: string;
    name_ru: string;
    generations: number;
  } | null;
}

type Tab = 'profile' | 'gallery' | 'orders' | 'payments';

const TYPE_LABELS: Record<string, Record<string, string>> = {
  kk: {
    past: '100 жыл бұрын',
    ancestor: 'Баба жасарту',
    'action-figure': 'Экшн-фигурка',
    'pet-humanize': 'Питомец',
    ghibli: 'Гибли',
    'family-portrait': 'Отбасы',
    national: 'Ұлттық киім',
  },
  ru: {
    past: '100 лет назад',
    ancestor: 'Омоложение',
    'action-figure': 'Экшн-фигурка',
    'pet-humanize': 'Питомец',
    ghibli: 'Гибли',
    'family-portrait': 'Семейный',
    national: 'Нац. костюм',
  },
};

function findTribeInfo(tribeId: string | null) {
  if (!tribeId) return null;
  for (const zhuz of TRIBES_DB) {
    for (const tribe of zhuz.tribes) {
      if (tribe.id === tribeId) {
        return { zhuz, tribe };
      }
    }
  }
  return null;
}

export function ProfilePageClient({ locale }: { locale: string }) {
  const t = useTranslations('profile');
  const tOrders = useTranslations('orders');
  const isKk = locale === 'kk';
  const { user, loading: authLoading, logout } = useAuth();

  const [tab, setTab] = useState<Tab>('profile');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsLoaded, setPaymentsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [genFilter, setGenFilter] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/profile');
      const d = await res.json();
      if (d.profile) {
        setProfile(d.profile);
        setFirstName(d.profile.firstName ?? '');
        setLastName(d.profile.lastName ?? '');
      }
    } catch { /* ignore */ }
  }, []);

  const fetchGenerations = useCallback(async () => {
    try {
      const res = await fetch('/api/generations/my');
      const d = await res.json();
      setGenerations(d.generations ?? []);
    } catch { /* ignore */ }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders/my');
      const d = await res.json();
      setOrders(d.orders ?? []);
    } catch { /* ignore */ }
  }, []);

  const fetchPayments = useCallback(async () => {
    try {
      const res = await fetch('/api/payments/my');
      const d = await res.json();
      setPayments(d.payments ?? []);
      setPaymentsLoaded(true);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!user) return;
    Promise.all([fetchProfile(), fetchGenerations(), fetchOrders()])
      .finally(() => setLoading(false));
  }, [user, fetchProfile, fetchGenerations, fetchOrders]);

  // Lazy-load payments on first tab switch
  useEffect(() => {
    if (tab === 'payments' && !paymentsLoaded && user) {
      fetchPayments();
    }
  }, [tab, paymentsLoaded, user, fetchPayments]);

  const saveName = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName }),
      });
      setProfile((p) => p ? { ...p, firstName, lastName } : p);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (!confirm(t('deleteConfirm'))) return;
    try {
      await fetch('/api/profile', { method: 'DELETE' });
      logout();
    } catch { /* ignore */ }
  };

  const handleDownload = (url: string) => {
    const a = document.createElement('a');
    a.href = `/api/ai/download?url=${encodeURIComponent(url)}`;
    a.download = 'skezire-ai-result.jpg';
    a.click();
  };

  const handleShare = async (url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Skezire AI', url });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      alert(t('copied'));
    }
  };

  if (!authLoading && !user) {
    return <LoginModal open={true} onClose={() => {}} />;
  }

  const statusKey = (s: string) => {
    const map: Record<string, string> = {
      new: 'new', paid: 'paid', in_production: 'in_production',
      shipped: 'shipped', delivered: 'delivered', cancelled: 'cancelled',
    };
    return map[s] ?? 'new';
  };

  const getInitial = () => {
    if (firstName) return firstName.charAt(0).toUpperCase();
    if (profile?.firstName) return profile.firstName.charAt(0).toUpperCase();
    if (profile?.name) return profile.name.charAt(0).toUpperCase();
    if (profile?.phone) return profile.phone.slice(-2);
    return '?';
  };

  const typeLabels = TYPE_LABELS[isKk ? 'kk' : 'ru'] ?? TYPE_LABELS.ru;

  // Tribe info lookup
  const tribeInfo = useMemo(
    () => findTribeInfo(profile?.tribeId ?? user?.tribeId ?? null),
    [profile?.tribeId, user?.tribeId]
  );

  // Gallery filter: unique types present
  const genTypes = useMemo(() => {
    const types = new Set(generations.map((g) => g.type));
    return Array.from(types);
  }, [generations]);

  const filteredGenerations = genFilter
    ? generations.filter((g) => g.type === genFilter)
    : generations;

  const nameChanged =
    firstName !== (profile?.firstName ?? '') ||
    lastName !== (profile?.lastName ?? '');

  return (
    <main className="profile-page">
      <div className="container">
        <div className="profile-header">
          <h1>{t('title')}</h1>
        </div>

        <div className="profile-tabs">
          {(['profile', 'gallery', 'orders', 'payments'] as Tab[]).map((k) => (
            <button
              key={k}
              className={`profile-tab ${tab === k ? 'active' : ''}`}
              onClick={() => setTab(k)}
            >
              {t(k === 'profile' ? 'tabProfile' : k === 'gallery' ? 'tabGallery' : k === 'orders' ? 'tabOrders' : 'tabPayments')}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="profile-empty">...</div>
        ) : tab === 'profile' && profile ? (
          <div className="profile-card">
            <div className="profile-avatar">{getInitial()}</div>

            <div className="profile-field">
              <label>{t('phone')}</label>
              <div className="profile-field-value">{profile.phone}</div>
            </div>

            {/* First name + Last name */}
            <div className="profile-name-row">
              <div className="profile-field profile-field-half">
                <label>{t('lastName')}</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={t('lastNamePh')}
                  maxLength={50}
                />
              </div>
              <div className="profile-field profile-field-half">
                <label>{t('firstName')}</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t('firstNamePh')}
                  maxLength={50}
                />
              </div>
            </div>
            {nameChanged && (
              <button
                className="btn btn-primary profile-save-btn"
                onClick={saveName}
                disabled={saving}
              >
                {saving ? '...' : saved ? t('saved') : t('save')}
              </button>
            )}

            <div className="profile-field">
              <label>{t('registered')}</label>
              <div className="profile-field-value">
                {new Date(profile.createdAt).toLocaleDateString(isKk ? 'kk-KZ' : 'ru-RU')}
              </div>
            </div>

            {/* Balance section */}
            <div className="profile-balance-section">
              <div className="profile-balance-big">
                <span className="profile-balance-icon">&#9889;</span>
                <span className={`profile-balance-number ${profile.remaining === 0 ? 'empty' : ''}`}>
                  {profile.remaining}
                </span>
              </div>
              <div className="profile-balance-label">{t('balanceTitle')}</div>
              <div className="profile-balance-cost">
                1 {t('perGeneration')} {t('from')} 100 &#8376;
              </div>
              <Link href={`/${locale}/pricing`} className="profile-topup-btn">
                {t('topUp')}
              </Link>
              <div className="profile-balance-meta">
                {t('usedAndOrders', { used: profile.usageCount, orders: orders.length })}
              </div>
            </div>

            {/* Tribe info */}
            {tribeInfo ? (
              <div className="profile-tribe-info">
                <div className="profile-tribe-heading">{t('myTribe')}</div>
                <div className="profile-tribe-grid">
                  <div className="profile-tribe-item">
                    <span className="profile-tribe-item-label">{t('zhuz')}</span>
                    <span>{isKk ? tribeInfo.zhuz.kk : tribeInfo.zhuz.ru}</span>
                  </div>
                  <div className="profile-tribe-item">
                    <span className="profile-tribe-item-label">{t('tribeLabel')}</span>
                    <span>{isKk ? tribeInfo.tribe.kk : tribeInfo.tribe.ru}</span>
                  </div>
                  <div className="profile-tribe-item">
                    <span className="profile-tribe-item-label">{t('tamga')}</span>
                    <span className="profile-tribe-tamga">{tribeInfo.tribe.tamga}</span>
                  </div>
                  <div className="profile-tribe-item">
                    <span className="profile-tribe-item-label">{t('uran')}</span>
                    <span>{tribeInfo.tribe.uran}</span>
                  </div>
                </div>
                <Link
                  href={`/${locale}/encyclopedia/${tribeInfo.zhuz.id}/${tribeInfo.tribe.id}`}
                  className="profile-tribe-link"
                >
                  {t('viewInEnc')}
                </Link>
              </div>
            ) : (
              <div className="profile-tribe-info profile-tribe-empty">
                <Link href={`/${locale}/encyclopedia`} className="profile-tribe-link">
                  {t('noTribe')}
                </Link>
              </div>
            )}

            {/* Settings */}
            <div className="profile-settings">
              <div className="profile-settings-heading">{t('settings')}</div>
              <button
                className="profile-delete-btn"
                onClick={handleDeleteAccount}
              >
                {t('deleteAccount')}
              </button>
            </div>
          </div>
        ) : tab === 'gallery' ? (
          <div className="profile-gallery">
            {generations.length === 0 ? (
              <div className="profile-empty">
                <p>{t('noGenerations')}</p>
                <Link href={`/${locale}/ai`} className="btn btn-ai">
                  {t('goToAi')}
                </Link>
              </div>
            ) : (
              <>
                {/* Filter chips */}
                {genTypes.length > 1 && (
                  <div className="profile-filter-bar">
                    <button
                      className={`profile-filter-chip ${genFilter === null ? 'active' : ''}`}
                      onClick={() => setGenFilter(null)}
                    >
                      {t('filterAll')}
                    </button>
                    {genTypes.map((type) => (
                      <button
                        key={type}
                        className={`profile-filter-chip ${genFilter === type ? 'active' : ''}`}
                        onClick={() => setGenFilter(type)}
                      >
                        {typeLabels[type] ?? type}
                      </button>
                    ))}
                  </div>
                )}

                <div className="profile-gallery-grid">
                  {filteredGenerations.map((gen) => (
                    <div key={gen.id} className="profile-gen-card">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={gen.result_url} alt="" className="profile-gen-img" />
                      <div className="profile-gen-overlay">
                        <button
                          className="profile-gen-action"
                          onClick={() => handleDownload(gen.result_url)}
                          title={t('download')}
                        >
                          &#11015;
                        </button>
                        <button
                          className="profile-gen-action"
                          onClick={() => handleShare(gen.result_url)}
                          title={t('share')}
                        >
                          &#9998;
                        </button>
                      </div>
                      <div className="profile-gen-info">
                        <div className="profile-gen-type">
                          {typeLabels[gen.type] ?? gen.type}
                        </div>
                        <div className="profile-gen-date">
                          {new Date(gen.created_at).toLocaleDateString(isKk ? 'kk-KZ' : 'ru-RU')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : tab === 'orders' ? (
          <div className="profile-orders">
            {orders.length === 0 ? (
              <div className="profile-empty">
                <p>{tOrders('empty')}</p>
                <Link href={`/${locale}/ai`} className="btn btn-ai">
                  {tOrders('goToAi')}
                </Link>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order.id} className="order-card">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={order.image_url} alt="" className="order-card-img" />
                    <div className="order-card-info">
                      <div className="order-card-top">
                        <span className="order-card-num">{tOrders('orderNum')} #{order.order_number}</span>
                        <span className={`order-card-status ${statusKey(order.status)}`}>
                          {tOrders(`status.${statusKey(order.status)}` as Parameters<typeof tOrders>[0])}
                        </span>
                      </div>
                      <div className="order-card-product">
                        {isKk ? order.products.name_kk : order.products.name_ru} ({order.products.size})
                      </div>
                      <div className="order-card-price">{order.amount_kzt.toLocaleString()} &#8376;</div>
                      <div className="order-card-date">
                        {tOrders('created')}: {new Date(order.created_at).toLocaleDateString(isKk ? 'kk-KZ' : 'ru-RU')}
                      </div>
                      {order.tracking_number && (
                        <div className="order-card-tracking">
                          {tOrders('tracking')}: {order.tracking_url ? (
                            <a href={order.tracking_url} target="_blank" rel="noopener noreferrer">
                              {order.tracking_number}
                            </a>
                          ) : order.tracking_number}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : tab === 'payments' ? (
          <div className="profile-payments">
            {!paymentsLoaded ? (
              <div className="profile-empty">...</div>
            ) : payments.length === 0 ? (
              <div className="profile-empty">
                <p>{t('noPayments')}</p>
                <Link href={`/${locale}/pricing`} className="btn btn-ai">
                  {t('goToPricing')}
                </Link>
              </div>
            ) : (
              <div className="profile-payments-list">
                {payments.map((payment) => (
                  <div key={payment.id} className="profile-payment-card">
                    <div className="profile-payment-top">
                      <span className="profile-payment-name">
                        {payment.packages
                          ? (isKk ? payment.packages.name_kk : payment.packages.name_ru)
                          : '—'}
                      </span>
                      <span className={`profile-payment-status ${payment.status}`}>
                        {t(`paymentStatus.${payment.status}` as Parameters<typeof t>[0])}
                      </span>
                    </div>
                    {payment.packages && (
                      <div className="profile-payment-gens">
                        {t('packageGens', { count: payment.packages.generations })}
                      </div>
                    )}
                    <div className="profile-payment-bottom">
                      <span className="profile-payment-amount">
                        {payment.amount_kzt.toLocaleString()} &#8376;
                      </span>
                      <span className="profile-payment-date">
                        {new Date(payment.created_at).toLocaleDateString(isKk ? 'kk-KZ' : 'ru-RU')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </main>
  );
}
