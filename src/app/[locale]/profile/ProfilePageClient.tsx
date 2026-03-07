'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { LoginModal } from '@/components/LoginModal';
import '@/styles/profile.css';
import '@/styles/order.css';

interface Profile {
  id: string;
  phone: string;
  name: string | null;
  usageCount: number;
  paidGenerations: number;
  totalAvailable: number;
  remaining: number;
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

type Tab = 'profile' | 'gallery' | 'orders';

const TYPE_LABELS: Record<string, Record<string, string>> = {
  kk: {
    past: '100 жыл бұрын',
    ancestor: 'Баба жасарту',
    'action-figure': 'Экшн-фигурка',
    'pet-humanize': 'Питомец',
    ghibli: 'Гибли',
    'family-portrait': 'Отбасы',
  },
  ru: {
    past: '100 лет назад',
    ancestor: 'Омоложение',
    'action-figure': 'Экшн-фигурка',
    'pet-humanize': 'Питомец',
    ghibli: 'Гибли',
    'family-portrait': 'Семейный',
  },
};

export function ProfilePageClient({ locale }: { locale: string }) {
  const t = useTranslations('profile');
  const tOrders = useTranslations('orders');
  const isKk = locale === 'kk';
  const { user, loading: authLoading } = useAuth();

  const [tab, setTab] = useState<Tab>('profile');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/profile');
      const d = await res.json();
      if (d.profile) {
        setProfile(d.profile);
        setName(d.profile.name ?? '');
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

  useEffect(() => {
    if (!user) return;
    Promise.all([fetchProfile(), fetchGenerations(), fetchOrders()])
      .finally(() => setLoading(false));
  }, [user, fetchProfile, fetchGenerations, fetchOrders]);

  const saveName = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* ignore */ }
    setSaving(false);
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
    if (profile?.name) return profile.name.charAt(0).toUpperCase();
    if (profile?.phone) return profile.phone.slice(-2);
    return '?';
  };

  const typeLabels = TYPE_LABELS[isKk ? 'kk' : 'ru'] ?? TYPE_LABELS.ru;

  return (
    <main className="profile-page">
      <div className="container">
        <div className="profile-header">
          <h1>{t('title')}</h1>
        </div>

        <div className="profile-tabs">
          <button
            className={`profile-tab ${tab === 'profile' ? 'active' : ''}`}
            onClick={() => setTab('profile')}
          >
            {t('tabProfile')}
          </button>
          <button
            className={`profile-tab ${tab === 'gallery' ? 'active' : ''}`}
            onClick={() => setTab('gallery')}
          >
            {t('tabGallery')}
          </button>
          <button
            className={`profile-tab ${tab === 'orders' ? 'active' : ''}`}
            onClick={() => setTab('orders')}
          >
            {t('tabOrders')}
          </button>
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

            <div className="profile-field">
              <label>{t('name')}</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('namePh')}
              />
              {name !== (profile.name ?? '') && (
                <button
                  className="btn btn-primary profile-save-btn"
                  onClick={saveName}
                  disabled={saving}
                >
                  {saving ? '...' : saved ? t('saved') : t('save')}
                </button>
              )}
            </div>

            <div className="profile-field">
              <label>{t('registered')}</label>
              <div className="profile-field-value">
                {new Date(profile.createdAt).toLocaleDateString(isKk ? 'kk-KZ' : 'ru-RU')}
              </div>
            </div>

            <div className="profile-stats">
              <div className="profile-stat">
                <div className="profile-stat-value">{profile.remaining}</div>
                <div className="profile-stat-label">{t('remaining')}</div>
              </div>
              <div className="profile-stat">
                <div className="profile-stat-value">{profile.usageCount}</div>
                <div className="profile-stat-label">{t('used')}</div>
              </div>
              <div className="profile-stat">
                <div className="profile-stat-value">{orders.length}</div>
                <div className="profile-stat-label">{t('ordersCount')}</div>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <Link href={`/${locale}/pricing`} className="profile-buy-link">
                {t('buyMore')}
              </Link>
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
              <div className="profile-gallery-grid">
                {generations.map((gen) => (
                  <div key={gen.id} className="profile-gen-card">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={gen.result_url} alt="" className="profile-gen-img" />
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
        ) : null}
      </div>
    </main>
  );
}
