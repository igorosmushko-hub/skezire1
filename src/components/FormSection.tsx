'use client';

import { useState, useEffect, useCallback } from 'react';
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
          <div className="form-block-title">
            <span>👤</span>
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

          <div className="form-block-title ancestors-title">
            <span>🏛️</span>
            <h3>{t('anc.h3')}</h3>
            <span className="block-hint">{t('anc.hint')}</span>
          </div>

          <div className="ancestors-grid" id="ancestors-grid">
            {defs.map((def, i) => (
              <div key={i} className="anc-field">
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
                  />
                </div>
              </div>
            ))}
          </div>

          <button type="submit" className="btn btn-primary btn-submit">
            <span>{t('submit')}</span>
            <span className="btn-star">✦</span>
          </button>
        </form>
      </div>
    </section>
  );
}
