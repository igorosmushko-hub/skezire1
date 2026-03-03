import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb } from '@/components/encyclopedia/Breadcrumb';
import { BLOG_POSTS } from '@/data/blog';
import '@/styles/blog.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKk = locale === 'kk';
  const base = 'https://skezire.kz';
  const url = `${base}/${locale}/blog`;

  return {
    title: isKk
      ? 'Блог — Қазақ тарихы мен шежіре мақалалары | Шежіре'
      : 'Блог — Статьи о казахской истории и генеалогии | Шежіре',
    description: isKk
      ? 'Шежіре, жеті ата, жүз, ру, тамға, ұран туралы мақалалар. Қазақ тарихы мен мәдениетін білу.'
      : 'Статьи о шежіре, жеті ата, жузах, родах, тамгах, уранах. Казахская история и культура.',
    alternates: {
      canonical: url,
      languages: {
        kk: `${base}/kk/blog`,
        ru: `${base}/ru/blog`,
        'x-default': `${base}/kk/blog`,
      },
    },
  };
}

export default async function BlogPage({
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
      { '@type': 'ListItem', position: 2, name: isKk ? 'Блог' : 'Блог', item: `${base}/${locale}/blog` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <section className="enc-hero">
        <div className="enc-hero-bg" />
        <div className="enc-hero-content">
          <Breadcrumb
            items={[
              { label: 'Шежіре', href: `/${locale}` },
              { label: isKk ? 'Блог' : 'Блог' },
            ]}
          />
          <h1 className="enc-hero-title">{isKk ? 'Блог' : 'Блог'}</h1>
          <p className="enc-hero-sub">
            {isKk
              ? 'Қазақ тарихы, шежіре және мәдениет туралы мақалалар'
              : 'Статьи о казахской истории, шежіре и культуре'}
          </p>
        </div>
      </section>

      <main className="blog-main">
        <div className="container">
          <div className="blog-grid">
            {BLOG_POSTS.map((post) => (
              <Link
                key={post.slug}
                href={`/${locale}/blog/${post.slug}`}
                className="blog-card"
              >
                <time className="blog-card-date">{post.date}</time>
                <h2 className="blog-card-title">{isKk ? post.titleKk : post.titleRu}</h2>
                <p className="blog-card-desc">{isKk ? post.descKk : post.descRu}</p>
                <span className="blog-card-link">
                  {isKk ? 'Оқу →' : 'Читать →'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
