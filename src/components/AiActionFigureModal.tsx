'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from './Toast';
import { preprocessImage, validateImageFile } from '@/lib/ai-utils';
import { useAuth } from './AuthProvider';
import { LoginModal } from './LoginModal';
import { applyWatermark } from '@/lib/watermark';
import { PricingModal } from './PricingModal';

type Step = 'upload' | 'preview' | 'generating' | 'result';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AiActionFigureModal({ open, onClose }: Props) {
  const t = useTranslations('ai.figure.modal');
  const showToast = useToast();
  const { user, loading: authLoading } = useAuth();

  const [step, setStep] = useState<Step>('upload');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef(false);

  const handleClose = useCallback(() => {
    abortRef.current = true;
    setStep('upload');
    setPreviewUrl(null);
    setImageBase64(null);
    setResultUrl(null);
    setProgress(0);
    setDragOver(false);
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

  const handleFileSelect = useCallback(
    async (file: File) => {
      const err = validateImageFile(file);
      if (err) {
        showToast(t(err));
        return;
      }
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setStep('preview');

      try {
        const base64 = await preprocessImage(file);
        setImageBase64(base64);
      } catch {
        showToast(t('error'));
        setStep('upload');
      }
    },
    [showToast, t],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect],
  );

  const onFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileSelect(file);
      e.target.value = '';
    },
    [handleFileSelect],
  );

  const handleGenerate = useCallback(async () => {
    if (!imageBase64) return;
    abortRef.current = false;
    setStep('generating');
    setProgress(0);

    try {
      const createRes = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, gender, type: 'action-figure' }),
      });

      if (!createRes.ok) {
        const data = await createRes.json().catch(() => ({}));
        if (data.error === 'limit_reached') {
          setShowPricing(true);
          setStep('preview');
          return;
        }
        const errKey = data.error === 'rate_limit' ? 'rate_limit' : 'error';
        showToast(t(errKey));
        setStep('preview');
        return;
      }

      const { id } = await createRes.json();
      let status = 'starting';
      let output: string[] | null = null;
      let elapsed = 0;

      while (!abortRef.current && status !== 'succeeded' && status !== 'failed' && status !== 'canceled') {
        await new Promise((r) => setTimeout(r, 1500));
        elapsed += 1500;
        setProgress(Math.min(90, Math.round((elapsed / 10_000) * 100)));

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
        setStep('preview');
      }
    } catch {
      if (!abortRef.current) {
        showToast(t('error'));
        setStep('preview');
      }
    }
  }, [imageBase64, gender, showToast, t]);

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
      const file = new File([blob], 'shezhire-action-figure.jpg', { type: 'image/jpeg' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Шежіре — AI фото' });
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'shezhire-action-figure.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      if (/iPhone|iPad/i.test(navigator.userAgent)) {
        showToast('Зажмите фото и выберите «Сохранить изображение»');
      }
    } catch (e) {
      if ((e as DOMException)?.name !== 'AbortError') showToast(t('error'));
    }
  }, [resultUrl, getWatermarkedBlob, showToast, t]);

  const handleShare = useCallback(async () => {
    if (!resultUrl) return;
    try {
      const blob = await getWatermarkedBlob();
      if (blob && navigator.share) {
        const file = new File([blob], 'shezhire-action-figure.jpg', { type: 'image/jpeg' });
        await navigator.share({ files: [file], title: 'Шежіре — AI фото', url: 'https://skezire.kz' });
      }
    } catch {
      /* user cancelled or share not supported */
    }
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
      <div className="modal-card ai-past-card">
        <button className="modal-close" onClick={handleClose} aria-label="Close">
          ✕
        </button>

        {step === 'upload' && (
          <div className="ai-past-step">
            <div className="modal-icon">🎯</div>
            <h2 className="modal-title">{t('title')}</h2>
            <p className="modal-text">{t('desc')}</p>

            <div
              className={`ai-past-dropzone${dragOver ? ' dragover' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
            >
              <span className="ai-past-drop-icon">📷</span>
              <span className="ai-past-drop-text">{t('drop')}</span>
              <span className="ai-past-drop-hint">{t('formats')}</span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={onFileInput}
            />
          </div>
        )}

        {step === 'preview' && previewUrl && (
          <div className="ai-past-step">
            <h2 className="modal-title">{t('preview_title')}</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="" className="ai-past-img" />

            <div className="ai-past-gender">
              <button
                className={`ai-past-gender-btn${gender === 'male' ? ' active' : ''}`}
                onClick={() => setGender('male')}
              >
                {t('male')}
              </button>
              <button
                className={`ai-past-gender-btn${gender === 'female' ? ' active' : ''}`}
                onClick={() => setGender('female')}
              >
                {t('female')}
              </button>
            </div>

            <button
              className="btn btn-ai ai-past-generate"
              onClick={handleGenerate}
              disabled={!imageBase64}
            >
              {t('generate')}
            </button>
            <button
              className="ai-past-back"
              onClick={() => { setStep('upload'); setPreviewUrl(null); setImageBase64(null); }}
            >
              {t('change_photo')}
            </button>
          </div>
        )}

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

        {step === 'result' && resultUrl && (
          <div className="ai-past-step">
            <h2 className="modal-title">{t('result_title')}</h2>
            <div className="ai-past-compare">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl!} alt="" className="ai-past-img-small" />
              <span className="ai-past-arrow">{'\u2192'}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resultUrl} alt="" className="ai-past-img-result" />
            </div>
            <div className="ai-past-actions">
              {typeof navigator !== 'undefined' && !!navigator.share && (
                <button className="btn btn-ai" onClick={handleShare}>
                  {t('share')}
                </button>
              )}
              <button className="btn btn-ai" onClick={handleDownload}>
                {t('download')}
              </button>
              <button
                className="btn btn-ai-outline"
                onClick={() => { setStep('upload'); setPreviewUrl(null); setResultUrl(null); setImageBase64(null); }}
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
