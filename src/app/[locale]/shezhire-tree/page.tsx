import type { Metadata } from 'next';
import Link from 'next/link';
import { InteractiveTree } from '@/components/tribe-tree/InteractiveTree';
import { TRIBES_DB } from '@/data/tribes';
import { stringifyJsonLd } from '@/lib/tribe-tree';
import { buildTribeTree } from '@/lib/tribe-tree-page';
import '@/styles/shezhire-tree.css';
import '@/styles/tribe-race.css';

const BASE_URL = 'https://skezire.kz';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ highlight?: string; join?: string }>;
}

export async function generateMetadata({ params }: Pick<PageProps, 'params'>): Promise<Metadata> {
  const { locale } = await params;
  const isKk = locale === 'kk';
  const url = `${BASE_URL}/${locale}/shezhire-tree`;
  const ogImage = `${BASE_URL}/${locale}/opengraph-image`;

  return {
    title: isKk
      ? 'Қазақ рулары: 47 рудың интерактивті шежіре ағашы'
      : 'Казахские роды: интерактивное дерево 47 родов',
    description: isKk
      ? 'Алаштан жүздер мен 47 руға дейінгі интерактивті шежіре ағашы. Руды іздеңіз, тармақтарды ашыңыз және әр рудың тарихын оқыңыз.'
      : 'Интерактивное дерево казахских родов: Алаш, жузы и 47 родов. Найдите свой род, раскройте ветви и перейдите к подробной истории рода.',
    keywords: isKk
      ? 'қазақ рулары, шежіре ағашы, рулар ағашы, жүздер, 47 ру, Алаш'
      : 'казахские роды, дерево шежіре, древо родов, жузы, 47 родов, Алаш',
    openGraph: {
      type: 'website',
      title: isKk ? 'Қазақ руларының интерактивті ағашы' : 'Интерактивное дерево казахских родов',
      description: isKk ? 'Алаш → жүздер → 47 ру. Рулар шежіресін зерттеңіз.' : 'Алаш → жузы → 47 родов. Исследуйте структуру шежіре.',
      url,
      siteName: 'Шежіре',
      locale: isKk ? 'kk_KZ' : 'ru_RU',
      images: [{ url: ogImage, width: 1200, height: 630, alt: isKk ? 'Қазақ руларының ағашы' : 'Дерево казахских родов' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: isKk ? 'Қазақ руларының интерактивті ағашы' : 'Интерактивное дерево казахских родов',
      images: [ogImage],
    },
    alternates: {
      canonical: url,
      languages: {
        kk: `${BASE_URL}/kk/shezhire-tree`,
        ru: `${BASE_URL}/ru/shezhire-tree`,
        'x-default': `${BASE_URL}/kk/shezhire-tree`,
      },
    },
  };
}

export default async function ShezhireTreePage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { highlight, join } = await searchParams;
  const isKk = locale === 'kk';
  const tree = buildTribeTree(locale, TRIBES_DB);
  const initialFocusId = highlight ? (highlight.includes(':') ? highlight : `tribe:${highlight}`) : undefined;
  const pageUrl = `${BASE_URL}/${locale}/shezhire-tree`;
  const tribeCount = TRIBES_DB.reduce((sum, zhuz) => sum + zhuz.tribes.length, 0);
  const zhuzCount = TRIBES_DB.length;
  let position = 0;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isKk ? 'Басты бет' : 'Главная', item: `${BASE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: isKk ? 'Рулар ағашы' : 'Дерево родов', item: pageUrl },
    ],
  };
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: isKk ? 'Қазақ руларының интерактивті ағашы' : 'Интерактивное дерево казахских родов',
    description: isKk ? 'Алаштан 47 қазақ руына дейінгі шежіре картасы.' : 'Карта шежіре от Алаша до 47 казахских родов.',
    url: pageUrl,
    inLanguage: isKk ? 'kk-KZ' : 'ru-RU',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: TRIBES_DB.reduce((sum, zhuz) => sum + zhuz.tribes.length, 0),
      itemListElement: TRIBES_DB.flatMap((zhuz) => zhuz.tribes.map((tribe) => ({
        '@type': 'ListItem',
        position: ++position,
        name: isKk ? tribe.kk : tribe.ru,
        url: `${BASE_URL}/${locale}/encyclopedia/${zhuz.id}/${tribe.id}`,
      }))),
    },
  };

  return (
    <main className="tt-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: stringifyJsonLd(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: stringifyJsonLd(collectionJsonLd) }} />

      <header className="tt-hero">
        <div className="tt-hero-inner">
          <nav aria-label={isKk ? 'Навигация жолы' : 'Хлебные крошки'}>
            <Link href={`/${locale}`}>{isKk ? 'Басты бет' : 'Главная'}</Link>
            <span aria-hidden="true">/</span>
            <span>{isKk ? 'Рулар ағашы' : 'Дерево родов'}</span>
          </nav>
          <span className="tt-hero-kicker">{isKk ? 'ҚАЗАҚ ШЕЖІРЕСІ' : 'КАЗАХСКАЯ ШЕЖІРЕ'}</span>
          <h1>{isKk ? 'Қазақ руларының интерактивті ағашы' : 'Интерактивное дерево казахских родов'}</h1>
          <p>{isKk
            ? 'Алаштан жүздерге, рулар мен белгілі тармақтарға дейін. Ағашты ашып, өз руыңызды тауып, оның тарихына өтіңіз.'
            : 'От Алаша к жузам, родам и известным ветвям. Раскрывайте дерево, находите свой род и переходите к его истории.'}</p>
          <div className="tt-hero-facts" aria-label={isKk ? 'Ағаш құрамы' : 'Состав дерева'}>
            <span><strong>{tribeCount}</strong> {isKk ? 'ру' : 'родов'}</span>
            <span><strong>{zhuzCount}</strong> {isKk ? 'негізгі бөлім' : 'основных раздела'}</span>
            <span><strong>RU / KK</strong></span>
          </div>
        </div>
      </header>

      <div className="tt-shell">
        <InteractiveTree
          key={`${locale}:${initialFocusId ?? 'root'}:${join === '1' ? 'join' : 'view'}`}
          locale={locale}
          tree={tree}
          initialFocusId={initialFocusId}
          initialJoin={join === '1'}
        />

        <section className="tt-directory" aria-labelledby="tribe-directory-title">
          <div className="tt-directory-intro">
            <span className="tt-eyebrow">{isKk ? 'Рулар каталогы' : 'Каталог родов'}</span>
            <h2 id="tribe-directory-title">{isKk ? 'Жүздер мен рулар тізімі' : 'Жузы и казахские роды'}</h2>
            <p>{isKk
              ? 'Әр атау жеке энциклопедиялық бетке апарады. Терең тармақтар дереккөздері тексерілгеннен кейін қосылады.'
              : 'Каждое название ведёт на отдельную энциклопедическую страницу. Более глубокие ветви добавляются после проверки источников.'}</p>
          </div>

          <div className="tt-directory-grid">
            {TRIBES_DB.map((zhuz) => (
              <article key={zhuz.id} className={`tt-directory-group tt-directory-group--${zhuz.id}`}>
                <h3><Link href={`/${locale}/encyclopedia/${zhuz.id}`}>{isKk ? zhuz.kk : zhuz.ru}</Link></h3>
                <p>{zhuz.tribes.length} {isKk ? 'ру' : 'родов'}</p>
                <ul>
                  {zhuz.tribes.map((tribe) => (
                    <li key={tribe.id}>
                      <Link href={`/${locale}/encyclopedia/${zhuz.id}/${tribe.id}`}>
                        <span aria-hidden="true">{tribe.tamga}</span>
                        {isKk ? tribe.kk : tribe.ru}
                      </Link>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
