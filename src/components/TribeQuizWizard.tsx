'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { QUIZ_QUESTIONS } from '@/data/tribe-quiz-questions';
import { TribeQuizQuestion } from '@/components/TribeQuizQuestion';
import { TribeJoinModal } from '@/components/tribe-tree/TribeJoinModal';
import { LoginModal } from '@/components/LoginModal';
import { RobokassaWidget } from '@/components/RobokassaWidget';
import { useAuth } from '@/components/AuthProvider';
import { findTribe } from '@/lib/tribe-utils';
import type { TribeQuizAnswers } from '@/lib/tribe-quiz-scoring';
import '@/styles/tribe-quiz.css';
import '@/styles/tribe-race.css';

type Step = 'intro' | 'question' | 'analyzing' | 'result';

const QUIZ_PRICE_KZT = 990;

interface Candidate {
  tribeId: string;
  confidence: 'high' | 'medium' | 'low';
  reasoning_ru: string;
  reasoning_kk: string;
}

interface QuizResultState {
  resultId: string;
  paid: boolean;
  candidates: Candidate[];
  disclaimer_ru: string;
  disclaimer_kk: string;
}

const CONFIDENCE_LABEL: Record<'high' | 'medium' | 'low', { kk: string; ru: string }> = {
  high: { kk: 'Жоғары сенімділік', ru: 'Высокая вероятность' },
  medium: { kk: 'Орташа сенімділік', ru: 'Средняя вероятность' },
  low: { kk: 'Төмен сенімділік', ru: 'Низкая вероятность' },
};

