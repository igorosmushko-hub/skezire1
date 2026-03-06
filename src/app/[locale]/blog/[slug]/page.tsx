import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumb } from '@/components/encyclopedia/Breadcrumb';
import { BLOG_POSTS } from '@/data/blog';
import { AiPromoBanner } from '@/components/AiPromoBanner';
import { AiInlineHint } from '@/components/AiInlineHint';
import '@/styles/blog.css';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const isKk = locale === 'kk';
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return {};

  const base = 'https://skezire.kz';
  const url = `${base}/${locale}/blog/${slug}`;
  const ogImage = `${base}/${locale}/opengraph-image`;

  return {
    title: isKk ? post.titleKk : post.titleRu,
    description: isKk ? post.descKk : post.descRu,
    keywords: isKk ? post.keywordsKk : post.keywordsRu,
    openGraph: {
      type: 'article',
      title: isKk ? post.titleKk : post.titleRu,
      description: isKk ? post.descKk : post.descRu,
      url,
      siteName: 'Шежіре',
      publishedTime: post.date,
      images: [{ url: ogImage, width: 1200, height: 630, alt: isKk ? post.titleKk : post.titleRu }],
    },
    twitter: {
      card: 'summary_large_image',
      title: isKk ? post.titleKk : post.titleRu,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
      languages: {
        kk: `${base}/kk/blog/${slug}`,
        ru: `${base}/ru/blog/${slug}`,
        'x-default': `${base}/kk/blog/${slug}`,
      },
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const isKk = locale === 'kk';
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  const base = 'https://skezire.kz';
  const headings = isKk ? post.headingsKk : post.headingsRu;
  const content = isKk ? post.contentKk : post.contentRu;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Шежіре', item: `${base}/${locale}` },
      { '@type': 'ListItem', position: 2, name: isKk ? 'Блог' : 'Блог', item: `${base}/${locale}/blog` },
      { '@type': 'ListItem', position: 3, name: isKk ? post.titleKk : post.titleRu, item: `${base}/${locale}/blog/${slug}` },
    ],
  };

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: isKk ? post.titleKk : post.titleRu,
    description: isKk ? post.descKk : post.descRu,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: isKk ? 'kk' : 'ru',
    author: { '@type': 'Organization', name: 'Шежіре', url: `${base}/` },
    publisher: { '@type': 'Organization', name: 'Шежіре', url: `${base}/` },
    image: `${base}/${locale}/opengraph-image`,
    mainEntityOfPage: `${base}/${locale}/blog/${slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      <section className="enc-hero enc-hero--compact">
        <div className="enc-hero-bg" />
        <div className="enc-hero-content">
          <Breadcrumb
            items={[
              { label: 'Шежіре', href: `/${locale}` },
              { label: isKk ? 'Блог' : 'Блог', href: `/${locale}/blog` },
              { label: isKk ? post.titleKk : post.titleRu },
            ]}
          />
          <h1 className="enc-hero-title" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.4rem)' }}>
            {isKk ? post.titleKk : post.titleRu}
          </h1>
          <time className="blog-date">{post.date}</time>
        </div>
      </section>

      <main className="blog-main">
        <div className="container">
          <article className="blog-article">
            {content.map((paragraph, i) => (
              <div key={i}>
                {headings[i] && <h2 className="blog-h2">{headings[i]}</h2>}
                <p className="blog-p">{paragraph}</p>
                {i === 1 && <AiInlineHint slug="past" locale={locale} />}
              </div>
            ))}
          </article>

          <div className="blog-back">
            <Link href={`/${locale}/blog`} className="blog-back-link">
              {isKk ? '← Блогқа оралу' : '← Вернуться в блог'}
            </Link>
          </div>
        </div>
      </main>

      <AiPromoBanner locale={locale} features={['past', 'ancestor', 'ghibli-style']} variant="blog" />
    </>
  );
}
