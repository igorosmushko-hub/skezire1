'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { ymGoal } from '@/lib/analytics';

export function TreeMapLink({ locale, targetKind, ...props }: ComponentProps<typeof Link> & {
  locale: string;
  targetKind: 'tribe' | 'zhuz';
}) {
  return <Link {...props} onClick={() => ymGoal('public_article_tree', { locale, target_kind: targetKind })} />;
}