export function TribeQuizWizard({ locale }: { locale: string }) {
  const isKk = locale === 'kk';
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [step, setStep] = useState<Step>('intro');
  const [answers, setAnswers] = useState<TribeQuizAnswers>({});
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<QuizResultState | null>(null);
  const [joinTarget, setJoinTarget] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [paymentData, setPaymentData] = useState<{ url: string; params: Record<string, unknown> } | null>(null);

  const loadResult = useCallback(async (resultId: string) => {
    setStep('analyzing');
    try {
      const res = await fetch(`/api/tribe-quiz/result/${resultId}`);
      if (!res.ok) {
        setStep('intro');
        return;
      }
      const data = await res.json();
      if (data.paid) {
        setResult({
          resultId,
          paid: true,
          candidates: data.candidates,
          disclaimer_ru: data.disclaimer_ru,
          disclaimer_kk: data.disclaimer_kk,
        });
      } else {
        setResult({ resultId, paid: false, candidates: [], disclaimer_ru: '', disclaimer_kk: '' });
      }
      setStep('result');
    } catch {
      setStep('intro');
    }
  }, []);

  // Восстанавливаем результат из URL — нужно, т.к. RobokassaWidget завершает
  // оплату через window.location.reload().
  useEffect(() => {
    const resultId = searchParams.get('resultId');
    if (resultId) loadResult(resultId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleQuestions = useMemo(
    () => QUIZ_QUESTIONS.filter((q) => !q.visibleIf || q.visibleIf(answers)),
    [answers],
  );

  const current = visibleQuestions[index];
  const progress = visibleQuestions.length
    ? Math.round(((index + 1) / visibleQuestions.length) * 100)
    : 0;

  const setAnswer = (value: string | undefined) => {
    if (!current) return;
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  };

  const goNext = async () => {
    if (index < visibleQuestions.length - 1) {
      setIndex((i) => i + 1);
      return;
    }
    setStep('analyzing');
    setError('');
    try {
      const res = await fetch('/api/tribe-quiz/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      });
      if (!res.ok) throw new Error('failed');
      const data = (await res.json()) as { resultId: string | null };
      if (!data.resultId) throw new Error('no_result_id');
      router.replace(`${pathname}?resultId=${data.resultId}`, { scroll: false });
      setResult({ resultId: data.resultId, paid: false, candidates: [], disclaimer_ru: '', disclaimer_kk: '' });
      setStep('result');
    } catch {
      setError(isKk ? 'Қате орын алды, қайталап көріңіз' : 'Произошла ошибка, попробуйте снова');
      setStep('question');
    }
  };

  const goBack = () => {
    if (index > 0) setIndex((i) => i - 1);
  };

  const handleUnlock = async () => {
    if (!result) return;
    if (!user) {
      setShowLogin(true);
      return;
    }
    setPaying(true);
    setError('');
    try {
      const res = await fetch('/api/tribe-quiz/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId: result.resultId, locale }),
      });
      const data = await res.json();
      if (res.ok && data.url && data.params) {
        setPaymentData({ url: data.url, params: data.params });
      } else if (res.ok && data.alreadyPaid) {
        await loadResult(result.resultId);
      } else if (res.status === 401) {
        setShowLogin(true);
      } else {
        setError(isKk ? 'Қате орын алды' : 'Произошла ошибка');
      }
    } catch {
      setError(isKk ? 'Қате орын алды' : 'Произошла ошибка');
    } finally {
      setPaying(false);
    }
  };

  if (step === 'intro') {
    return (
      <div className="quiz-card quiz-intro">
        <div className="quiz-intro-icon">&#127961;</div>
        <h2>{isKk ? 'Өз руыңызды табыңыз' : 'Узнайте свой род'}</h2>
        <p>
          {isKk
            ? `${QUIZ_QUESTIONS.length} сұраққа жауап беріңіз — біз сіздің шыққан тегіңіз туралы болжам жасаймыз. Бәрін білу міндетті емес, «білмеймін» деп өткізе беруге болады.`
            : `Ответьте на ${QUIZ_QUESTIONS.length} вопросов — мы предположим, из какого вы рода. Знать всё не обязательно, вопросы можно пропускать.`}
        </p>
        <p className="quiz-intro-price">
          {isKk
            ? `Нәтиже барлық сұраққа жауап бергеннен кейін ашылады — ${QUIZ_PRICE_KZT} ₸`
            : `Результат откроется после ответа на все вопросы — ${QUIZ_PRICE_KZT} ₸`}
        </p>
        <button className="btn btn-ai" onClick={() => setStep('question')}>
          {isKk ? 'Бастау' : 'Начать'}
        </button>
      </div>
    );
  }

  if (step === 'analyzing') {
    return (
      <div className="quiz-card quiz-analyzing">
        <div className="quiz-spinner" />
        <p>{isKk ? 'Жауаптарыңызды талдап жатырмыз…' : 'Анализируем ваши ответы…'}</p>
      </div>
    );
  }

  if (step === 'result' && result && !result.paid) {
    return (
      <div className="quiz-card quiz-result quiz-paywall">
        <div className="quiz-paywall-icon">&#128274;</div>
        <h2>{isKk ? 'Руыңыз анықталды!' : 'Ваш род определён!'}</h2>
        <p className="quiz-disclaimer">
          {isKk
            ? 'ЖИ жауаптарыңызды талдап, сенімділік деңгейі мен түсіндірмесі бар бірнеше ықтимал ру нұсқасын дайындады.'
            : 'ИИ проанализировал ваши ответы в свободной форме и подготовил несколько вероятных версий рода — с уровнем уверенности и объяснением по каждой.'}
        </p>
        {error && <p className="quiz-error">{error}</p>}
        <button className="btn btn-ai" onClick={handleUnlock} disabled={paying}>
          {paying
            ? '...'
            : isKk
              ? `Нәтижені көру — ${QUIZ_PRICE_KZT} ₸`
              : `Узнать результат — ${QUIZ_PRICE_KZT} ₸`}
        </button>

        <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
        {paymentData && (
          <RobokassaWidget
            params={paymentData.params}
            fallbackUrl={paymentData.url}
            onClose={() => {
              setPaymentData(null);
              setPaying(false);
            }}
          />
        )}
      </div>
    );
  }

  if (step === 'result' && result && result.paid) {
    return (
      <div className="quiz-card quiz-result">
        <h2>{isKk ? 'Ықтимал рулар' : 'Вероятные роды'}</h2>
        <p className="quiz-disclaimer">{isKk ? result.disclaimer_kk : result.disclaimer_ru}</p>
        <div className="quiz-candidates">
          {result.candidates.map((c) => {
            const found = findTribe(c.tribeId);
            if (!found) return null;
            const { tribe } = found;
            return (
              <div key={c.tribeId} className="quiz-candidate-card">
                <div className="quiz-candidate-tamga">{tribe.tamga}</div>
                <h3>{isKk ? tribe.kk : tribe.ru}</h3>
                <span className={`quiz-confidence quiz-confidence--${c.confidence}`}>
                  {isKk ? CONFIDENCE_LABEL[c.confidence].kk : CONFIDENCE_LABEL[c.confidence].ru}
                </span>
                <p>{isKk ? c.reasoning_kk : c.reasoning_ru}</p>
                <button className="btn btn-ai" onClick={() => setJoinTarget(tribe.id)}>
                  {isKk ? 'Осы руға қосылу' : 'Присоединиться к этому роду'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="quiz-upsell">
          <p>{isKk ? 'Ары қарай не істеуге болады?' : 'Что дальше?'}</p>
          <div className="quiz-upsell-links">
            <a href={`/${locale}/ai`}>{isKk ? 'AI фото жасау' : 'Сделать ИИ-фото'}</a>
            <a href={`/${locale}/order/canvas`}>{isKk ? 'Картина тапсырыс беру' : 'Заказать картину'}</a>
            <a href={`/${locale}#form-section`}>{isKk ? 'Шежіре құру' : 'Построить дерево'}</a>
          </div>
        </div>

        {joinTarget && (() => {
          const found = findTribe(joinTarget);
          if (!found) return null;
          return (
            <TribeJoinModal
              tribe={found.tribe}
              zhuz={found.zhuz}
              locale={locale}
              quizResultId={result.resultId}
              onClose={() => setJoinTarget(null)}
              onJoined={() => setJoinTarget(null)}
            />
          );
        })()}
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="quiz-card">
      <div className="quiz-progress-wrap">
        <div className="quiz-progress-bar">
          <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="quiz-progress-text">
          {index + 1} / {visibleQuestions.length}
        </span>
      </div>

      <h2 className="quiz-question-title">{isKk ? current.title_kk : current.title_ru}</h2>
      {(isKk ? current.hint_kk : current.hint_ru) && (
        <p className="quiz-question-hint">{isKk ? current.hint_kk : current.hint_ru}</p>
      )}

      <TribeQuizQuestion
        question={current}
        value={answers[current.id] as string | undefined}
        onChange={setAnswer}
        locale={locale}
      />

      {error && <p className="quiz-error">{error}</p>}

      <div className="quiz-nav">
        {index > 0 && (
          <button className="quiz-btn-secondary" onClick={goBack}>
            {isKk ? 'Артқа' : 'Назад'}
          </button>
        )}
        <button className="btn btn-ai" onClick={goNext}>
          {index === visibleQuestions.length - 1
            ? (isKk ? 'Нәтижені көру' : 'Узнать результат')
            : (isKk ? 'Келесі' : 'Далее')}
        </button>
        {current.optional && (
          <button className="quiz-btn-skip" onClick={goNext}>
            {isKk ? 'Білмеймін' : 'Не знаю'}
          </button>
        )}
      </div>
    </div>
  );
}
