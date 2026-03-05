'use client';

import { useState } from 'react';
import { MODAL_MAP } from './modal-map';

interface Props {
  featureSlug: string;
  label: string;
}

export function HeroCtaButton({ featureSlug, label }: Props) {
  const [open, setOpen] = useState(false);
  const ModalComponent = MODAL_MAP[featureSlug];

  return (
    <>
      <button className="btn-hero" onClick={() => setOpen(true)}>
        {label}
      </button>
      {ModalComponent && <ModalComponent open={open} onClose={() => setOpen(false)} />}
    </>
  );
}
