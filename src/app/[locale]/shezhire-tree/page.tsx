import type { Metadata } from 'next';
import Link from 'next/link';
import { InteractiveTree } from '@/components/tribe-tree/InteractiveTree';
import { TRIBES_DB } from '@/data/tribes';
import { getInitialGenealogyTree } from '@/lib/genealogy-data';
import { stringifyJsonLd } from '@/lib/tribe-tree';
import '@/styles/shezhire-tree.css';
import '@/styles/tribe-race.css';

const BASE_URL = 'https://skezire.kz';

// The published source and its access rules are evaluated for every request.
export const dynamic = 'force-dynamic';

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
      ? 'Қазақ руларының генеалогиялық картасы | Шежіре'
      : 'Генеалогическая карта казахских родов | Шежіре',
    description: isKk
      ? 'Энциклопедиядағы 47 ру мен 4 бөлімнің интерактивті анықтамалық ағашы. Тармақтарды ашып, ру туралы оқыңыз.'
      : 'Интерактивное справочное дерево 47 родов и 4 разделов энциклопедии. Раскрывайте ветви и переходите к статьям о родах.',
    keywords: isKk
      ? 'қазақ рулары, шежіре, генеалогиялық карта, рулар ағашы'
      : 'казахские роды, шежіре, генеалогическая карта, дерево родов',
    openGraph: {
      type: 'website',
      title: isKk ? 'Қазақ руларының генеалогиялық картасы' : 'Генеалогическая карта казахских родов',
      description: isKk ? 'Энциклопедиядағы 47 рудың интерактивті анықтамалық ағашы.' : 'Интерактивное справочное дерево 47 родов из энциклопедии.',
      url,
      siteName: 'Шежіре',
      locale: isKk ? 'kk_KZ' : 'ru_RU',
      images: [{ url: ogImage, width: 1200, height: 630, alt: isKk ? 'Қазақ руларының ағашы' : 'Дерево казахских родов' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: isKk ? 'Қазақ руларының генеалогиялық картасы' : 'Генеалогическая карта казахских родов',
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
  // Existing tribe slugs use the legacy prefix; external numeric IDs are opaque.
  const initialFocusId = highlight
    ? (highlight === 'alash' || highlight.includes(':') || /^\d+$/.test(highlight) ? highlight : `tribe:${highlight}`)
    : undefined;
  let genealogy: Awaited<ReturnType<typeof getInitialGenealogyTree>> | null = null;
  let focusUnavailable = false;
  try {
    genealogy = await getInitialGenealogyTree(locale, initialFocusId);
  } catch (error) {
    // Log only application codes; database exceptions may contain private values.
    const code = error instanceof Error && /^genealogy_[a-z_]+$/.test(error.message)
      ? error.message : 'genealogy_unavailable';
    focusUnavailable = code === 'genealogy_focus_unavailable';
    console.error('[genealogy]', code);
    // The directory remains useful when the published data source is unavailable.
  }
  const pageUrl = `${BASE_URL}/${locale}/shezhire-tree`;
  const tribeCount = TRIBES_DB.reduce((sum, zhuz) => sum + zhuz.tribes.length, 0);
  let position = 0;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isKk ? 'Басты бет' : 'Главная', item: `${BASE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: isKk ? 'Рулар ағашы' : 'Дерево родов', item: pageUrl },
    ],
  };
  const genealogyJsonLd = genealogy ? {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: isKk ? 'Қазақ руларының генеалогиялық картасы' : 'Генеалогическая карта казахских родов',
    description: isKk
      ? 'Энциклопедиямен байланыстырылған интерактивті анықтамалық ағаш.'
      : 'Интерактивное справочное дерево, связанное со статьями энциклопедии.',
    url: pageUrl,
    inLanguage: isKk ? 'kk-KZ' : 'ru-RU',
  } : null;
  const directoryJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: isKk ? '47 рудың энциклопедиялық каталогы' : 'Энциклопедический каталог 47 родов',
    description: isKk
      ? 'Генеалогиялық картадан бөлек, энциклопедиялық беттері бар 47 рудың навигациялық каталогы.'
      : 'Отдельный от генеалогической карты навигационный каталог 47 родов с энциклопедическими страницами.',
    url: `${pageUrl}#tribe-directory`,
    inLanguage: isKk ? 'kk-KZ' : 'ru-RU',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: tribeCount,
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
      {genealogyJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: stringifyJsonLd(genealogyJsonLd) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: stringifyJsonLd(directoryJsonLd) }} />

      <header className="tt-hero">
        <div className="tt-hero-inner">
          <nav aria-label={isKk ? 'Навигация жолы' : 'Хлебные крошки'}>
            <Link href={`/${locale}`}>{isKk ? 'Басты бет' : 'Главная'}</Link>
            <span aria-hidden="true">/</span>
            <span>{isKk ? 'Рулар ағашы' : 'Дерево родов'}</span>
          </nav>
          <span className="tt-hero-kicker">{isKk ? 'ҚАЗАҚ ШЕЖІРЕСІ' : 'КАЗАХСКАЯ ШЕЖІРЕ'}</span>
          <h1>{isKk ? 'Қазақ руларының генеалогиялық картасы' : 'Генеалогическая карта казахских родов'}</h1>
          <p>{isKk
            ? 'Энциклопедиядағы 47 ру мен олардың тармақтарын зерттеңіз. Бұл — дәстүрлі шежіренің анықтамалық ағашы; әр байланыс дәлелденген биологиялық туыстықты білдірмейді.'
            : 'Исследуйте 47 родов энциклопедии и их ветви. Это справочное дерево традиционной шежіре; связи не означают доказанное биологическое родство.'}</p>
          <div className="tt-hero-facts" aria-label={isKk ? 'Ағаш құрамы' : 'Состав дерева'}>
            <span><strong>4</strong> {isKk ? 'бөлім' : 'раздела'}</span>
            <span><strong>{tribeCount}</strong> {isKk ? 'ру' : 'родов'}</span>
            <span><strong>RU / KK</strong></span>
          </div>
        </div>
      </header>

      <div className="tt-shell">
        <p>{genealogy?.source === 'repo'
          ? (isKk ? 'Энциклопедиядағы рулардың анықтамалық ағашы ашық. Бұл Tumalas деректерінің толық картасы емес.' : 'Открыто справочное дерево родов из энциклопедии. Это не полная карта данных Tumalas.')
          : (isKk ? 'Импортталған деректер тек жариялауға тексерілгеннен кейін көрсетіледі. Tumalas жергілікті көшірмесінің 2026-08-20 түсірілімінде 794 594 жазба, байланыс тереңдігі 31 деңгейге дейін болған. Бұл 31 тарихи дәлелденген ұрпақ дегенді білдірмейді.' : 'Импортированные данные показываются только после проверки оснований публикации. Локальный снимок Tumalas от 20.08.2026 содержал 794 594 записи и связи глубиной до 31 уровня. Это не означает 31 исторически подтверждённое поколение.')}
          {' '}<Link href={`/${locale}/contacts`}>{isKk ? 'Қате туралы хабарлау' : 'Сообщить об ошибке'}</Link>
        </p>
        {genealogy ? (
          <InteractiveTree
            key={`${locale}:${initialFocusId ?? 'root'}:${join === '1' ? 'join' : 'view'}`}
            locale={locale}
            tree={genealogy.tree}
            source={genealogy.source}
            initialFocusId={genealogy.focusId ?? initialFocusId}
            initialJoin={join === '1'}
          />
        ) : (
          <section className="tt-directory" role="status" aria-live="polite">
            <div className="tt-directory-intro">
              {focusUnavailable ? (
                <>
                  <h2>{isKk ? 'Тармақ табылмады немесе қолжетімсіз' : 'Ветвь не найдена или недоступна'}</h2>
                  <p>{isKk
                    ? 'Картаны басынан ашыңыз немесе төмендегі каталогтан руды таңдаңыз.'
                    : 'Откройте карту с начала или выберите род в каталоге ниже.'}</p>
                  <Link href={`/${locale}/shezhire-tree`}>{isKk ? 'Картаны басынан ашу' : 'Открыть карту с начала'}</Link>
                </>
              ) : (
                <>
                  <span className="tt-eyebrow">{isKk ? 'Дереккөз қолжетімсіз' : 'Источник недоступен'}</span>
                  <h2>{isKk ? 'Генеалогиялық карта уақытша ашылмады' : 'Генеалогическая карта временно недоступна'}</h2>
                  <p>{isKk
                    ? 'Жария дереккөзге қазір қосылу мүмкін емес. Төмендегі 47 рудың энциклопедиялық каталогы ашық.'
                    : 'Сейчас не удалось подключиться к опубликованному источнику. Энциклопедический каталог 47 родов ниже остаётся доступен.'}</p>
                </>
              )}
            </div>
          </section>
        )}

        <section id="tribe-directory" className="tt-directory" aria-labelledby="tribe-directory-title">
          <div className="tt-directory-intro">
            <span className="tt-eyebrow">{isKk ? 'Рулар каталогы' : 'Каталог родов'}</span>
            <h2 id="tribe-directory-title">{isKk ? '47 рудың энциклопедиялық каталогы' : 'Энциклопедический каталог 47 родов'}</h2>
            <p>{isKk
              ? 'Дереккөздері бар мақаланы оқып, ағаштағы тармағын ашу үшін руды таңдаңыз.'
              : 'Выберите род, чтобы прочитать статью с источниками и открыть его ветвь в дереве.'}</p>
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
