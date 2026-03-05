import dynamic from 'next/dynamic';

const AiPastModal = dynamic(() => import('../AiPastModal').then((m) => m.AiPastModal));
const AiAncestorModal = dynamic(() => import('../AiAncestorModal').then((m) => m.AiAncestorModal));
const AiActionFigureModal = dynamic(() => import('../AiActionFigureModal').then((m) => m.AiActionFigureModal));
const AiPetHumanModal = dynamic(() => import('../AiPetHumanModal').then((m) => m.AiPetHumanModal));
const AiGhibliModal = dynamic(() => import('../AiGhibliModal').then((m) => m.AiGhibliModal));

export const MODAL_MAP: Record<string, React.ComponentType<{ open: boolean; onClose: () => void }>> = {
  past: AiPastModal,
  ancestor: AiAncestorModal,
  'action-figure': AiActionFigureModal,
  'pet-humanize': AiPetHumanModal,
  'ghibli-style': AiGhibliModal,
};
