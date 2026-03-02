import type { ReactNode } from 'react';
import { Playfair_Display, Inter } from 'next/font/google';
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html className={`${playfair.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
