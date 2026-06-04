'use client';

import { useState } from 'react';

interface StatsRow {
  date: string;
  registrations: number;
  payments: number;
  amount: number;
}

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [rows, setRows] = useState<StatsRow[] | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function fetchStats(pw: string) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${pw}` },
      });
      if (res.status === 401) {
        setError('Неверный пароль');
        setRows(null);
        return;
      }
      if (!res.ok) {
        setError('Ошибка сервера');
        return;
      }
      const data = await res.json();
      setRows(data.rows);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchStats(password);
  }

  const totalReg = rows?.reduce((s, r) => s + r.registrations, 0) ?? 0;
  const totalPay = rows?.reduce((s, r) => s + r.payments, 0) ?? 0;
  const totalAmt = rows?.reduce((s, r) => s + r.amount, 0) ?? 0;

  const last7 = rows?.slice(0, 7) ?? [];
  const reg7 = last7.reduce((s, r) => s + r.registrations, 0);
  const pay7 = last7.reduce((s, r) => s + r.payments, 0);
  const amt7 = last7.reduce((s, r) => s + r.amount, 0);

  function formatDate(iso: string) {
    const [y, m, d] = iso.split('-');
    return `${d}.${m}.${y}`;
  }

  function fmtAmount(n: number) {
    return n.toLocaleString('ru-RU') + ' ₸';
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', fontFamily: 'Inter, sans-serif', padding: '32px 16px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f8fafc', marginBottom: 24 }}>
          Skezire — Admin Dashboard
        </h1>

        {rows === null && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 32 }}>
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid #334155',
                background: '#1e293b',
                color: '#f1f5f9',
                fontSize: 15,
                outline: 'none',
                width: 220,
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                background: '#003082',
                color: '#fff',
                border: 'none',
                fontSize: 15,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Загрузка...' : 'Войти'}
            </button>
            {error && <span style={{ color: '#f87171' }}>{error}</span>}
          </form>
        )}

        {rows !== null && (
          <>
            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
              <Card label="Регистрации (7 дней)" value={reg7} />
              <Card label="Оплаты (7 дней)" value={pay7} />
              <Card label="Выручка (7 дней)" value={fmtAmount(amt7)} highlight />
              <Card label="Регистрации (30 дней)" value={totalReg} />
              <Card label="Оплаты (30 дней)" value={totalPay} />
              <Card label="Выручка (30 дней)" value={fmtAmount(totalAmt)} highlight />
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                    <th style={th}>Дата</th>
                    <th style={th}>Регистрации</th>
                    <th style={th}>Оплаты</th>
                    <th style={th}>Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr
                      key={row.date}
                      style={{
                        borderBottom: '1px solid #1e293b',
                        background: i % 2 === 0 ? '#1e293b' : 'transparent',
                      }}
                    >
                      <td style={td}>{formatDate(row.date)}</td>
                      <td style={{ ...td, color: row.registrations > 0 ? '#86efac' : '#94a3b8' }}>
                        {row.registrations > 0 ? `+${row.registrations}` : '—'}
                      </td>
                      <td style={{ ...td, color: row.payments > 0 ? '#fbbf24' : '#94a3b8' }}>
                        {row.payments > 0 ? row.payments : '—'}
                      </td>
                      <td style={{ ...td, color: row.amount > 0 ? '#fbbf24' : '#94a3b8' }}>
                        {row.amount > 0 ? fmtAmount(row.amount) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setRows(null); setPassword(''); }}
                style={{ padding: '8px 16px', borderRadius: 8, background: '#334155', color: '#94a3b8', border: 'none', cursor: 'pointer', fontSize: 13 }}
              >
                Выйти
              </button>
              <button
                onClick={() => fetchStats(password)}
                style={{ marginLeft: 8, padding: '8px 16px', borderRadius: 8, background: '#1e3a5f', color: '#93c5fd', border: 'none', cursor: 'pointer', fontSize: 13 }}
              >
                Обновить
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Card({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div style={{
      background: '#1e293b',
      border: `1px solid ${highlight ? '#92400e' : '#334155'}`,
      borderRadius: 12,
      padding: '16px 20px',
    }}>
      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: highlight ? '#fbbf24' : '#f8fafc' }}>{value}</div>
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 16px',
  fontWeight: 500,
};

const td: React.CSSProperties = {
  padding: '10px 16px',
};
