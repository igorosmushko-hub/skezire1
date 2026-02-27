'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { TRIBES_DB } from '@/data/tribes';
import { ANCESTOR_DEFS } from '@/lib/constants';
import { useToast } from './Toast';
import { TribeCard } from './TribeCard';
import type { Tribe, TreeFormData } from '@/lib/types';

interface FormSectionProps {
  locale: string;
  onSubmit: (data: TreeFormData) => void;
}

export function FormSection({ locale, onSubmit }: FormSectionProps) {
  const t = useTranslations('form');
  const tErr = useTranslations('err');
  const showToast = useToast();
  const isKk = locale === 'kk';

  const [zhuzId, setZhuzId] = useState('');
  const [tribeId, setTribeId] = useState('');
  const [currentTribe, setCurrentTribe] = useState<Tribe | null>(null);
  const [ancestorValues, setAncestorValues] = useState<string[]>(Array(7).fill(''));
  const [nameValue, setNameValue] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [focusedAnc, setFocusedAnc] = useState<number | null>(null);

  // Restore from localStorage
  useEffect(() => {
    const savedZhuz = localStorage.getItem('shejire-zhuz');
    const savedRu = localStorage.getItem('shejire-ru');
    if (savedZhuz) {
      setZhuzId(savedZhuz);
      if (savedRu) {
        setTribeId(savedRu);
        const zhuz = TRIBES_DB.find((z) => z.id === savedZhuz);
        const tribe = zhuz?.tribes.find((t) => t.id === savedRu);
        if (tribe) setCurrentTribe(tribe);
      }
    }
  }, []);

  const handleZhuzChange = useCallback((newZhuzId: string) => {
    setZhuzId(newZhuzId);
    setTribeId('');
    setCurrentTribe(null);
    localStorage.setItem('shejire-zhuz', newZhuzId);
    localStorage.removeItem('shejire-ru');
  }, []);

  const handleTribeChange = useCallback((newTribeId: string) => {
    setTribeId(newTribeId);
    if (!newTribeId) {
      setCurrentTribe(null);
      return;
    }
    const zhuz = TRIBES_DB.find((z) => z.id === zhuzId);
    const tribe = zhuz?.tribes.find((t) => t.id === newTribeId);
    if (tribe) {
      setCurrentTribe(tribe);
      localStorage.setItem('shejire-ru', newTribeId);
    }
  }, [zhuzId]);

  const handleAncestorChange = useCallback((index: number, value: string) => {
    setAncestorValues((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  // Progress calculation
  const filledAncestors = useMemo(() => ancestorValues.filter((v) => v.trim()).length, [ancestorValues]);
  const progress = useMemo(() => {
    let total = 0;
    if (nameValue.trim()) total += 1;
    if (zhuzId) total += 1;
    if (tribeId) total += 1;
    total += filledAncestors;
    return Math.round((total / 10) * 100);
  }, [nameValue, zhuzId, tribeId, filledAncestors]);

  // Step completion
  const step1Done = !!nameValue.trim();
  const step2Done = !!zhuzId && !!tribeId;
  const step3Done = filledAncestors >= 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameValue.trim()) {
      showToast(tErr('name'));
      return;
    }

    const defs = ANCESTOR_DEFS[isKk ? 'kk' : 'ru'];
    const zhuz = TRIBES_DB.find((z) => z.id === zhuzId);
    const zhuzLabel = zhuz ? (isKk ? zhuz.kk : zhuz.ru) : '';
    const ruName = currentTribe ? (isKk ? currentTribe.kk : currentTribe.ru) : '';

    onSubmit({
      name: nameValue.trim(),
      birthYear,
      zhuz: zhuzId,
      zhuzLabel,
      ru: ruName,
      ancestors: defs.map((def, i) => ({
        kaz: def.kaz,
        label: def.label,
        name: ancestorValues[i] || '',
      })),
    });
  };

  const selectedZhuz = TRIBES_DB.find((z) => z.id === zhuzId);
  const tribes = selectedZhuz?.tribes || [];
  const defs = ANCESTOR_DEFS[isKk ? 'kk' : 'ru'];

  // Ancestor generation tips
  const ancTips = isKk
    ? [
        'Атаңыздың аты-жөні — ең жақын буын, сіздің тікелей тәрбиешіңіз.',
        'Бабаңыз — атаңыздың әкесі, екінші буын. Көбінесе отбасы жадында сақталады.',
        'Арғы ата — үшінші буын. Осы жерден шежіре тереңдей бастайды.',
        'Тек ата — төртінші буын. «Текті» деген сөз «тегі бар» дегенді білдіреді.',
        'Түп ата — бесінші буын. «Түп» деген «тамыр, бастау» деген мағынаны білдіреді.',
        'Негіз ата — алтыншы буын. Ата-тегіңіздің негізін құраушы.',
        'Жеті ата — ең терең буын. Жетінші атаңды білу — қазақ дәстүрінің ең қасиетті бөлігі.',
      ]
    : [
        'Ваш дед — ближайшее поколение, ваш непосредственный наставник.',
        'Прадед — второе поколение. Часто сохраняется в семейной памяти.',
        '3-е поколение — здесь начинается глубина шежіре.',
        '4-е поколение — «тек» означает «корень, происхождение».',
        '5-е поколение — «түп» означает «основа, начало».',
        '6-е поколение — основатель вашей родовой линии.',
        '7-е поколение — самый глубокий уровень. Знать семь предков — священная казахская традиция.',
      ];

  return (
    <section id="form-section" className="form-section">
      <div className="container">
        <div className="section-header">
          <div className="orn-line" />
          <h2>{t('h2')}</h2>
          <div className="orn-line" />
        </div>
        <p className="section-desc">{t('desc')}</p>

        <form className="family-form" noValidate onSubmit={handleSubmit}>
          {/* ── Step indicators ── */}
          <div className="form-steps">
            <div className={`form-step ${step1Done ? 'step-done' : ''}`}>
              <span className="step-num">{step1Done ? '\u2713' : '1'}</span>
              <span className="step-label">{t('steps.personal')}</span>
            </div>
            <div className="step-connector" />
            <div className={`form-step ${step2Done ? 'step-done' : ''}`}>
              <span className="step-num">{step2Done ? '\u2713' : '2'}</span>
              <span className="step-label">{t('steps.origin')}</span>
            </div>
            <div className="step-connector" />
            <div className={`form-step ${step3Done ? 'step-done' : ''}`}>
              <span className="step-num">{step3Done ? '\u2713' : '3'}</span>
              <span className="step-label">{t('steps.ancestors')}</span>
            </div>
          </div>

          {/* ── Progress bar ── */}
          <div className="form-progress-wrap">
            <div className="form-progress-bar">
              <div
                className="form-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="form-progress-info">
              <span className="form-progress-pct">{progress}%</span>
              <span className="form-progress-text">
                {progress === 0 && t('progress.start')}
                {progress > 0 && progress < 40 && t('progress.going')}
                {progress >= 40 && progress < 70 && t('progress.good')}
                {progress >= 70 && progress < 100 && t('progress.almost')}
                {progress === 100 && t('progress.complete')}
              </span>
            </div>
          </div>

          {/* ── Step 1: Personal ── */}
          <div className="form-block-title">
            <span className="form-block-icon">1</span>
            <h3>{t('personal.h3')}</h3>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="your-name">{t('name.label')}</label>
              <input
                type="text"
                id="your-name"
                placeholder={t('name.ph')}
                autoComplete="name"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="birth-year">{t('year.label')}</label>
              <input
                type="number"
                id="birth-year"
                placeholder={t('year.ph')}
                min={1900}
                max={2025}
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
              />
            </div>
          </div>

          {/* ── Step 2: Origin ── */}
          <div className="form-block-title" style={{ marginTop: 44 }}>
            <span className="form-block-icon">2</span>
            <h3>{t('origin.h3')}</h3>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="zhuz">{t('zhuz.label')}</label>
              <select id="zhuz" value={zhuzId} onChange={(e) => handleZhuzChange(e.target.value)}>
                <option value="">{t('zhuz.ph')}</option>
                <option value="uly">{t('zhuz.uly')}</option>
                <option value="orta">{t('zhuz.orta')}</option>
                <option value="kishi">{t('zhuz.kishi')}</option>
                <option value="other">{t('zhuz.other')}</option>
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="ru">{t('ru.label')}</label>
              <select
                id="ru"
                value={tribeId}
                disabled={!zhuzId}
                onChange={(e) => handleTribeChange(e.target.value)}
              >
                <option value="">
                  {zhuzId ? t('ru.ph_choose') : t('ru.ph_select')}
                </option>
                {tribes.map((tribe) => (
                  <option key={tribe.id} value={tribe.id}>
                    {isKk ? tribe.kk : tribe.ru}
                    {tribe.subgroup_kk ? ` (${isKk ? tribe.subgroup_kk : tribe.subgroup_ru})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <TribeCard tribe={currentTribe} locale={locale} />

          {/* ── Step 3: Ancestors ── */}
          <div className="form-block-title ancestors-title">
            <span className="form-block-icon">3</span>
            <h3>{t('anc.h3')}</h3>
            <span className="block-hint">{t('anc.hint')}</span>
          </div>

          {/* Ancestor fill counter */}
          <div className="anc-counter">
            <div className="anc-counter-bar">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className={`anc-counter-dot ${ancestorValues[i]?.trim() ? 'filled' : ''}`}
                />
              ))}
            </div>
            <span className="anc-counter-text">
              {t('anc.filled', { count: filledAncestors })}
            </span>
          </div>

          <div className="ancestors-grid" id="ancestors-grid">
            {defs.map((def, i) => (
              <div key={i} className={`anc-field ${focusedAnc === i ? 'anc-focused' : ''}`}>
                <span className="anc-label">{def.label}</span>
                <div className="anc-input-wrap">
                  <span className="anc-badge">{def.kaz}</span>
                  <input
                    type="text"
                    className="anc-input"
                    id={`anc-${i}`}
                    placeholder={def.label}
                    value={ancestorValues[i]}
                    onChange={(e) => handleAncestorChange(i, e.target.value)}
                    onFocus={() => setFocusedAnc(i)}
                    onBlur={() => setFocusedAnc(null)}
                  />
                  {ancestorValues[i]?.trim() && (
                    <span className="anc-check">{'\u2713'}</span>
                  )}
                </div>
                {/* Tip on focus */}
                {focusedAnc === i && (
                  <div className="anc-tip">
                    <span className="anc-tip-icon">{'\u2728'}</span>
                    <span>{ancTips[i]}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* How to find info */}
          <details className="anc-help">
            <summary>{t('anc.helpTitle')}</summary>
            <ul className="anc-help-list">
              <li>{t('anc.help1')}</li>
              <li>{t('anc.help2')}</li>
              <li>{t('anc.help3')}</li>
              <li>{t('anc.help4')}</li>
            </ul>
          </details>

          <button type="submit" className="btn btn-primary btn-submit">
            <span>{t('submit')}</span>
            <span className="btn-star">{'\u2726'}</span>
          </button>
        </form>
      </div>
    </section>
  );
}
