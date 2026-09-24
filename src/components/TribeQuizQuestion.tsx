'use client';

import { useMemo } from 'react';
import { TRIBES_DB } from '@/data/tribes';
import { KZ_REGIONS } from '@/data/kz-regions';
import { ZHUZ_INDEX } from '@/data/tribes-index';
import type { QuizQuestion } from '@/data/tribe-quiz-questions';

interface Props {
  question: QuizQuestion;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  locale: string;
}

export function TribeQuizQuestion({ question, value, onChange, locale }: Props) {
  const isKk = locale === 'kk';

  const tamgaList = useMemo(() => {
    const set = new Set<string>();
    for (const zhuz of TRIBES_DB) for (const t of zhuz.tribes) set.add(t.tamga);
    return Array.from(set);
  }, []);

  const tribeOptions = useMemo(
    () => ZHUZ_INDEX.flatMap((z) => z.tribes.map((t) => (isKk ? t.kk : t.ru))),
    [isKk],
  );

  if (question.type === 'select') {
    return (
      <div className="quiz-options">
        {question.options?.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`quiz-option${value === opt.value ? ' active' : ''}`}
            onClick={() => onChange(opt.value)}
          >
            {isKk ? opt.kk : opt.ru}
          </button>
        ))}
      </div>
    );
  }

  if (question.type === 'region') {
    return (
      <div className="quiz-options quiz-options--scroll">
        {KZ_REGIONS.map((r) => (
          <button
            key={r.id}
            type="button"
            className={`quiz-option${value === r.id ? ' active' : ''}`}
            onClick={() => onChange(r.id)}
          >
            {isKk ? r.kk : r.ru}
          </button>
        ))}
      </div>
    );
  }

  if (question.type === 'tamga') {
    return (
      <div className="quiz-tamga-grid">
        {tamgaList.map((symbol) => (
          <button
            key={symbol}
            type="button"
            className={`quiz-tamga-btn${value === symbol ? ' active' : ''}`}
            onClick={() => onChange(symbol)}
            aria-label={symbol}
          >
            {symbol}
          </button>
        ))}
      </div>
    );
  }

  if (question.type === 'tribe-autocomplete') {
    return (
      <>
        <input
          className="quiz-input"
          list="quiz-tribe-list"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || undefined)}
          placeholder={isKk ? 'Ру атын жазыңыз' : 'Введите название рода'}
        />
        <datalist id="quiz-tribe-list">
          {tribeOptions.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </>
    );
  }

  if (question.type === 'textarea') {
    return (
      <textarea
        className="quiz-textarea"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        rows={4}
      />
    );
  }

  return (
    <input
      className="quiz-input"
      type="text"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || undefined)}
      placeholder={(isKk ? question.placeholder_kk : question.placeholder_ru) ?? ''}
    />
  );
}
