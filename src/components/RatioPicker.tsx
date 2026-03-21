'use client';

import { useTranslations } from 'next-intl';

export type AspectRatio = '9:16' | '1:1' | '3:4';
export type FamilyAspectRatio = '16:9' | '9:16';

interface Props {
  value: string;
  onChange: (ratio: string) => void;
  options?: { value: string; labelKey: string }[];
}

const SINGLE_OPTIONS = [
  { value: '9:16', labelKey: 'stories' },
  { value: '1:1', labelKey: 'feed' },
  { value: '3:4', labelKey: 'portrait' },
];

const FAMILY_OPTIONS = [
  { value: '16:9', labelKey: 'landscape' },
  { value: '9:16', labelKey: 'stories' },
];

export function RatioPicker({ value, onChange, options }: Props) {
  const t = useTranslations('ai.ratio');
  const opts = options ?? SINGLE_OPTIONS;

  return (
    <div className="ai-ratio-picker">
      {opts.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`ai-ratio-btn${value === opt.value ? ' active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          <span className="ai-ratio-icon" data-ratio={opt.value} />
          {t(opt.labelKey)}
        </button>
      ))}
    </div>
  );
}

export { SINGLE_OPTIONS, FAMILY_OPTIONS };
