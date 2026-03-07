'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { MODAL_MAP } from './modal-map';

const PAGE_FEATURES = ['family-portrait'];

interface Props {
  featureSlug: string;
  label: string;
}

export function HeroCtaButton({ featureSlug, label }: Props) {
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const router = useRouter();
  const ModalComponent = MODAL_MAP[featureSlug];

  const handleClick = () => {
    if (PAGE_FEATURES.includes(featureSlug)) {
      router.push(`/${locale}/ai/${featureSlug}/create`);
    } else {
      setOpen(true);
    }
  };

  return (
    <>
      <button className="btn-hero" onClick={handleClick}>
        {label}
      </button>
      {ModalComponent && <ModalComponent open={open} onClose={() => setOpen(false)} />}
    </>
  );
}
