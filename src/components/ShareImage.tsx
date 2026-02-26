'use client';

import { useRef, useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from './Toast';
import { TRIBES_DB } from '@/data/tribes';
import type { TreeFormData } from '@/lib/types';

interface ShareImageProps {
  data: TreeFormData;
  locale: string;
  nodes: Array<{ kaz: string; label: string; name: string; isUser?: boolean }>;
}

export function ShareImage({ data, locale, nodes }: ShareImageProps) {
  const t = useTranslations('tree');
  const tShare = useTranslations('share');
  const showToast = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generating, setGenerating] = useState(false);

  const generate = useCallback(async (): Promise<HTMLCanvasElement | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    // Dynamic import to keep bundle small — canvas code is large
    const { generateShareImage } = await import('@/lib/canvas/share-image');

    // Find tribe for tamga/colors
    const zhuz = TRIBES_DB.find((z) => z.id === data.zhuz);
    const tribe = zhuz?.tribes.find((tr) =>
      (locale === 'kk' ? tr.kk : tr.ru) === data.ru
    ) ?? null;

    await generateShareImage(canvas, data, locale, tribe);
    return canvas;
  }, [data, locale]);

  const toBlob = (canvas: HTMLCanvasElement): Promise<Blob | null> =>
    new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const handleShare = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      showToast(tShare('generating'));
      const canvas = await generate();
      if (!canvas) return;

      const blob = await toBlob(canvas);
      if (!blob) return;

      const file = new File([blob], 'shezhire.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: 'Шежіре',
          text: locale === 'kk' ? 'Менің шежірем' : 'Моё шежіре',
          files: [file],
        });
        showToast(tShare('ready'));
      } else {
        downloadBlob(blob, 'shezhire.png');
        showToast(tShare('saved'));
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      showToast(tShare('error'));
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      showToast(tShare('generating'));
      const canvas = await generate();
      if (!canvas) return;

      const blob = await toBlob(canvas);
      if (!blob) return;
      downloadBlob(blob, 'shezhire.png');
      showToast(tShare('saved'));
    } finally {
      setGenerating(false);
    }
  };

  const scrollToForm = () => {
    document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <div className="tree-actions">
        <button
          className={`btn btn-share ${generating ? 'generating' : ''}`}
          onClick={handleShare}
        >
          {t('btn.share')}
        </button>
        <button className="btn btn-outline" onClick={handleDownload}>
          {t('btn.save')}
        </button>
        <button className="btn btn-outline" onClick={scrollToForm}>
          {t('btn.edit')}
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={1080}
        height={1350}
        style={{ display: 'none' }}
      />
    </>
  );
}
