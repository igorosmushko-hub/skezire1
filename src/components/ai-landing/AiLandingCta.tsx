'use client';

import { useState } from 'react';
import { MODAL_MAP } from './modal-map';

interface Props {
  featureSlug: string;
  locale: string;
}

export function AiLandingCta({ featureSlug, locale }: Props) {
  const [open, setOpen] = useState(false);
  const isKk = locale === 'kk';
  const ModalComponent = MODAL_MAP[featureSlug];

  return (
    <section id="try-now" className="ai-landing-cta-section">
      <h2>{isKk ? 'Қазір қолданып көріңіз' : 'Попробуйте прямо сейчас'}</h2>
      <p>{isKk ? 'Суретіңізді жүктеп, нәтижені көріңіз' : 'Загрузите фото и увидьте результат'}</p>
      <button className="btn-cta-lg" onClick={() => setOpen(true)}>
        {isKk ? 'Қолданып көру' : 'Попробовать'}
      </button>
      {ModalComponent && <ModalComponent open={open} onClose={() => setOpen(false)} />}
    </section>
  );
}
