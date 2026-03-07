'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { LoginModal } from '@/components/LoginModal';
import '@/styles/order.css';

interface Product {
  id: string;
  type: string;
  size: string;
  name_kk: string;
  name_ru: string;
  price_kzt: number;
}

export function OrderCanvasClient({ locale }: { locale: string }) {
  const t = useTranslations('order');
  const isKk = locale === 'kk';
  const searchParams = useSearchParams();
  const imageUrl = searchParams.get('image') ?? '';
  const aiType = searchParams.get('type') ?? '';

  const { user, loading: authLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('+7');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.products ?? []);
        if (d.products?.length) setSelectedProduct(d.products[0].id);
      })
      .catch(() => {});
  }, []);

  const selectedProductData = products.find((p) => p.id === selectedProduct);

  const handleSubmit = useCallback(async () => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    if (!selectedProduct || !recipientName.trim() || !recipientPhone.trim() || !city.trim() || !address.trim()) {
      setError(t('errorFillAll'));
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct,
          imageUrl,
          aiType,
          recipientName: recipientName.trim(),
          recipientPhone: recipientPhone.trim(),
          city: city.trim(),
          address: address.trim(),
          postalCode: postalCode.trim() || undefined,
          locale,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(t('errorCreate'));
        setSubmitting(false);
      }
    } catch {
      setError(t('errorCreate'));
      setSubmitting(false);
    }
  }, [user, selectedProduct, recipientName, recipientPhone, city, address, postalCode, imageUrl, aiType, locale, t]);

  const hasImage = !!imageUrl;

  return (
    <>
      {showLogin && <LoginModal open={true} onClose={() => setShowLogin(false)} />}
      <main className="order-page">
        <div className="container">
          <div className="order-header">
            <h1>{t('title')}</h1>
            <p>{t('subtitle')}</p>
          </div>

          {!hasImage && (
            <div className="order-promo">
              <div className="order-promo-content">
                <h2>{isKk ? 'AI фотоңызды картинаға айналдырыңыз' : 'Превратите AI-фото в картину'}</h2>
                <p>
                  {isKk
                    ? 'Алдымен AI фото жасаңыз — 100 жыл бұрынғы бейне, бабаңызды жасарту, экшн-фигурка немесе Гибли стилі. Содан кейін холстқа немесе постерге басып алыңыз.'
                    : 'Сначала создайте AI-фото — образ 100 лет назад, портрет предка, экшн-фигурка или стиль Гибли. Затем закажите печать на холсте или постере.'}
                </p>
                <a href={`/${locale}/ai`} className="btn btn-ai order-promo-btn">
                  {isKk ? 'AI фото жасау' : 'Создать AI-фото'}
                </a>
              </div>
            </div>
          )}

          <div className="order-layout">
            {/* Preview */}
            <div className="order-preview">
              <h3>{t('preview')}</h3>
              {imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={imageUrl} alt="AI result" className="order-preview-img" />
              ) : (
                <div className="order-preview-placeholder">
                  {isKk ? 'AI фото жасағаннан кейін мұнда көрінеді' : 'Здесь появится ваше AI-фото'}
                </div>
              )}
            </div>

            {/* Form */}
            <div className="order-form">
              {/* Product selection */}
              <h3>{t('selectProduct')}</h3>
              <div className="order-products">
                {products.map((p) => (
                  <label
                    key={p.id}
                    className={`order-product-option${selectedProduct === p.id ? ' selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="product"
                      value={p.id}
                      checked={selectedProduct === p.id}
                      onChange={() => setSelectedProduct(p.id)}
                    />
                    <span className="order-product-name">{isKk ? p.name_kk : p.name_ru}</span>
                    <span className="order-product-size">{p.size}</span>
                    <span className="order-product-price">{p.price_kzt.toLocaleString()} &#8376;</span>
                  </label>
                ))}
              </div>

              {/* Delivery info */}
              <h3>{t('deliveryTitle')}</h3>
              <div className="order-fields">
                <div className="order-field">
                  <label>{t('recipientName')} *</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder={isKk ? 'Айбек Серіков' : 'Айбек Сериков'}
                  />
                </div>
                <div className="order-field">
                  <label>{t('recipientPhone')} *</label>
                  <input
                    type="tel"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="+7 700 123 4567"
                  />
                </div>
                <div className="order-field">
                  <label>{t('city')} *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={isKk ? 'Алматы' : 'Алматы'}
                  />
                </div>
                <div className="order-field">
                  <label>{t('address')} *</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={isKk ? 'Абай к-сі 123, 45 пәтер' : 'ул. Абая 123, кв. 45'}
                  />
                </div>
                <div className="order-field">
                  <label>{t('postalCode')}</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="050000"
                  />
                </div>
              </div>

              {/* Total */}
              <div className="order-total">
                <div className="order-total-row">
                  <span>{selectedProductData ? (isKk ? selectedProductData.name_kk : selectedProductData.name_ru) : ''}</span>
                  <span>{selectedProductData ? `${selectedProductData.price_kzt.toLocaleString()} \u20B8` : ''}</span>
                </div>
                <div className="order-total-row">
                  <span>{t('delivery')}</span>
                  <span>{t('deliveryFree')}</span>
                </div>
                <div className="order-total-row total">
                  <span>{t('total')}</span>
                  <span>{selectedProductData ? `${selectedProductData.price_kzt.toLocaleString()} \u20B8` : ''}</span>
                </div>
              </div>

              {error && <p className="order-error">{error}</p>}

              <button
                className="btn btn-ai order-submit"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? t('processing') : t('pay')}
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
