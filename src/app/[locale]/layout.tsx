import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToastProvider } from '@/components/Toast';
import { AuthProvider } from '@/components/AuthProvider';
import { FeedbackButton } from '@/components/FeedbackButton';
import '@/styles/feedback.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKk = locale === 'kk';

  const base = 'https://skezire.kz';
  const url = `${base}/${locale}`;
  const ogImage = `${base}/${locale}/opengraph-image`;

  return {
    title: isKk
      ? 'Шежіре — Қазақша шежіре ағашы | Жеті ата, Жүз, Ру'
      : 'Шежіре — Казахское генеалогическое дерево | Роды и жузы',
    description: isKk
      ? 'Шежіре — қазақ ата-тегінің онлайн ағашы. Жеті атаңызды біліңіз, руыңызды анықтаңыз. AI фото: 100 жыл бұрынғы сурет, Гибли стилі, экшн-фигурка — 3 тегін генерация.'
      : 'Шежіре — казахское генеалогическое дерево онлайн. Узнайте свой род, жуз и семь поколений предков. AI фото: 100 лет назад, стиль Гибли, экшн-фигурка — 3 бесплатные генерации.',
    keywords: isKk
      ? 'шежіре, қазақ руы, жеті ата, жүз, ру, генеалогия, ата-тек, AI фото, жасанды интеллект, гибли стилі'
      : 'шежіре, шежире, казахское генеалогическое дерево, казахские роды, жузы, жеті ата, генеалогия казахов, AI фото, нейросеть, стиль гибли',
    authors: [{ name: 'Шежіре', url: 'https://skezire.kz' }],
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      type: 'website',
      title: isKk ? 'Шежіре — Қазақша шежіре ағашы' : 'Шежіре — Казахское генеалогическое дерево',
      description: isKk
        ? 'Жеті атаңызды біліңіз, руыңызды анықтаңыз. AI фото — тіркелгеннен кейін 3 тегін генерация.'
        : 'Узнайте свой род и семь поколений предков. AI фото — 3 бесплатные генерации после регистрации.',
      url,
      siteName: 'Шежіре',
      locale: isKk ? 'kk_KZ' : 'ru_RU',
      images: [{ url: ogImage, width: 1200, height: 630, alt: 'Шежіре' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: isKk ? 'Шежіре — Қазақша шежіре ағашы' : 'Шежіре — Казахское генеалогическое дерево',
      description: isKk
        ? 'Қазақ ата-тегінің онлайн ағашы + AI фото — 3 тегін генерация.'
        : 'Казахское генеалогическое дерево + AI фото — 3 бесплатные генерации.',
      images: [ogImage],
    },
    alternates: {
      canonical: url,
      languages: {
        kk: `${base}/kk`,
        ru: `${base}/ru`,
        'x-default': `${base}/kk`,
      },
    },
    verification: {
      google: 'No2iqR-patC5OJeOVvMagXhL2u1U1WX6FHjOxztqf1E',
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AuthProvider>
        <ToastProvider>
          <Navbar locale={locale} />
          {children}
          <Footer />
          <FeedbackButton />
        </ToastProvider>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
