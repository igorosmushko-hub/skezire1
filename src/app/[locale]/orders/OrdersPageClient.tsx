'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { LoginModal } from '@/components/LoginModal';
import '@/styles/order.css';

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
  product: {
    name_kk: string;
    name_ru: string;
    size: string;
  };
}

export function OrdersPageClient({ locale }: { locale: string }) {
  const t = useTranslations('orders');
  const isKk = locale === 'kk';
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch('/api/orders/my')
      .then((r) => r.json())
      .then((d) => setOrders(d.orders ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

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

  return (
    <main className="orders-page">
      <div className="container">
        <div className="orders-header">
          <h1>{t('title')}</h1>
        </div>

        {loading ? (
          <div className="orders-empty">...</div>
        ) : orders.length === 0 ? (
          <div className="orders-empty">
            <p>{t('empty')}</p>
            <Link href={`/${locale}/ai`} className="btn btn-ai" style={{ marginTop: '1rem', display: 'inline-block' }}>
              {t('goToAi')}
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
                    <span className="order-card-num">{t('orderNum')} #{order.order_number}</span>
                    <span className={`order-card-status ${statusKey(order.status)}`}>
                      {t(`status.${statusKey(order.status)}` as Parameters<typeof t>[0])}
                    </span>
                  </div>
                  <div className="order-card-product">
                    {isKk ? order.product.name_kk : order.product.name_ru} ({order.product.size})
                  </div>
                  <div className="order-card-price">{order.amount_kzt.toLocaleString()} &#8376;</div>
                  <div className="order-card-date">
                    {t('created')}: {new Date(order.created_at).toLocaleDateString(isKk ? 'kk-KZ' : 'ru-RU')}
                  </div>
                  {order.tracking_number && (
                    <div className="order-card-tracking">
                      {t('tracking')}: {order.tracking_url ? (
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
    </main>
  );
}
