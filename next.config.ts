import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // output: 'standalone' — only for Docker, not needed for Vercel
};

export default withNextIntl(nextConfig);
