import type { Metadata } from 'next';
import '@/styles/legal.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKk = locale === 'kk';
  const base = 'https://skezire.kz';

  return {
    title: isKk ? 'Байланыс | Шежіре' : 'Контакты | Шежіре',
    description: isKk
      ? 'Шежіре — байланыс деректері, сұрақтар мен ұсыныстар'
      : 'Шежіре — контактная информация, вопросы и предложения',
    alternates: {
      canonical: `${base}/${locale}/contacts`,
      languages: {
        kk: `${base}/kk/contacts`,
        ru: `${base}/ru/contacts`,
        'x-default': `${base}/kk/contacts`,
      },
    },
  };
}

export default async function ContactsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isKk = locale === 'kk';

  if (isKk) {
    return (
      <main className="legal-main">
        <div className="container">
          <h1>Байланыс</h1>

          <h2>Байланыс деректері</h2>
          <div className="legal-contact-card">
            <p><strong>ЖК &quot;ГЕНРИ МОРГАН&quot;</strong></p>
            <p>ЖСН: 870706300216</p>
            <p>Мекенжайы: Алматы қ., Қазақстан Республикасы</p>
            <p>Тел: <a href="tel:+77756006661">+7 775 600 6661</a></p>
            <p>Email: <a href="mailto:igor@morgan.kz">igor@morgan.kz</a></p>
          </div>

          <h2>Жұмыс уақыты</h2>
          <p>Дүйсенбі — Жұма: 09:00 — 18:00 (Алматы уақыты)</p>
          <p>Сенбі — Жексенбі: демалыс</p>
          <p>Электрондық хаттарға жауап — 1-2 жұмыс күні ішінде.</p>

          <h2>Сұрақтар бойынша</h2>
          <ul>
            <li><strong>AI генерациялар:</strong> igor@morgan.kz</li>
            <li><strong>Тапсырыстар мен жеткізу:</strong> igor@morgan.kz</li>
            <li><strong>Төлем мәселелері:</strong> igor@morgan.kz</li>
            <li><strong>Ұсыныстар мен кері байланыс:</strong> igor@morgan.kz</li>
          </ul>

          <h2>Сайт</h2>
          <p>
            <a href="https://skezire.kz">skezire.kz</a> — Қазақша шежіре ағашы және AI фото онлайн
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="legal-main">
      <div className="container">
        <h1>Контакты</h1>

        <h2>Контактная информация</h2>
        <div className="legal-contact-card">
          <p><strong>ИП &quot;ГЕНРИ МОРГАН&quot;</strong></p>
          <p>ИИН: 870706300216</p>
          <p>Адрес: г. Алматы, Республика Казахстан</p>
          <p>Тел: <a href="tel:+77756006661">+7 775 600 6661</a></p>
          <p>Email: <a href="mailto:igor@morgan.kz">igor@morgan.kz</a></p>
        </div>

        <h2>Время работы</h2>
        <p>Понедельник — Пятница: 09:00 — 18:00 (время Алматы)</p>
        <p>Суббота — Воскресенье: выходной</p>
        <p>Ответ на электронные письма — в течение 1-2 рабочих дней.</p>

        <h2>По вопросам</h2>
        <ul>
          <li><strong>AI генерации:</strong> igor@morgan.kz</li>
          <li><strong>Заказы и доставка:</strong> igor@morgan.kz</li>
          <li><strong>Вопросы оплаты:</strong> igor@morgan.kz</li>
          <li><strong>Предложения и обратная связь:</strong> igor@morgan.kz</li>
        </ul>

        <h2>Сайт</h2>
        <p>
          <a href="https://skezire.kz">skezire.kz</a> — Казахское генеалогическое дерево и AI фото онлайн
        </p>
      </div>
    </main>
  );
}
