import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['kk', 'ru'],
  defaultLocale: 'kk',
});

export const { Link, useRouter, usePathname, redirect } = createNavigation(routing);
