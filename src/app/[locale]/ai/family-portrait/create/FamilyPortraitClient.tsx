'use client';

import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { LoginModal } from '@/components/LoginModal';
import { PricingModal } from '@/components/PricingModal';
import { preprocessImage, validateImageFile } from '@/lib/ai-utils';
import { applyWatermark } from '@/lib/watermark';
import { PORTRAIT_BACKGROUNDS } from '@/data/portrait-backgrounds';

type Step = 'upload' | 'background' | 'generating' | 'result';

interface FamilyRole {
  key: string;
  kk: string;
  ru: string;
  icon: string;
}

const ROLES: FamilyRole[] = [
  { key: 'grandfather', kk: 'Ата', ru: 'Дедушка', icon: '\uD83D\uDC74' },
  { key: 'grandmother', kk: '\u04D8\u0436\u0435', ru: 'Бабушка', icon: '\uD83D\uDC75' },
  { key: 'father', kk: '\u04D8\u043A\u0435', ru: 'Отец', icon: '\uD83D\uDC68' },
  { key: 'mother', kk: '\u0410\u043D\u0430', ru: 'Мать', icon: '\uD83D\uDC69' },
  { key: 'son', kk: '\u04B0\u043B', ru: 'Сын', icon: '\uD83D\uDC66' },
  { key: 'daughter', kk: '\u049A\u044B\u0437', ru: 'Дочь', icon: '\uD83D\uDC67' },
];

interface PhotoSlot {
  roleKey: string;
  file: File | null;
  previewUrl: string | null;
  base64: string | null;
  processing: boolean;
}

