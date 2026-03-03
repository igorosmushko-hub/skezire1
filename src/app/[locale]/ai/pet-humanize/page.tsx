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
  const url = `${base}/${locale}/ai/pet-humanize`;
  const ogImage = `${base}/${locale}/opengraph-image`;

  return {
    title: isKk
      ? 'Питомецті адамға айналдыру — AI нейросеть | Шежіре'
      : 'Превратить питомца в человека — AI нейросеть | Шежіре',
    description: isKk
      ? 'Жануарыңыздың суретін жүктеңіз — AI оны қазақ ұлттық киіміндегі адамға айналдырады. Мысық, ит, құс — бәрі батыр болады! Тегін онлайн.'
      : 'Загрузите фото питомца — AI превратит его в человека в казахском национальном костюме. Кот, пёс, птица — каждый станет батыром! Бесплатно онлайн.',
    keywords: isKk
      ? 'питомец адамға, нейросеть жануар адам, AI pet to human, мысық адамға, ит адамға'
      : 'питомец в человека, нейросеть животное в человека, AI pet to human, кот в человека, собака в человека',
    openGraph: {
      type: 'website',
      title: isKk ? 'Питомецті адамға айналдыру | Шежіре' : 'Питомец в человека | Шежіре',
      description: isKk
        ? 'AI жануарыңызды қазақ стиліндегі адамға айналдырады. Тегін!'
        : 'AI превратит питомца в человека в казахском стиле. Бесплатно!',
      url,
      siteName: 'Шежіре',
      images: [{ url: ogImage, width: 1200, height: 630, alt: 'AI Питомец в человека Шежіре' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: isKk ? 'Питомецті адамға айналдыру | Шежіре' : 'Питомец в человека | Шежіре',
      images: [ogImage],
    },
    alternates: {
      canonical: url,
      languages: {
        kk: `${base}/kk/ai/pet-humanize`,
        ru: `${base}/ru/ai/pet-humanize`,
        'x-default': `${base}/kk/ai/pet-humanize`,
      },
    },
  };
}

export default async function PetHumanizePage({
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
      { '@type': 'ListItem', position: 3, name: isKk ? 'Питомец адамға' : 'Питомец в человека', item: `${base}/${locale}/ai/pet-humanize` },
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: isKk ? 'Қандай жануарлар қолдау етіледі?' : 'Какие животные поддерживаются?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: isKk
            ? 'Кез-келген жануар: мысық, ит, құс, жылқы, тышқан — кез-келген суретті жүктей аласыз.'
            : 'Любое животное: кот, собака, птица, лошадь, хомяк — можно загрузить любое фото.',
        },
      },
      {
        '@type': 'Question',
        name: isKk ? 'Нәтиже қандай болады?' : 'Какой будет результат?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: isKk
            ? 'AI жануарыңыздың бет-бейнесін адамға айналдырады, қазақ ұлттық киімінде көрсетеді.'
            : 'AI превращает черты вашего питомца в человеческое лицо и показывает в казахском национальном костюме.',
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
              { label: isKk ? 'Питомец адамға' : 'Питомец в человека' },
            ]}
          />
          <h1 className="enc-hero-title">{isKk ? 'Питомецті адамға айналдыру' : 'Превратить питомца в человека'}</h1>
          <p className="enc-hero-sub">
            {isKk
              ? 'AI жануарыңызды қазақ стиліндегі адамға айналдырады'
              : 'AI превратит вашего питомца в человека в казахском стиле'}
          </p>
        </div>
      </section>

      <main className="enc-main">
        <div className="container">
          <section className="za-section">
            <h2 className="za-h2">{isKk ? 'Қалай жұмыс істейді?' : 'Как это работает?'}</h2>
            <ol className="za-steps">
              <li>{isKk ? 'Жануарыңыздың суретін жүктеңіз' : 'Загрузите фото вашего питомца'}</li>
              <li>{isKk ? 'Жынысын таңдаңыз (ер/әйел)' : 'Выберите пол (мужской/женский)'}</li>
              <li>{isKk ? 'AI 10-15 секундта нәтиже жасайды' : 'AI создаст результат за 10-15 секунд'}</li>
              <li>{isKk ? 'Нәтижені жүктеп алыңыз және бөлісіңіз!' : 'Скачайте и делитесь с друзьями!'}</li>
            </ol>
          </section>

          <div style={{ textAlign: 'center', margin: '2rem 0' }}>
            <Link href={`/${locale}#ai-section`} className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}>
              {isKk ? 'Питомецті айналдыру' : 'Превратить питомца'}
            </Link>
          </div>

          <section className="za-section">
            <h2 className="za-h2">{isKk ? 'Жиі қойылатын сұрақтар' : 'Часто задаваемые вопросы'}</h2>
            <div className="za-cards">
              <div className="za-card">
                <h3 className="za-card-title">{isKk ? 'Қандай жануарлар қолдау етіледі?' : 'Какие животные поддерживаются?'}</h3>
                <p className="za-card-text">
                  {isKk ? 'Кез-келген жануар: мысық, ит, құс, жылқы.' : 'Любое: кот, собака, птица, лошадь.'}
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
          <p>{isKk ? 'Экшн-фигурка, Гибли стилі және т.б.' : 'Экшн-фигурка, стиль Гибли и другие'}</p>
          <Link href={`/${locale}/ai`} className="btn btn-primary">
            {isKk ? 'Барлық AI мүмкіндіктер' : 'Все AI функции'}
          </Link>
        </div>
      </section>
    </>
  );
}
