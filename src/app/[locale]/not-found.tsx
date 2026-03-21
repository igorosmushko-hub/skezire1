import Link from 'next/link';

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px 20px',
      }}
    >
      <h1 style={{ fontSize: '4rem', color: '#003082', marginBottom: 8 }}>404</h1>
      <p style={{ fontSize: '1.25rem', color: '#555', marginBottom: 32 }}>
        Бет табылмады / Страница не найдена
      </p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/kk"
          style={{
            padding: '12px 24px',
            backgroundColor: '#003082',
            color: '#fff',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          Басты бет
        </Link>
        <Link
          href="/kk/ai"
          style={{
            padding: '12px 24px',
            backgroundColor: '#C8A84B',
            color: '#fff',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          AI фото
        </Link>
        <Link
          href="/kk/encyclopedia"
          style={{
            padding: '12px 24px',
            border: '2px solid #003082',
            color: '#003082',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          Энциклопедия
        </Link>
      </div>
    </main>
  );
}
