import type { ReactNode } from 'react';

// Root layout is intentionally minimal — <html> and <body> are rendered
// in [locale]/layout.tsx so that `lang` and font variables are set correctly.
// Next.js 16 requires these tags in a layout, so we provide them here as a
// wrapper that the locale layout will replace via its own <html>/<body>.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
