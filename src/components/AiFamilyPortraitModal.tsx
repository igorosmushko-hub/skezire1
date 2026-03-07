'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { useToast } from './Toast';
import { preprocessImage, validateImageFile } from '@/lib/ai-utils';
import { useAuth } from './AuthProvider';
import { LoginModal } from './LoginModal';
import { applyWatermark } from '@/lib/watermark';
import { PricingModal } from './PricingModal';
import { PORTRAIT_BACKGROUNDS, type PortraitBackground } from '@/data/portrait-backgrounds';

type Step = 'upload_photos' | 'select_background' | 'generating' | 'result';

interface PhotoItem {
  id: string;
  file: File;
  previewUrl: string;
  base64: string | null;
  processing: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AiFamilyPortraitModal({ open, onClose }: Props) {
  const locale = useLocale();
  const isKk = locale === 'kk';
  const showToast = useToast();
  const { user, loading: authLoading } = useAuth();

  const [step, setStep] = useState<Step>('upload_photos');
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [selectedBg, setSelectedBg] = useState<string>('yurt');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showPricing, setShowPricing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef(false);

  const t = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      title: { kk: '\u041E\u0442\u0431\u0430\u0441\u044B\u043B\u044B\u049B \u043F\u043E\u0440\u0442\u0440\u0435\u0442', ru: '\u0421\u0435\u043C\u0435\u0439\u043D\u044B\u0439 \u043F\u043E\u0440\u0442\u0440\u0435\u0442' },
      desc: { kk: '\u04D8\u0440 \u0430\u0434\u0430\u043C\u043D\u044B\u04A3 \u0444\u043E\u0442\u043E\u0441\u044B\u043D \u0436\u04AF\u043A\u0442\u0435\u04A3\u0456\u0437, \u0444\u043E\u043D \u0442\u0430\u04A3\u0434\u0430\u04A3\u044B\u0437 \u2014 AI \u0431\u0456\u0440 \u043F\u043E\u0440\u0442\u0440\u0435\u0442\u043A\u0435 \u0436\u0438\u043D\u0430\u0439\u0434\u044B', ru: '\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u0444\u043E\u0442\u043E \u043A\u0430\u0436\u0434\u043E\u0433\u043E \u0447\u0435\u043B\u043E\u0432\u0435\u043A\u0430, \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0444\u043E\u043D \u2014 AI \u0441\u043E\u0431\u0435\u0440\u0451\u0442 \u0432 \u043E\u0434\u0438\u043D \u043F\u043E\u0440\u0442\u0440\u0435\u0442' },
      add_photos: { kk: '\u0424\u043E\u0442\u043E \u049B\u043E\u0441\u0443', ru: '\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0444\u043E\u0442\u043E' },
      min_hint: { kk: '\u041A\u0435\u043C\u0456\u043D\u0434\u0435 2 \u0444\u043E\u0442\u043E \u0436\u04AF\u043A\u0442\u0435\u04A3\u0456\u0437', ru: '\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u043C\u0438\u043D\u0438\u043C\u0443\u043C 2 \u0444\u043E\u0442\u043E' },
      warn_many: { kk: '6-\u0434\u0430\u043D \u0430\u0441\u0442\u0430\u043C \u0430\u0434\u0430\u043C\u0434\u0430 \u0441\u0430\u043F\u0430 \u0442\u04E9\u043C\u0435\u043D\u0434\u0435\u0443\u0456 \u043C\u04AF\u043C\u043A\u0456\u043D', ru: '\u041F\u0440\u0438 >6 \u043B\u044E\u0434\u044F\u0445 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u043E \u043C\u043E\u0436\u0435\u0442 \u0441\u043D\u0438\u0437\u0438\u0442\u044C\u0441\u044F' },
      next: { kk: '\u0424\u043E\u043D \u0442\u0430\u04A3\u0434\u0430\u0443', ru: '\u0412\u044B\u0431\u0440\u0430\u0442\u044C \u0444\u043E\u043D' },
      bg_title: { kk: '\u0424\u043E\u043D \u0442\u0430\u04A3\u0434\u0430\u04A3\u044B\u0437', ru: '\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0444\u043E\u043D' },
      generate: { kk: '\u041F\u043E\u0440\u0442\u0440\u0435\u0442 \u0436\u0430\u0441\u0430\u0443', ru: '\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u043F\u043E\u0440\u0442\u0440\u0435\u0442' },
      back: { kk: '\u0410\u0440\u0442\u049B\u0430', ru: '\u041D\u0430\u0437\u0430\u0434' },
      generating: { kk: '\u041F\u043E\u0440\u0442\u0440\u0435\u0442 \u0436\u0430\u0441\u0430\u043B\u0443\u0434\u0430...', ru: '\u0421\u043E\u0437\u0434\u0430\u0451\u043C \u043F\u043E\u0440\u0442\u0440\u0435\u0442...' },
      wait: { kk: '\u0411\u04B1\u043B 20-30 \u0441\u0435\u043A\u0443\u043D\u0434 \u0430\u043B\u0443\u044B \u043C\u04AF\u043C\u043A\u0456\u043D', ru: '\u042D\u0442\u043E \u043C\u043E\u0436\u0435\u0442 \u0437\u0430\u043D\u044F\u0442\u044C 20-30 \u0441\u0435\u043A\u0443\u043D\u0434' },
      result_title: { kk: '\u041F\u043E\u0440\u0442\u0440\u0435\u0442 \u0434\u0430\u0439\u044B\u043D!', ru: '\u041F\u043E\u0440\u0442\u0440\u0435\u0442 \u0433\u043E\u0442\u043E\u0432!' },
      share: { kk: '\u0411\u04E9\u043B\u0456\u0441\u0443', ru: '\u041F\u043E\u0434\u0435\u043B\u0438\u0442\u044C\u0441\u044F' },
      download: { kk: '\u0416\u04AF\u043A\u0442\u0435\u0443', ru: '\u0421\u043A\u0430\u0447\u0430\u0442\u044C' },
      try_again: { kk: '\u049A\u0430\u0439\u0442\u0430 \u0436\u0430\u0441\u0430\u0443', ru: '\u041F\u043E\u043F\u0440\u043E\u0431\u043E\u0432\u0430\u0442\u044C \u0435\u0449\u0451' },
      error: { kk: '\u049A\u0430\u0442\u0435 \u043E\u0440\u044B\u043D \u0430\u043B\u0434\u044B', ru: '\u041F\u0440\u043E\u0438\u0437\u043E\u0448\u043B\u0430 \u043E\u0448\u0438\u0431\u043A\u0430' },
      formats: { kk: 'JPG, PNG, WEBP \u00B7 5 MB \u0434\u0435\u0439\u0456\u043D', ru: 'JPG, PNG, WEBP \u00B7 \u0434\u043E 5 MB' },
    };
    return texts[key]?.[isKk ? 'kk' : 'ru'] ?? key;
  };

  const handleClose = useCallback(() => {
    abortRef.current = true;
    setStep('upload_photos');
    setPhotos([]);
    setSelectedBg('yurt');
    setResultUrl(null);
    setProgress(0);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, handleClose]);

  const addPhotos = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    for (const file of fileArray) {
      const err = validateImageFile(file);
      if (err) {
        showToast(`${file.name}: ${err}`);
        continue;
      }
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const previewUrl = URL.createObjectURL(file);
      const item: PhotoItem = { id, file, previewUrl, base64: null, processing: true };
      setPhotos((prev) => [...prev, item]);

      preprocessImage(file).then((base64) => {
        setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, base64, processing: false } : p)));
      }).catch(() => {
        setPhotos((prev) => prev.filter((p) => p.id !== id));
        showToast(t('error'));
      });
    }
  }, [showToast]);

  const removePhoto = useCallback((id: string) => {
    setPhotos((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const onFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addPhotos(e.target.files);
    e.target.value = '';
  }, [addPhotos]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) addPhotos(e.dataTransfer.files);
  }, [addPhotos]);

  const allReady = photos.length >= 2 && photos.every((p) => p.base64 && !p.processing);

  const handleGenerate = useCallback(async () => {
    if (!allReady) return;
    abortRef.current = false;
    setStep('generating');
    setProgress(0);

    const images = photos.map((p) => p.base64!);

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
          setStep('select_background');
          return;
        }
        showToast(t('error'));
        setStep('select_background');
        return;
      }

      const { id } = await createRes.json();
      let status = 'starting';
      let output: string[] | null = null;
      let elapsed = 0;

      while (!abortRef.current && status !== 'succeeded' && status !== 'failed' && status !== 'canceled') {
        await new Promise((r) => setTimeout(r, 1500));
        elapsed += 1500;
        setProgress(Math.min(90, Math.round((elapsed / 25_000) * 100)));

        const pollRes = await fetch(`/api/ai/generate/${id}`);
        if (!pollRes.ok) break;
        const data = await pollRes.json();
        status = data.status;
        output = data.output;
      }

      if (abortRef.current) return;

      if (status === 'succeeded' && output?.[0]) {
        setResultUrl(output[0]);
        setProgress(100);
        setStep('result');
      } else {
        showToast(t('error'));
        setStep('select_background');
      }
    } catch {
      if (!abortRef.current) {
        showToast(t('error'));
        setStep('select_background');
      }
    }
  }, [allReady, photos, selectedBg, showToast]);

  const getWatermarkedBlob = useCallback(async (): Promise<Blob | null> => {
    if (!resultUrl) return null;
    try {
      const proxyUrl = `/api/ai/download?url=${encodeURIComponent(resultUrl)}`;
      return await applyWatermark(proxyUrl);
    } catch {
      return null;
    }
  }, [resultUrl]);

  const handleDownload = useCallback(async () => {
    if (!resultUrl) return;
    try {
      const blob = await getWatermarkedBlob() ?? (await (await fetch(`/api/ai/download?url=${encodeURIComponent(resultUrl)}`)).blob());
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
      if ((e as DOMException)?.name !== 'AbortError') showToast(t('error'));
    }
  }, [resultUrl, getWatermarkedBlob, showToast]);

  const handleShare = useCallback(async () => {
    if (!resultUrl) return;
    try {
      const blob = await getWatermarkedBlob();
      if (blob && navigator.share) {
        const file = new File([blob], 'shezhire-family-portrait.jpg', { type: 'image/jpeg' });
        await navigator.share({ files: [file], title: '\u0428\u0435\u0436\u0456\u0440\u0435 \u2014 AI \u0444\u043E\u0442\u043E', url: 'https://skezire.kz' });
      }
    } catch { /* cancelled */ }
  }, [resultUrl, getWatermarkedBlob]);

  if (open && !authLoading && !user) {
    return <LoginModal open={true} onClose={onClose} />;
  }

  if (!open) return null;

  return (
    <>
    <PricingModal open={showPricing} onClose={() => setShowPricing(false)} />
    <div
      className="modal open"
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="modal-card ai-past-card ai-portrait-modal">
        <button className="modal-close" onClick={handleClose} aria-label="Close">
          &#x2715;
        </button>

        {/* Step 1: Upload photos */}
        {step === 'upload_photos' && (
          <div className="ai-past-step">
            <div className="modal-icon">{'\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66'}</div>
            <h2 className="modal-title">{t('title')}</h2>
            <p className="modal-text">{t('desc')}</p>

            <div
              className="ai-portrait-grid"
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {photos.map((photo) => (
                <div key={photo.id} className="ai-portrait-thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.previewUrl} alt="" />
                  {photo.processing && <div className="ai-portrait-thumb-loading" />}
                  <button
                    className="ai-portrait-remove"
                    onClick={() => removePhoto(photo.id)}
                    aria-label="Remove"
                  >&#x2715;</button>
                </div>
              ))}
              <button
                className="ai-portrait-add"
                onClick={() => fileInputRef.current?.click()}
              >
                <span>+</span>
                <span className="ai-portrait-add-text">{t('add_photos')}</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              hidden
              onChange={onFileInput}
            />

            <p className="ai-portrait-hint">
              {photos.length < 2 ? t('min_hint') : `${photos.length} ${isKk ? '\u0444\u043E\u0442\u043E' : '\u0444\u043E\u0442\u043E'}`}
              {photos.length > 6 && <span className="ai-portrait-warn"> {t('warn_many')}</span>}
            </p>
            <p className="ai-portrait-formats">{t('formats')}</p>

            <button
              className="btn btn-ai ai-past-generate"
              onClick={() => setStep('select_background')}
              disabled={!allReady}
            >
              {t('next')}
            </button>
          </div>
        )}

        {/* Step 2: Select background */}
        {step === 'select_background' && (
          <div className="ai-past-step">
            <h2 className="modal-title">{t('bg_title')}</h2>

            <div className="ai-portrait-bg-grid">
              {PORTRAIT_BACKGROUNDS.map((bg: PortraitBackground) => (
                <button
                  key={bg.key}
                  className={`ai-portrait-bg-card${selectedBg === bg.key ? ' active' : ''}`}
                  onClick={() => setSelectedBg(bg.key)}
                >
                  <span className="ai-portrait-bg-icon">{bg.icon}</span>
                  <span className="ai-portrait-bg-name">{bg.name[isKk ? 'kk' : 'ru']}</span>
                </button>
              ))}
            </div>

            <button
              className="btn btn-ai ai-past-generate"
              onClick={handleGenerate}
            >
              {t('generate')}
            </button>
            <button
              className="ai-past-back"
              onClick={() => setStep('upload_photos')}
            >
              {t('back')}
            </button>
          </div>
        )}

        {/* Step 3: Generating */}
        {step === 'generating' && (
          <div className="ai-past-step ai-past-loading">
            <div className="ai-past-spinner" />
            <h2 className="modal-title">{t('generating')}</h2>
            <p className="modal-text">{t('wait')}</p>
            <div className="ai-past-progress-bar">
              <div className="ai-past-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Step 4: Result */}
        {step === 'result' && resultUrl && (
          <div className="ai-past-step">
            <h2 className="modal-title">{t('result_title')}</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resultUrl} alt="" className="ai-portrait-result" />
            <div className="ai-past-actions">
              {typeof navigator !== 'undefined' && !!navigator.share && (
                <button className="btn btn-ai" onClick={handleShare}>
                  {t('share')}
                </button>
              )}
              <button className="btn btn-ai" onClick={handleDownload}>
                {t('download')}
              </button>
              <a
                className="btn btn-ai-outline ai-order-btn"
                href={`/${locale}/order/canvas?image=${encodeURIComponent(resultUrl)}&type=family-portrait`}
              >
                {isKk ? '\uD83D\uDDBC Картина тапсырыс беру' : '\uD83D\uDDBC Заказать картину'}
              </a>
              <button
                className="btn btn-ai-outline"
                onClick={() => {
                  setStep('upload_photos');
                  setPhotos([]);
                  setResultUrl(null);
                  setSelectedBg('yurt');
                }}
              >
                {t('try_again')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
