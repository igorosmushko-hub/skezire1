import type { Metadata } from 'next';
import Link from 'next/link';
import '@/styles/legal.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKk = locale === 'kk';
  return {
    title: isKk ? 'Төлем сәтті өтті | Шежіре' : 'Оплата прошла | Шежіре',
    robots: { index: false },
    alternates: { canonical: `https://skezire.kz/${locale}/payment/success` },
  };
}

export default async function PaymentSuccessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isKk = locale === 'kk';

  return (
    <main className="legal-main" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <div className="container">
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>&#10003;</div>
        <h1>{isKk ? 'Төлем сәтті өтті!' : 'Оплата прошла успешно!'}</h1>
        <p style={{ color: '#6b7280', margin: '1rem 0 2rem', fontSize: '1.1rem' }}>
          {isKk
            ? 'Генерациялар аккаунтыңызға қосылды. Енді AI-фото жасауды жалғастыра аласыз.'
            : 'Генерации начислены на ваш аккаунт. Теперь вы можете продолжить создавать AI-фото.'}
        </p>
        <Link href={`/${locale}/ai`} className="btn btn-ai">
          {isKk ? 'AI-ға өту' : 'Перейти к AI'}
        </Link>
      </div>
    </main>
  );
}
