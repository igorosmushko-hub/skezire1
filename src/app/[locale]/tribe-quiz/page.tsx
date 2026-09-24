import type { Metadata } from 'next';
import { TribeQuizWizard } from '@/components/TribeQuizWizard';
import { TribeQuizLanding } from '@/components/TribeQuizLanding';
import '@/styles/tribe-quiz.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKk = locale === 'kk';
  const base = 'https://skezire.kz';
  const url = `${base}/${locale}/tribe-quiz`;

  return {
    title: isKk
      ? 'Өз руыңызды табыңыз — тегіңізді анықтау тесті | Шежіре'
      : 'Узнайте свой род — тест для определения происхождения | Шежіре',
    description: isKk
      ? 'Руыңызды білмейсіз бе? 12 сұраққа жауап беріңіз — ЖИ еркін түрде талдап, сенімділік деңгейі бар бірнеше ықтимал ру нұсқасын ұсынады.'
      : 'Не знаете свой род? Ответьте на 12 вопросов — ИИ в свободной форме проанализирует данные и предложит несколько вероятных версий рода с уровнем уверенности.',
    alternates: {
      canonical: url,
      languages: {
        kk: `${base}/kk/tribe-quiz`,
        ru: `${base}/ru/tribe-quiz`,
        'x-default': `${base}/kk/tribe-quiz`,
      },
    },
  };
}

export default async function TribeQuizPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <main className="quiz-page">
      <div className="container">
        <TribeQuizLanding locale={locale} />
        <div id="quiz-start">
          <TribeQuizWizard locale={locale} />
        </div>
      </div>
    </main>
  );
}
