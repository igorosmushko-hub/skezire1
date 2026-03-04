'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';
import { useAuth } from './AuthProvider';

type Step = 'phone' | 'code' | 'success';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function LoginModal({ open, onClose }: Props) {
  const t = useTranslations('auth');
  const { login } = useAuth();

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('+7');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const containerIdRef = useRef(0);

  /* ── Reset on close ── */
  const handleClose = useCallback(() => {
    setStep('phone');
    setPhone('+7');
    setCode('');
    setError('');
    setLoading(false);
    confirmationRef.current = null;
    onClose();
  }, [onClose]);

  /* ── ESC + scroll lock ── */
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

  /* ── Cleanup reCAPTCHA on unmount ── */
  useEffect(() => {
    return () => {
      if (recaptchaRef.current) {
        try { recaptchaRef.current.clear(); } catch { /* ignore */ }
        recaptchaRef.current = null;
      }
    };
  }, []);

  /* ── Get or create reCAPTCHA verifier ── */
  const getRecaptchaVerifier = useCallback(() => {
    // Clear old verifier
    if (recaptchaRef.current) {
      try { recaptchaRef.current.clear(); } catch { /* ignore */ }
      recaptchaRef.current = null;
    }

    if (!auth) throw new Error('Firebase auth not configured');

    // Create a fresh container to avoid "already rendered" error
    const wrapper = document.getElementById('recaptcha-wrapper');
    if (wrapper) {
      containerIdRef.current += 1;
      const newId = `recaptcha-container-${containerIdRef.current}`;
      wrapper.innerHTML = `<div id="${newId}"></div>`;

      const verifier = new RecaptchaVerifier(auth, newId, {
        size: 'invisible',
      });
      recaptchaRef.current = verifier;
      return verifier;
    }

    throw new Error('reCAPTCHA wrapper not found');
  }, []);

  /* ── Send SMS ── */
  const handleSendCode = useCallback(async () => {
    if (phone.length < 10) {
      setError(t('sendError'));
      return;
    }
    setLoading(true);
    setError('');

    try {
      const verifier = getRecaptchaVerifier();
      console.log('[Auth] Sending SMS to', phone);
      const confirmation = await signInWithPhoneNumber(auth!, phone, verifier);
      console.log('[Auth] SMS sent successfully');
      confirmationRef.current = confirmation;
      setStep('code');
    } catch (err: unknown) {
      console.error('[Auth] SMS send error:', err);

      // Show specific error messages for known Firebase errors
      const firebaseError = err as { code?: string; message?: string };
      const code = firebaseError.code || '';

      if (code === 'auth/invalid-phone-number') {
        setError(t('invalidPhone'));
      } else if (code === 'auth/too-many-requests') {
        setError(t('tooManyRequests'));
      } else if (code === 'auth/operation-not-allowed') {
        console.error('[Auth] Phone Auth is NOT enabled in Firebase Console!');
        setError(t('sendError'));
      } else if (code === 'auth/captcha-check-failed' || code === 'auth/recaptcha-not-enabled') {
        console.error('[Auth] reCAPTCHA issue:', code);
        setError(t('sendError'));
      } else {
        setError(t('sendError'));
      }
    } finally {
      setLoading(false);
    }
  }, [phone, t, getRecaptchaVerifier]);

  /* ── Verify code ── */
  const handleVerifyCode = useCallback(async () => {
    if (code.length !== 6) return;
    setLoading(true);
    setError('');
    try {
      const result = await confirmationRef.current!.confirm(code);
      const idToken = await result.user.getIdToken();
      await login(idToken);
      setStep('success');
      setTimeout(() => handleClose(), 1500);
    } catch (err) {
      console.error('[Auth] Code verify error:', err);
      setError(t('codeError'));
    } finally {
      setLoading(false);
    }
  }, [code, login, handleClose, t]);

  if (!open) return null;

  return (
    <div
      className="modal open"
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="modal-card login-card">
        <button className="modal-close" onClick={handleClose} aria-label="Close">
          ✕
        </button>

        {/* reCAPTCHA container (invisible, fresh div each attempt) */}
        <div id="recaptcha-wrapper"><div id="recaptcha-container-0" /></div>

        {/* ── Phone step ── */}
        {step === 'phone' && (
          <div className="login-step">
            <div className="modal-icon">📱</div>
            <h2 className="modal-title">{t('loginTitle')}</h2>
            <p className="modal-text">{t('loginDesc')}</p>

            <label className="login-label">{t('phoneLabel')}</label>
            <input
              type="tel"
              className="login-phone-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('phonePlaceholder')}
              autoFocus
            />

            {error && <p className="login-error">{error}</p>}

            <button
              className="btn btn-ai login-submit"
              onClick={handleSendCode}
              disabled={loading || phone.length < 10}
            >
              {loading ? '...' : t('sendCode')}
            </button>
          </div>
        )}

        {/* ── Code step ── */}
        {step === 'code' && (
          <div className="login-step">
            <div className="modal-icon">💬</div>
            <h2 className="modal-title">{t('codeLabel')}</h2>
            <p className="modal-text">{phone}</p>

            <input
              type="text"
              className="login-code-input"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder={t('codePlaceholder')}
              autoFocus
              inputMode="numeric"
            />

            {error && <p className="login-error">{error}</p>}

            <button
              className="btn btn-ai login-submit"
              onClick={handleVerifyCode}
              disabled={loading || code.length !== 6}
            >
              {loading ? '...' : t('verify')}
            </button>

            <button className="login-back" onClick={() => { setStep('phone'); setCode(''); setError(''); }}>
              {t('back')}
            </button>
          </div>
        )}

        {/* ── Success step ── */}
        {step === 'success' && (
          <div className="login-step">
            <div className="modal-icon">✅</div>
            <h2 className="modal-title">{t('success')}</h2>
          </div>
        )}
      </div>
    </div>
  );
}