export function FamilyPortraitClient({ locale }: { locale: string }) {
  const isKk = locale === 'kk';
  const { user, loading: authLoading } = useAuth();

  const [step, setStep] = useState<Step>('upload');
  const [slots, setSlots] = useState<PhotoSlot[]>(
    ROLES.map((r) => ({ roleKey: r.key, file: null, previewUrl: null, base64: null, processing: false })),
  );
  const [extraSlots, setExtraSlots] = useState<PhotoSlot[]>([]);
  const [selectedBg, setSelectedBg] = useState('yurt');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  const abortRef = useRef(false);

  const t = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      pageTitle: { kk: '\u041E\u0442\u0431\u0430\u0441\u044B\u043B\u044B\u049B \u043F\u043E\u0440\u0442\u0440\u0435\u0442 \u0436\u0430\u0441\u0430\u0443', ru: '\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0441\u0435\u043C\u0435\u0439\u043D\u044B\u0439 \u043F\u043E\u0440\u0442\u0440\u0435\u0442' },
      pageDesc: { kk: '\u04D8\u0440 \u043E\u0442\u0431\u0430\u0441\u044B \u043C\u04AF\u0448\u0435\u0441\u0456\u043D\u0456\u04A3 \u0444\u043E\u0442\u043E\u0441\u044B\u043D \u0436\u04AF\u043A\u0442\u0435\u04A3\u0456\u0437, \u0444\u043E\u043D \u0442\u0430\u04A3\u0434\u0430\u04A3\u044B\u0437 \u2014 AI \u0431\u0430\u0440\u043B\u044B\u0493\u044B\u043D \u0431\u0456\u0440 \u043F\u043E\u0440\u0442\u0440\u0435\u0442\u043A\u0435 \u0436\u0438\u043D\u0430\u0439\u0434\u044B', ru: '\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u0444\u043E\u0442\u043E \u043A\u0430\u0436\u0434\u043E\u0433\u043E \u0447\u043B\u0435\u043D\u0430 \u0441\u0435\u043C\u044C\u0438, \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0444\u043E\u043D \u2014 AI \u0441\u043E\u0431\u0435\u0440\u0451\u0442 \u0432\u0441\u0435\u0445 \u0432 \u043E\u0434\u0438\u043D \u043F\u043E\u0440\u0442\u0440\u0435\u0442' },
      step1: { kk: '1. \u0424\u043E\u0442\u043E \u0436\u04AF\u043A\u0442\u0435\u04A3\u0456\u0437', ru: '1. \u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u0444\u043E\u0442\u043E' },
      step2: { kk: '2. \u0424\u043E\u043D \u0442\u0430\u04A3\u0434\u0430\u04A3\u044B\u0437', ru: '2. \u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0444\u043E\u043D' },
      addMore: { kk: '+ \u0411\u0430\u0441\u049B\u0430 \u0430\u0434\u0430\u043C \u049B\u043E\u0441\u0443', ru: '+ \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0435\u0449\u0451' },
      uploadHint: { kk: '\u0424\u043E\u0442\u043E \u0436\u04AF\u043A\u0442\u0435\u04A3\u0456\u0437', ru: '\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0444\u043E\u0442\u043E' },
      change: { kk: '\u0410\u0443\u044B\u0441\u0442\u044B\u0440\u0443', ru: '\u0417\u0430\u043C\u0435\u043D\u0438\u0442\u044C' },
      generate: { kk: '\u041F\u043E\u0440\u0442\u0440\u0435\u0442 \u0436\u0430\u0441\u0430\u0443', ru: '\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u043F\u043E\u0440\u0442\u0440\u0435\u0442' },
      generating: { kk: '\u041F\u043E\u0440\u0442\u0440\u0435\u0442 \u0436\u0430\u0441\u0430\u043B\u0443\u0434\u0430...', ru: '\u0421\u043E\u0437\u0434\u0430\u0451\u043C \u043F\u043E\u0440\u0442\u0440\u0435\u0442...' },
      wait: { kk: '\u0411\u04B1\u043B 20-30 \u0441\u0435\u043A\u0443\u043D\u0434 \u0430\u043B\u0443\u044B \u043C\u04AF\u043C\u043A\u0456\u043D', ru: '\u042D\u0442\u043E \u043C\u043E\u0436\u0435\u0442 \u0437\u0430\u043D\u044F\u0442\u044C 20-30 \u0441\u0435\u043A\u0443\u043D\u0434' },
      resultTitle: { kk: '\u041F\u043E\u0440\u0442\u0440\u0435\u0442 \u0434\u0430\u0439\u044B\u043D!', ru: '\u041F\u043E\u0440\u0442\u0440\u0435\u0442 \u0433\u043E\u0442\u043E\u0432!' },
      download: { kk: '\u0416\u04AF\u043A\u0442\u0435\u0443', ru: '\u0421\u043A\u0430\u0447\u0430\u0442\u044C' },
      share: { kk: '\u0411\u04E9\u043B\u0456\u0441\u0443', ru: '\u041F\u043E\u0434\u0435\u043B\u0438\u0442\u044C\u0441\u044F' },
      orderCanvas: { kk: '\u041A\u0430\u0440\u0442\u0438\u043D\u0430 \u0442\u0430\u043F\u0441\u044B\u0440\u044B\u0441 \u0431\u0435\u0440\u0443', ru: '\u0417\u0430\u043A\u0430\u0437\u0430\u0442\u044C \u043A\u0430\u0440\u0442\u0438\u043D\u0443' },
      tryAgain: { kk: '\u049A\u0430\u0439\u0442\u0430 \u0436\u0430\u0441\u0430\u0443', ru: '\u041F\u043E\u043F\u0440\u043E\u0431\u043E\u0432\u0430\u0442\u044C \u0435\u0449\u0451' },
      error: { kk: '\u049A\u0430\u0442\u0435 \u043E\u0440\u044B\u043D \u0430\u043B\u0434\u044B', ru: '\u041F\u0440\u043E\u0438\u0437\u043E\u0448\u043B\u0430 \u043E\u0448\u0438\u0431\u043A\u0430' },
      minPhotos: { kk: '\u041A\u0435\u043C\u0456\u043D\u0434\u0435 2 \u0444\u043E\u0442\u043E \u0436\u04AF\u043A\u0442\u0435\u04A3\u0456\u0437', ru: '\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u043C\u0438\u043D\u0438\u043C\u0443\u043C 2 \u0444\u043E\u0442\u043E' },
      formats: { kk: 'JPG, PNG, WEBP \u00B7 5 MB \u0434\u0435\u0439\u0456\u043D', ru: 'JPG, PNG, WEBP \u00B7 \u0434\u043E 5 MB' },
      extraPerson: { kk: '\u049A\u043E\u0441\u044B\u043C\u0448\u0430', ru: '\u0414\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439' },
    };
    return texts[key]?.[isKk ? 'kk' : 'ru'] ?? key;
  };

  const allSlots = [...slots, ...extraSlots];
  const filledSlots = allSlots.filter((s) => s.base64);
  const filledCount = filledSlots.length;
  const canGenerate = filledCount >= 2 && allSlots.every((s) => !s.processing);

  const handleFileForSlot = useCallback(async (slotKey: string, file: File) => {
    const err = validateImageFile(file);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    const previewUrl = URL.createObjectURL(file);

    const updateSlot = (prev: PhotoSlot[]) =>
      prev.map((s) => (s.roleKey === slotKey ? { ...s, file, previewUrl, base64: null, processing: true } : s));
    setSlots((prev) => updateSlot(prev));
    setExtraSlots((prev) => updateSlot(prev));

    try {
      const base64 = await preprocessImage(file);
      const finalize = (prev: PhotoSlot[]) =>
        prev.map((s) => (s.roleKey === slotKey ? { ...s, base64, processing: false } : s));
      setSlots((prev) => finalize(prev));
      setExtraSlots((prev) => finalize(prev));
    } catch {
      const revert = (prev: PhotoSlot[]) =>
        prev.map((s) => (s.roleKey === slotKey ? { ...s, file: null, previewUrl: null, base64: null, processing: false } : s));
      setSlots((prev) => revert(prev));
      setExtraSlots((prev) => revert(prev));
      setError(t('error'));
    }
  }, []);

  const onFileChange = useCallback((slotKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileForSlot(slotKey, file);
    e.target.value = '';
  }, [handleFileForSlot]);

  const removeSlot = useCallback((slotKey: string) => {
    // For default roles, just clear the photo
    setSlots((prev) => prev.map((s) =>
      s.roleKey === slotKey ? { ...s, file: null, previewUrl: null, base64: null, processing: false } : s,
    ));
    // For extra slots, remove entirely
    setExtraSlots((prev) => prev.filter((s) => s.roleKey !== slotKey));
  }, []);

  const addExtraPerson = useCallback(() => {
    const id = `extra-${Date.now()}`;
    setExtraSlots((prev) => [...prev, { roleKey: id, file: null, previewUrl: null, base64: null, processing: false }]);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    if (!canGenerate) return;

    abortRef.current = false;
    setStep('generating');
    setProgress(0);
    setError('');

    const images = filledSlots.map((s) => s.base64!);

    try {
      const createRes = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images, type: 'family-portrait', background: selectedBg }),
      });

      if (!createRes.ok) {
        const data = await createRes.json().catch(() => ({}));
        if (data.error === 'limit_reached') {
          setShowPricing(true);
          setStep('upload');
          return;
        }
        setError(t('error'));
        setStep('upload');
        return;
      }

      const { id } = await createRes.json();
      let taskStatus = 'starting';
      let output: string[] | null = null;
      let elapsed = 0;

      while (!abortRef.current && taskStatus !== 'succeeded' && taskStatus !== 'failed' && taskStatus !== 'canceled') {
        await new Promise((r) => setTimeout(r, 1500));
        elapsed += 1500;
        setProgress(Math.min(90, Math.round((elapsed / 25_000) * 100)));

        const pollRes = await fetch(`/api/ai/generate/${id}`);
        if (!pollRes.ok) break;
        const data = await pollRes.json();
        taskStatus = data.status;
        output = data.output;
      }

      if (abortRef.current) return;

      if (taskStatus === 'succeeded' && output?.[0]) {
        setResultUrl(output[0]);
        setProgress(100);
        setStep('result');
      } else {
        setError(t('error'));
        setStep('upload');
      }
    } catch {
      if (!abortRef.current) {
        setError(t('error'));
        setStep('upload');
      }
    }
  }, [user, canGenerate, filledSlots, selectedBg]);

  const handleDownload = useCallback(async () => {
    if (!resultUrl) return;
    try {
      const proxyUrl = `/api/ai/download?url=${encodeURIComponent(resultUrl)}`;
      const blob = await applyWatermark(proxyUrl) ?? (await (await fetch(proxyUrl)).blob());
      const file = new File([blob], 'shezhire-family-portrait.jpg', { type: 'image/jpeg' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: '\u0428\u0435\u0436\u0456\u0440\u0435 \u2014 AI \u0444\u043E\u0442\u043E' });
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'shezhire-family-portrait.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (e) {
      if ((e as DOMException)?.name !== 'AbortError') setError(t('error'));
    }
  }, [resultUrl]);

  const handleShare = useCallback(async () => {
    if (!resultUrl) return;
    try {
      const proxyUrl = `/api/ai/download?url=${encodeURIComponent(resultUrl)}`;
      const blob = await applyWatermark(proxyUrl);
      if (blob && navigator.share) {
        const file = new File([blob], 'shezhire-family-portrait.jpg', { type: 'image/jpeg' });
        await navigator.share({ files: [file], title: '\u0428\u0435\u0436\u0456\u0440\u0435', url: 'https://skezire.kz' });
      }
    } catch { /* cancelled */ }
  }, [resultUrl]);

  if (!authLoading && !user && step !== 'upload') {
    return <LoginModal open={true} onClose={() => setShowLogin(false)} />;
  }

  // Generating step
  if (step === 'generating') {
    return (
      <main className="fp-page">
        <div className="container">
          <div className="fp-generating">
            <div className="fp-spinner" />
            <h2>{t('generating')}</h2>
            <p>{t('wait')}</p>
            <div className="fp-progress-bar">
              <div className="fp-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Result step
  if (step === 'result' && resultUrl) {
    return (
      <main className="fp-page">
        <div className="container">
          <div className="fp-result">
            <h2>{t('resultTitle')}</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resultUrl} alt="Family Portrait" className="fp-result-img" />
            <div className="fp-result-actions">
              {typeof navigator !== 'undefined' && !!navigator.share && (
                <button className="btn btn-ai" onClick={handleShare}>{t('share')}</button>
              )}
              <button className="btn btn-ai" onClick={handleDownload}>{t('download')}</button>
              <a
                className="btn btn-ai-outline fp-order-btn"
                href={`/${locale}/order/canvas?image=${encodeURIComponent(resultUrl)}&type=family-portrait`}
              >
                {t('orderCanvas')}
              </a>
              <button
                className="btn btn-ai-outline"
                onClick={() => {
                  setStep('upload');
                  setResultUrl(null);
                  setProgress(0);
                }}
              >
                {t('tryAgain')}
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Upload + background selection (main step)
  return (
    <>
      {showLogin && <LoginModal open={true} onClose={() => setShowLogin(false)} />}
      <PricingModal open={showPricing} onClose={() => setShowPricing(false)} />

      <main className="fp-page">
        <div className="container">
          <div className="fp-header">
            <h1>{t('pageTitle')}</h1>
            <p>{t('pageDesc')}</p>
          </div>

          {/* Step 1: Photo upload */}
          <section className="fp-section">
            <h2 className="fp-section-title">{t('step1')}</h2>
            <div className="fp-roles-grid">
              {slots.map((slot) => {
                const role = ROLES.find((r) => r.key === slot.roleKey)!;
                const inputId = `fp-input-${slot.roleKey}`;
                return (
                  <div key={slot.roleKey} className="fp-role-card">
                    <input
                      id={inputId}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      hidden
                      onChange={(e) => onFileChange(slot.roleKey, e)}
                    />
                    <label
                      htmlFor={inputId}
                      className={`fp-role-photo${slot.previewUrl ? ' has-photo' : ''}`}
                    >
                      {slot.previewUrl ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={slot.previewUrl} alt="" />
                          {slot.processing && <div className="fp-role-loading" />}
                        </>
                      ) : (
                        <span className="fp-role-icon">{role.icon}</span>
                      )}
                    </label>
                    {slot.previewUrl && (
                      <button
                        className="fp-role-remove"
                        onClick={() => removeSlot(slot.roleKey)}
                      >&#x2715;</button>
                    )}
                    <span className="fp-role-label">{isKk ? role.kk : role.ru}</span>
                    <label htmlFor={inputId} className="fp-role-upload-btn">
                      {slot.previewUrl ? t('change') : t('uploadHint')}
                    </label>
                  </div>
                );
              })}

              {/* Extra slots */}
              {extraSlots.map((slot, i) => {
                const inputId = `fp-input-${slot.roleKey}`;
                return (
                  <div key={slot.roleKey} className="fp-role-card">
                    <input
                      id={inputId}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      hidden
                      onChange={(e) => onFileChange(slot.roleKey, e)}
                    />
                    <label
                      htmlFor={inputId}
                      className={`fp-role-photo${slot.previewUrl ? ' has-photo' : ''}`}
                    >
                      {slot.previewUrl ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={slot.previewUrl} alt="" />
                          {slot.processing && <div className="fp-role-loading" />}
                        </>
                      ) : (
                        <span className="fp-role-icon">{'\uD83D\uDC64'}</span>
                      )}
                    </label>
                    {slot.previewUrl && (
                      <button
                        className="fp-role-remove"
                        onClick={() => removeSlot(slot.roleKey)}
                      >&#x2715;</button>
                    )}
                    <span className="fp-role-label">{t('extraPerson')} {i + 1}</span>
                    <label htmlFor={inputId} className="fp-role-upload-btn">
                      {slot.previewUrl ? t('change') : t('uploadHint')}
                    </label>
                  </div>
                );
              })}

              {/* Add more button */}
              <div className="fp-role-card fp-add-card">
                <button className="fp-role-photo fp-add-btn" onClick={addExtraPerson}>
                  <span>+</span>
                </button>
                <span className="fp-role-label">{t('addMore')}</span>
              </div>
            </div>

            <p className="fp-hint">
              {filledCount < 2 ? t('minPhotos') : `${filledCount} ${isKk ? '\u0444\u043E\u0442\u043E \u0436\u04AF\u043A\u0442\u0435\u043B\u0434\u0456' : '\u0444\u043E\u0442\u043E \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u043E'}`}
              {' \u00B7 '}{t('formats')}
            </p>
          </section>

          {/* Step 2: Background selection */}
          <section className="fp-section">
            <h2 className="fp-section-title">{t('step2')}</h2>
            <div className="fp-bg-grid">
              {PORTRAIT_BACKGROUNDS.map((bg) => (
                <button
                  key={bg.key}
                  className={`fp-bg-card${selectedBg === bg.key ? ' active' : ''}`}
                  onClick={() => setSelectedBg(bg.key)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/ai-backgrounds/${bg.key}.jpg`} alt="" className="fp-bg-preview" />
                  <span className="fp-bg-label">
                    <span className="fp-bg-icon">{bg.icon}</span>
                    {bg.name[isKk ? 'kk' : 'ru']}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {error && <p className="fp-error">{error}</p>}

          <button
            className="btn btn-ai fp-generate-btn"
            onClick={handleGenerate}
            disabled={!canGenerate}
          >
            {t('generate')}
          </button>
        </div>
      </main>
    </>
  );
}
