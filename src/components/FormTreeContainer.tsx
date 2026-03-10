'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { FormSection } from './FormSection';
import { TreeSection } from './TreeSection';
import { LoginModal } from './LoginModal';
import { useAuth } from './AuthProvider';
import { useToast } from './Toast';
import type { TreeFormData } from '@/lib/types';
import { treeFormSubmit } from '@/lib/analytics';

export function FormTreeContainer({ locale }: { locale: string }) {
  const { user, loading: authLoading } = useAuth();
  const showToast = useToast();

  const [formData, setFormData] = useState<TreeFormData | null>(null);
  const [pendingData, setPendingData] = useState<TreeFormData | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  // AI photo generation state
  const [aiPhotoUrl, setAiPhotoUrl] = useState<string | null>(null);
  const [aiPhotoLoading, setAiPhotoLoading] = useState(false);
  const abortRef = useRef(false);

  const generateAiPhoto = useCallback(async (data: TreeFormData) => {
    setAiPhotoLoading(true);
    setAiPhotoUrl(null);
    abortRef.current = false;

    try {
      const createRes = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: data.photoBase64,
          gender: data.gender,
        }),
      });

      if (!createRes.ok) {
        const errData = await createRes.json().catch(() => ({}));
        showToast(errData.error === 'rate_limit'
          ? (locale === 'kk' ? 'Тым көп сұраныс — 1 сағаттан кейін қайталаңыз' : 'Слишком много запросов — повторите через 1 час')
          : (locale === 'kk' ? 'Қате орын алды' : 'Произошла ошибка'));
        setAiPhotoLoading(false);
        return;
      }

      const { id } = await createRes.json();
      let status = 'starting';
      let output: string[] | null = null;

      while (!abortRef.current && status !== 'succeeded' && status !== 'failed' && status !== 'canceled') {
        await new Promise((r) => setTimeout(r, 1500));
        const pollRes = await fetch(`/api/ai/generate/${id}`);
        if (!pollRes.ok) break;
        const pollData = await pollRes.json();
        status = pollData.status;
        output = pollData.output;
      }

      if (abortRef.current) return;

      if (status === 'succeeded' && output?.[0]) {
        setAiPhotoUrl(output[0]);
      } else {
        showToast(locale === 'kk' ? 'AI фото жасау сәтсіз' : 'Не удалось создать AI фото');
      }
    } catch {
      if (!abortRef.current) {
        showToast(locale === 'kk' ? 'Қате орын алды' : 'Произошла ошибка');
      }
    } finally {
      setAiPhotoLoading(false);
    }
  }, [locale, showToast]);

  const proceedWithGeneration = useCallback((data: TreeFormData) => {
    setFormData(data);
    generateAiPhoto(data);
  }, [generateAiPhoto]);

  // After successful login, continue with pending data
  useEffect(() => {
    if (user && pendingData) {
      proceedWithGeneration(pendingData);
      setPendingData(null);
      setShowLogin(false);
    }
  }, [user, pendingData, proceedWithGeneration]);

  const handleSubmit = useCallback((data: TreeFormData) => {
    treeFormSubmit();
    if (!user && !authLoading) {
      setPendingData(data);
      setShowLogin(true);
      return;
    }
    proceedWithGeneration(data);
  }, [user, authLoading, proceedWithGeneration]);

  return (
    <>
      <FormSection locale={locale} onSubmit={handleSubmit} />
      {formData && (
        <TreeSection
          data={formData}
          locale={locale}
          aiPhotoUrl={aiPhotoUrl}
          aiPhotoLoading={aiPhotoLoading}
        />
      )}
      {showLogin && (
        <LoginModal
          open={true}
          onClose={() => { setShowLogin(false); setPendingData(null); }}
        />
      )}
    </>
  );
}
