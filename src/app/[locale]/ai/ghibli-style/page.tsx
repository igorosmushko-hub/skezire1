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
  const url = `${base}/${locale}/ai/ghibli-style`;
  const ogImage = `${base}/${locale}/opengraph-image`;

  return {
    title: isKk
      ? 'Гибли стиліндегі сурет — AI нейросеть | Шежіре'
      : 'Фото в стиле Гибли — AI нейросеть | Шежіре',
    description: isKk
      ? 'Суретіңізді Studio Ghibli аниме стилінде жасаңыз — қазақ даласы, киіз үй, жылқылар фонымен. AI нейросетімен тегін онлайн.'
      : 'Превратите фото в стиль Studio Ghibli — с казахской степью, юртами и лошадьми на фоне. AI нейросетью бесплатно онлайн.',
    keywords: isKk
      ? 'Гибли стилі, аниме сурет, AI Ghibli, Studio Ghibli фото, нейросеть аниме'
      : 'стиль Гибли, аниме фото, AI Ghibli, Studio Ghibli фото, нейросеть аниме стиль',
    openGraph: {
      type: 'website',
      title: isKk ? 'Гибли стиліндегі сурет | Шежіре' : 'Фото в стиле Гибли | Шежіре',
      description: isKk
        ? 'AI суретіңізді Studio Ghibli стилінде жасайды. Тегін!'
        : 'AI превратит фото в стиль Studio Ghibli. Бесплатно!',
      url,
      siteName: 'Шежіре',
      images: [{ url: ogImage, width: 1200, height: 630, alt: 'AI Гибли стиль Шежіре' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: isKk ? 'Гибли стиліндегі сурет | Шежіре' : 'Фото в стиле Гибли | Шежіре',
      images: [ogImage],
    },
    alternates: {
      canonical: url,
      languages: {
        kk: `${base}/kk/ai/ghibli-style`,
        ru: `${base}/ru/ai/ghibli-style`,
        'x-default': `${base}/kk/ai/ghibli-style`,
      },
    },
  };
}

export default async function GhibliStylePage({
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
      { '@type': 'ListItem', position: 3, name: isKk ? 'Гибли стилі' : 'Стиль Гибли', item: `${base}/${locale}/ai/ghibli-style` },
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: isKk ? 'Гибли стилі деген не?' : 'Что такое стиль Гибли?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: isKk
            ? 'Studio Ghibli — жапон анимация студиясы (Хаяо Миядзаки). Олардың стилі — жұмсақ акварельді бояулар, арманшыл атмосфера, табиғат.'
            : 'Studio Ghibli — японская анимационная студия (Хаяо Миядзаки). Их стиль — мягкие акварельные тона, мечтательная атмосфера, природа.',
        },
      },
      {
        '@type': 'Question',
        name: isKk ? 'Қазақ тематикасы бар ма?' : 'Есть ли казахская тематика?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: isKk
            ? 'Иә! Біздің AI қазақ даласы, киіз үй, жылқылар фонын қосады — Гибли стилі + қазақ мәдениеті.'
            : 'Да! Наш AI добавляет фон казахской степи, юрты, лошадей — стиль Гибли + казахская культура.',
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <section className="enc-hero">
        <div className="enc-hero-bg" />
        <div className="enc-hero-content">
          <Breadcrumb
            items={[
              { label: 'Шежіре', href: `/${locale}` },
              { label: isKk ? 'AI' : 'AI', href: `/${locale}/ai` },
              { label: isKk ? 'Гибли стилі' : 'Стиль Гибли' },
            ]}
          />
          <h1 className="enc-hero-title">{isKk ? 'Гибли стиліндегі сурет' : 'Фото в стиле Гибли'}</h1>
          <p className="enc-hero-sub">
            {isKk
              ? 'Studio Ghibli аниме стилінде, қазақ даласы фонымен'
              : 'В стиле аниме Studio Ghibli с казахской степью'}
          </p>
        </div>
      </section>

      <main className="enc-main">
        <div className="container">
          <section className="za-section">
            <h2 className="za-h2">{isKk ? 'Қалай жұмыс істейді?' : 'Как это работает?'}</h2>
            <ol className="za-steps">
              <li>{isKk ? 'Суретіңізді жүктеңіз (JPG, PNG, WEBP)' : 'Загрузите фото (JPG, PNG, WEBP)'}</li>
              <li>{isKk ? 'AI 10-15 секундта аниме-иллюстрация жасайды' : 'AI создаст аниме-иллюстрацию за 10-15 секунд'}</li>
              <li>{isKk ? 'Нәтижені жүктеп алыңыз!' : 'Скачайте результат!'}</li>
            </ol>
          </section>

          <section className="za-section">
            <h2 className="za-h2">{isKk ? 'Неге Гибли + Қазақ?' : 'Почему Гибли + Казахстан?'}</h2>
            <p className="za-text">
              {isKk
                ? 'Studio Ghibli стилі табиғатпен, кеңістікпен, дәстүрмен гармонияны көрсетеді. Қазақ даласы, киіз үйлер, жылқылар — бұл стильге керемет сәйкес келеді. Нәтижесінде — ерекше аниме-иллюстрация, мәдени мұраны заманауи өнерде көрсетеді.'
                : 'Стиль Studio Ghibli передаёт гармонию с природой, простором, традициями. Казахская степь, юрты, лошади — идеально вписываются в этот стиль. Результат — уникальная аниме-иллюстрация, которая показывает культурное наследие через современное искусство.'}
            </p>
          </section>

          <div style={{ textAlign: 'center', margin: '2rem 0' }}>
            <Link href={`/${locale}#ai-section`} className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}>
              {isKk ? 'Гибли стилінде жасау' : 'Создать в стиле Гибли'}
            </Link>
          </div>

          <section className="za-section">
            <h2 className="za-h2">{isKk ? 'Жиі қойылатын сұрақтар' : 'Часто задаваемые вопросы'}</h2>
            <div className="za-cards">
              <div className="za-card">
                <h3 className="za-card-title">{isKk ? 'Гибли стилі деген не?' : 'Что такое стиль Гибли?'}</h3>
                <p className="za-card-text">
                  {isKk
                    ? 'Хаяо Миядзакидің жапон анимация студиясының стилі — жұмсақ бояулар, арманшыл атмосфера.'
                    : 'Стиль японской анимационной студии Хаяо Миядзаки — мягкие тона, мечтательная атмосфера.'}
                </p>
              </div>
              <div className="za-card">
                <h3 className="za-card-title">{isKk ? 'Бұл тегін бе?' : 'Это бесплатно?'}</h3>
                <p className="za-card-text">
                  {isKk ? 'Иә, толығымен тегін. Сағатына 3 рет.' : 'Да, полностью бесплатно. 3 раза в час.'}
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <section className="enc-cta">
        <div className="container">
          <h3>{isKk ? 'Басқа AI мүмкіндіктер' : 'Другие AI функции'}</h3>
          <p>{isKk ? 'Экшн-фигурка, питомец адамға және т.б.' : 'Экшн-фигурка, питомец в человека и другие'}</p>
          <Link href={`/${locale}/ai`} className="btn btn-primary">
            {isKk ? 'Барлық AI мүмкіндіктер' : 'Все AI функции'}
          </Link>
        </div>
      </section>
    </>
  );
}
