import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Playfair_Display, Inter } from 'next/font/google';
import { routing } from '@/i18n/routing';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToastProvider } from '@/components/Toast';
import '@/styles/globals.css';

const playfair = Playfair_Display({
  subsets: ['cyrillic', 'latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['cyrillic', 'latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

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
      ? 'Шежіре — қазақ ата-тегінің онлайн ағашы. Жеті атаңызды біліңіз, руыңызды анықтаңыз. Казахское генеалогическое дерево бесплатно.'
      : 'Шежіре — казахское генеалогическое дерево онлайн. Узнайте свой род, жуз и семь поколений предков. Составьте шежіре бесплатно.',
    keywords: isKk
      ? 'шежіре, қазақ руы, жеті ата, жүз, ру, генеалогия, ата-тек'
      : 'шежіре, шежире, казахское генеалогическое дерево, казахские роды, жузы, жеті ата, генеалогия казахов',
    authors: [{ name: 'Шежіре' }],
    robots: 'index, follow',
    openGraph: {
      type: 'website',
      title: isKk ? 'Шежіре — Қазақша шежіре ағашы' : 'Шежіре — Казахское генеалогическое дерево',
      description: isKk
        ? 'Жеті атаңызды біліңіз, руыңызды анықтаңыз. Казақ ата-тегін онлайн жасаңыз — тегін.'
        : 'Узнайте свой род, жуз и семь поколений предков. Составьте генеалогическое дерево онлайн — бесплатно.',
      url,
      siteName: 'Шежіре',
      locale: isKk ? 'kk_KZ' : 'ru_RU',
      images: [{ url: ogImage, width: 1200, height: 630, alt: 'Шежіре' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: isKk ? 'Шежіре — Қазақша шежіре ағашы' : 'Шежіре — Казахское генеалогическое дерево',
      description: isKk
        ? 'Қазақ ата-тегінің онлайн ағашы. Жеті атаңызды біліңіз, руыңызды анықтаңыз.'
        : 'Казахское генеалогическое дерево онлайн. Узнайте свой род и предков до 7 колена.',
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

  const messages = await getMessages();

  return (
    <html lang={locale} className={`${playfair.variable} ${inter.variable}`}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ToastProvider>
            <Navbar locale={locale} />
            {children}
            <Footer />
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
