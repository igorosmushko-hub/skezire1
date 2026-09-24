'use client';

import { useLocale } from 'next-intl';
import Link from 'next/link';
import '@/styles/tribe-quiz.css';

export function TribeQuizCta() {
  const locale = useLocale();
  const isKk = locale === 'kk';

  return (
    <section className="quiz-cta">
      <div className="container">
        <div className="quiz-cta-inner">
          <div className="quiz-cta-icon">&#127961;</div>
          <div className="quiz-cta-text">
            <h2>{isKk ? 'Өз руыңызды білмейсіз бе?' : 'Не знаете свой род?'}</h2>
            <p>
              {isKk
                ? '12 сұраққа жауап беріп, ЖИ көмегімен қай руға жататыныңызды болжаңыз — нәтиже 990 ₸'
                : 'Ответьте на 12 вопросов — ИИ предположит, к какому роду вы принадлежите. Результат — 990 ₸'}
            </p>
          </div>
          <Link href={`/${locale}/tribe-quiz`} className="btn btn-ai quiz-cta-btn">
            {isKk ? 'Тестті бастау' : 'Пройти тест'}
          </Link>
        </div>
      </div>
    </section>
  );
}
