import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Шежіре — Казахское генеалогическое дерево';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isKk = locale === 'kk';

  return new ImageResponse(
    (
      <div
        style={{
          background: '#003082',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Декоративная рамка */}
        <div
          style={{
            position: 'absolute',
            top: 32,
            left: 32,
            right: 32,
            bottom: 32,
            border: '2px solid #C8A84B',
            display: 'flex',
          }}
        />
        {/* Заголовок */}
        <div
          style={{
            color: '#C8A84B',
            fontSize: 96,
            fontWeight: 700,
            letterSpacing: '-2px',
            lineHeight: 1,
          }}
        >
          Шежіре
        </div>
        {/* Подзаголовок */}
        <div
          style={{
            color: '#F5F0E8',
            fontSize: 36,
            marginTop: 28,
            letterSpacing: '1px',
          }}
        >
          {isKk ? 'Қазақша шежіре ағашы онлайн' : 'Казахское генеалогическое дерево'}
        </div>
        {/* Домен */}
        <div
          style={{
            color: '#C8A84B',
            fontSize: 24,
            marginTop: 40,
            opacity: 0.8,
            letterSpacing: '3px',
          }}
        >
          SKEZIRE.KZ
        </div>
      </div>
    ),
    { ...size },
  );
}
