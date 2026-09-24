import type { ReactNode } from 'react';
import type { Viewport } from 'next';
import Script from 'next/script';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { getLocale } from 'next-intl/server';
import '@/styles/globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

const cormorant = Cormorant_Garamond({
  subsets: ['cyrillic', 'latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['cyrillic', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${cormorant.variable} ${inter.variable}`}>
      <head>
        <Script id="metrika-queue" strategy="beforeInteractive">{`
          window.ym=window.ym||function(){(window.ym.a=window.ym.a||[]).push(arguments)};
        `}</Script>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="alternate" type="application/rss+xml" title="Шежіре — Блог" href="/feed.xml" />
      </head>
      <body>
        {children}
        <Script id="yandex-metrika" strategy="afterInteractive">{`
          (function(m,e,t,r,i,k,a){
            m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
          })(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=107086067','ym');
          function analyticsUrl(value) {
            if (!value) return '';
            try {
              var url = new URL(value, location.origin);
              for (var key of Array.from(url.searchParams.keys())) { if (key.startsWith('_vercel_')) url.searchParams.delete(key); }
              if (url.pathname.endsWith('/shezhire-tree')) { url.search=''; url.hash=''; }
              return url.href;
            } catch { return ''; }
          }
          ym(107086067,'init',{ssr:true,webvisor:true,clickmap:true,ecommerce:"dataLayer",referrer:analyticsUrl(document.referrer),url:analyticsUrl(location.href),accurateTrackBounce:true,trackLinks:true});
        `}</Script>
        <noscript>
          <div>
            <img src="https://mc.yandex.ru/watch/107086067" style={{position:'absolute',left:'-9999px'}} alt="" />
          </div>
        </noscript>
      </body>
    </html>
  );
}
