'use client';

interface Props {
  locale: string;
  className?: string;
}

export function WhatsAppShareButton({ locale, className = 'btn btn-ai-outline' }: Props) {
  const isKk = locale === 'kk';
  const text = isKk
    ? 'Менің шежірем — Skezire.kz-де шежіре ағашын жасаңыз! https://skezire.kz/kk'
    : 'Моё шежіре — Создайте генеалогическое дерево на Skezire.kz! https://skezire.kz/ru';

  return (
    <a
      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {isKk ? 'WhatsApp-та бөлісу' : 'Поделиться в WhatsApp'}
    </a>
  );
}
