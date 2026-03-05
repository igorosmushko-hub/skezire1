'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const AiPastModal = dynamic(() => import('../AiPastModal').then((m) => m.AiPastModal));
const AiAncestorModal = dynamic(() => import('../AiAncestorModal').then((m) => m.AiAncestorModal));
const AiActionFigureModal = dynamic(() => import('../AiActionFigureModal').then((m) => m.AiActionFigureModal));
const AiPetHumanModal = dynamic(() => import('../AiPetHumanModal').then((m) => m.AiPetHumanModal));
const AiGhibliModal = dynamic(() => import('../AiGhibliModal').then((m) => m.AiGhibliModal));

const MODAL_MAP: Record<string, React.ComponentType<{ open: boolean; onClose: () => void }>> = {
  past: AiPastModal,
  ancestor: AiAncestorModal,
  'action-figure': AiActionFigureModal,
  'pet-humanize': AiPetHumanModal,
  'ghibli-style': AiGhibliModal,
};

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
