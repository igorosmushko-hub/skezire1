'use client';

import { useState } from 'react';
import { FormSection } from './FormSection';
import { TreeSection } from './TreeSection';
import type { TreeFormData } from '@/lib/types';

export function FormTreeContainer({ locale }: { locale: string }) {
  const [formData, setFormData] = useState<TreeFormData | null>(null);

  return (
    <>
      <FormSection locale={locale} onSubmit={setFormData} />
      {formData && <TreeSection data={formData} locale={locale} />}
    </>
  );
}
