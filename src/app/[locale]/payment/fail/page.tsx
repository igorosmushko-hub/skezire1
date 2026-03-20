import type { Metadata } from 'next';
import Link from 'next/link';
import { PaymentIframeNotifier } from '@/components/PaymentIframeNotifier';
import '@/styles/legal.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKk = locale === 'kk';
  return {
    title: isKk ? 'Төлем өтпеді | Шежіре' : 'Ошибка оплаты | Шежіре',
    robots: { index: false },
    alternates: { canonical: `https://skezire.kz/${locale}/payment/fail` },
  };
}

export default async function PaymentFailPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isKk = locale === 'kk';

  return (
    <main className="legal-main" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <PaymentIframeNotifier status="fail" />
      <div className="container">
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>&#10007;</div>
        <h1>{isKk ? 'Төлем өтпеді' : 'Оплата не прошла'}</h1>
        <p style={{ color: '#6b7280', margin: '1rem 0 2rem', fontSize: '1.1rem' }}>
          {isKk
            ? 'Қайталап көріңіз немесе басқа төлем тәсілін таңдаңыз.'
            : 'Попробуйте ещё раз или выберите другой способ оплаты.'}
        </p>
        <Link href={`/${locale}/pricing`} className="btn btn-ai">
          {isKk ? 'Қайталап көру' : 'Попробовать снова'}
        </Link>
      </div>
    </main>
  );
}
