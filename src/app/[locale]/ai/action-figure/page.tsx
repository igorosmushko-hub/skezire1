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
  const url = `${base}/${locale}/ai/action-figure`;
  const ogImage = `${base}/${locale}/opengraph-image`;

  return {
    title: isKk
      ? 'AI Экшн-фигурка — Фото фигуркаға айналдыру | Шежіре'
      : 'AI Экшн-фигурка — Превратить фото в фигурку | Шежіре',
    description: isKk
      ? 'Суретіңізді жүктеңіз — AI сізді қазақ ұлттық киіміндегі коллекциялық экшн-фигуркаға айналдырады. Шапан, тымақ, домбыра — блистер қорапта! Тегін онлайн.'
      : 'Загрузите фото — AI превратит вас в коллекционную экшн-фигурку в казахском национальном костюме. Шапан, тымак, домбыра — в блистерной упаковке! Бесплатно онлайн.',
    keywords: isKk
      ? 'экшн-фигурка нейросеть, AI фигурка жасау, фото фигуркаға, қазақ фигурка, action figure AI'
      : 'экшн-фигурка нейросеть, AI фигурка из фото, сделать фигурку нейросетью, казахская фигурка, action figure AI',
    openGraph: {
      type: 'website',
      title: isKk ? 'AI Экшн-фигурка | Шежіре' : 'AI Экшн-фигурка | Шежіре',
      description: isKk
        ? 'AI сізді қазақ стиліндегі коллекциялық фигуркаға айналдырады. Тегін!'
        : 'AI превратит вас в коллекционную фигурку в казахском стиле. Бесплатно!',
      url,
      siteName: 'Шежіре',
      images: [{ url: ogImage, width: 1200, height: 630, alt: 'AI Экшн-фигурка Шежіре' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: isKk ? 'AI Экшн-фигурка | Шежіре' : 'AI Экшн-фигурка | Шежіре',
      images: [ogImage],
    },
    alternates: {
      canonical: url,
      languages: {
        kk: `${base}/kk/ai/action-figure`,
        ru: `${base}/ru/ai/action-figure`,
        'x-default': `${base}/kk/ai/action-figure`,
      },
    },
  };
}

export default async function ActionFigurePage({
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
      { '@type': 'ListItem', position: 3, name: isKk ? 'Экшн-фигурка' : 'Экшн-фигурка', item: `${base}/${locale}/ai/action-figure` },
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: isKk ? 'AI экшн-фигурка қалай жасалады?' : 'Как создаётся AI экшн-фигурка?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: isKk
            ? 'Суретіңізді жүктейсіз, AI нейросеть оны қазақ ұлттық киіміндегі коллекциялық фигуркаға айналдырады. Процесс 10-15 секунд алады.'
            : 'Вы загружаете фото, AI нейросеть превращает его в коллекционную фигурку в казахском национальном костюме. Процесс занимает 10-15 секунд.',
        },
      },
      {
        '@type': 'Question',
        name: isKk ? 'Бұл тегін бе?' : 'Это бесплатно?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: isKk
            ? 'Иә, AI экшн-фигурка жасау толығымен тегін. Сағатына 3 рет қолдана аласыз.'
            : 'Да, создание AI экшн-фигурки полностью бесплатно. Можно использовать 3 раза в час.',
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
              { label: isKk ? 'Экшн-фигурка' : 'Экшн-фигурка' },
            ]}
          />
          <h1 className="enc-hero-title">{isKk ? 'AI Экшн-фигурка' : 'AI Экшн-фигурка'}</h1>
          <p className="enc-hero-sub">
            {isKk
              ? 'Суретіңізді қазақ стиліндегі коллекциялық фигуркаға айналдырыңыз'
              : 'Превратите фото в коллекционную фигурку в казахском стиле'}
          </p>
        </div>
      </section>

      <main className="enc-main">
        <div className="container">
          <section className="za-section">
            <h2 className="za-h2">{isKk ? 'Қалай жұмыс істейді?' : 'Как это работает?'}</h2>
            <ol className="za-steps">
              <li>{isKk ? 'Суретіңізді жүктеңіз (JPG, PNG, WEBP)' : 'Загрузите фото (JPG, PNG, WEBP)'}</li>
              <li>{isKk ? 'Жынысыңызды таңдаңыз (ер/әйел)' : 'Выберите пол (мужской/женский)'}</li>
              <li>{isKk ? 'AI 10-15 секундта фигуркаңызды жасайды' : 'AI создаст фигурку за 10-15 секунд'}</li>
              <li>{isKk ? 'Нәтижені жүктеп алыңыз!' : 'Скачайте результат!'}</li>
            </ol>
          </section>

          <section className="za-section">
            <h2 className="za-h2">{isKk ? 'Неге бұл ерекше?' : 'Почему это особенное?'}</h2>
            <p className="za-text">
              {isKk
                ? 'Біздің AI фигуркалар қазақ ұлттық киімімен жасалады: шапан, тымақ, домбыра, қылыш, бүркіт — дәстүрлі аксессуарлармен. Бұл жай ғана фигурка емес, бұл мәдени символ!'
                : 'Наши AI-фигурки создаются в казахском национальном костюме: шапан, тымак, домбыра, сабля, беркут — с традиционными аксессуарами. Это не просто фигурка, это культурный символ!'}
            </p>
          </section>

          <div style={{ textAlign: 'center', margin: '2rem 0' }}>
            <Link href={`/${locale}#ai-section`} className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}>
              {isKk ? 'Фигурка жасау' : 'Создать фигурку'}
            </Link>
          </div>

          <section className="za-section">
            <h2 className="za-h2">{isKk ? 'Жиі қойылатын сұрақтар' : 'Часто задаваемые вопросы'}</h2>
            <div className="za-cards">
              <div className="za-card">
                <h3 className="za-card-title">{isKk ? 'Бұл тегін бе?' : 'Это бесплатно?'}</h3>
                <p className="za-card-text">
                  {isKk
                    ? 'Иә, толығымен тегін. Сағатына 3 рет қолдана аласыз.'
                    : 'Да, полностью бесплатно. Можно использовать 3 раза в час.'}
                </p>
              </div>
              <div className="za-card">
                <h3 className="za-card-title">{isKk ? 'Қанша уақыт алады?' : 'Сколько занимает времени?'}</h3>
                <p className="za-card-text">
                  {isKk ? 'AI 10-15 секундта жасайды.' : 'AI создаёт за 10-15 секунд.'}
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <section className="enc-cta">
        <div className="container">
          <h3>{isKk ? 'Басқа AI мүмкіндіктерді көру' : 'Посмотреть другие AI функции'}</h3>
          <p>{isKk ? 'Питомецті адамға, Гибли стилі және т.б.' : 'Питомец в человека, стиль Гибли и другие'}</p>
          <Link href={`/${locale}/ai`} className="btn btn-primary">
            {isKk ? 'Барлық AI мүмкіндіктер' : 'Все AI функции'}
          </Link>
        </div>
      </section>
    </>
  );
}
