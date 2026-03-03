import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb } from '@/components/encyclopedia/Breadcrumb';
import '@/styles/encyclopedia.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKk = locale === 'kk';
  const base = 'https://skezire.kz';
  const url = `${base}/${locale}/ai`;
  const ogImage = `${base}/${locale}/opengraph-image`;

  return {
    title: isKk
      ? 'AI Мүмкіндіктері — Фото трансформация нейросетімен | Шежіре'
      : 'AI Функции — Фото трансформация нейросетью | Шежіре',
    description: isKk
      ? 'AI фото трансформация: экшн-фигурка, питомецті адамға айналдыру, Гибли стилі, 100 жыл бұрынғы сурет, бабаңды жасарту. Тегін онлайн.'
      : 'AI фото трансформация: экшн-фигурка, питомец в человека, стиль Гибли, фото 100 лет назад, омоложение предка. Бесплатно онлайн.',
    keywords: isKk
      ? 'AI фото, нейросеть, экшн-фигурка, питомец адамға, Гибли стилі, фото трансформация, шежіре'
      : 'AI фото, нейросеть, экшн-фигурка, питомец в человека, стиль Гибли, фото трансформация, шежіре',
    openGraph: {
      type: 'website',
      title: isKk ? 'AI Мүмкіндіктері | Шежіре' : 'AI Функции | Шежіре',
      description: isKk
        ? 'AI фото трансформация: экшн-фигурка, питомец, Гибли, ретро. Тегін онлайн.'
        : 'AI фото трансформация: экшн-фигурка, питомец, Гибли, ретро. Бесплатно онлайн.',
      url,
      siteName: 'Шежіре',
      images: [{ url: ogImage, width: 1200, height: 630, alt: 'AI Шежіре' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: isKk ? 'AI Мүмкіндіктері | Шежіре' : 'AI Функции | Шежіре',
      images: [ogImage],
    },
    alternates: {
      canonical: url,
      languages: {
        kk: `${base}/kk/ai`,
        ru: `${base}/ru/ai`,
        'x-default': `${base}/kk/ai`,
      },
    },
  };
}

const FEATURES = [
  { id: 'past', icon: '🕰️', anchor: '/#ai-section' },
  { id: 'ancestor', icon: '👵', anchor: '/#ai-section' },
  { id: 'action-figure', icon: '🎯', href: '/ai/action-figure' },
  { id: 'pet-humanize', icon: '🐾', href: '/ai/pet-humanize' },
  { id: 'ghibli-style', icon: '🎌', href: '/ai/ghibli-style' },
];

export default async function AiHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isKk = locale === 'kk';
  const base = 'https://skezire.kz';

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Шежіре', item: `${base}/${locale}` },
      { '@type': 'ListItem', position: 2, name: isKk ? 'AI Мүмкіндіктері' : 'AI Функции', item: `${base}/${locale}/ai` },
    ],
  };

  const webAppJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Шежіре AI',
    description: isKk
      ? 'AI фото трансформация құралдары: экшн-фигурка, питомец адамға, Гибли стилі'
      : 'AI инструменты фото трансформации: экшн-фигурка, питомец в человека, стиль Гибли',
    url: `${base}/${locale}/ai`,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'KZT' },
    publisher: { '@type': 'Organization', name: 'Шежіре', url: base },
  };

  const features = [
    {
      href: `/${locale}#ai-section`,
      icon: '🕰️',
      title: isKk ? '100 жыл бұрынғы өзіңді жасат' : 'Создай себя 100 лет назад',
      desc: isKk ? 'AI 1920 жылдардағы қазақ даласы стилінде бейнеңізді жасайды' : 'AI воссоздаст ваш образ в стиле 1920-х годов',
    },
    {
      href: `/${locale}#ai-section`,
      icon: '👵',
      title: isKk ? 'Бабаң жастайында қандай болған?' : 'Как выглядел предок в молодости?',
      desc: isKk ? 'AI бабаңызды жас кезінде көрсетеді' : 'AI покажет, как предок выглядел в молодости',
    },
    {
      href: `/${locale}/ai/action-figure`,
      icon: '🎯',
      title: isKk ? 'AI Экшн-фигурка' : 'AI Экшн-фигурка',
      desc: isKk ? 'Коллекциялық фигурка қазақ ұлттық киімінде' : 'Коллекционная фигурка в казахском национальном костюме',
      isNew: true,
    },
    {
      href: `/${locale}/ai/pet-humanize`,
      icon: '🐾',
      title: isKk ? 'Питомецті адамға айналдыр' : 'Превратить питомца в человека',
      desc: isKk ? 'Жануарыңыз қазақ батыры болады!' : 'Ваш питомец станет казахским батыром!',
      isNew: true,
    },
    {
      href: `/${locale}/ai/ghibli-style`,
      icon: '🎌',
      title: isKk ? 'Гибли стиліндегі сурет' : 'Фото в стиле Гибли',
      desc: isKk ? 'Studio Ghibli аниме стилі, қазақ даласы фоны' : 'Стиль Studio Ghibli с казахской степью',
      isNew: true,
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }} />

      <section className="enc-hero">
        <div className="enc-hero-bg" />
        <div className="enc-hero-content">
          <Breadcrumb
            items={[
              { label: 'Шежіре', href: `/${locale}` },
              { label: isKk ? 'AI Мүмкіндіктері' : 'AI Функции' },
            ]}
          />
          <h1 className="enc-hero-title">{isKk ? 'AI Мүмкіндіктері' : 'AI Функции'}</h1>
          <p className="enc-hero-sub">
            {isKk
              ? 'Жасанды интеллект арқылы суретіңізді трансформациялаңыз — тегін, онлайн'
              : 'Трансформируйте фото с помощью AI — бесплатно, онлайн'}
          </p>
        </div>
      </section>

      <main className="enc-main">
        <div className="container">
          <div className="hub-grid">
            {features.map((f) => (
              <Link key={f.href} href={f.href} className="hub-card">
                <div className="hub-card-icon">{f.icon}</div>
                <h2 className="hub-card-title">
                  {f.title}
                  {f.isNew && <span style={{ marginLeft: 8, fontSize: '0.7em', background: 'var(--gold)', color: '#000', padding: '2px 8px', borderRadius: 4 }}>NEW</span>}
                </h2>
                <p className="hub-card-desc">{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <section className="enc-cta">
        <div className="container">
          <h3>{isKk ? 'Шежіреңізді жасаңыз' : 'Создайте своё шежіре'}</h3>
          <p>{isKk ? 'Ата-тегіңіздің тарихын сақтаңыз' : 'Сохраните историю своего рода'}</p>
          <a href={`/${locale}#form-section`} className="btn btn-primary">
            {isKk ? 'Шежіре жасау' : 'Создать шежіре'}
          </a>
        </div>
      </section>
    </>
  );
}
