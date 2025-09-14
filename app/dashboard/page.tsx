'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

type Summary = {
  customers: number;
  orders: number;
  revenue: number;
  averageOrderValue: number;
};

export default function Dashboard() {
  const r = useRouter();

  const [token, setToken] = useState<string>('');
  const [summary, setSummary] = useState<Summary>({
    customers: 0,
    orders: 0,
    revenue: 0,
    averageOrderValue: 0,
  });
  const [seriesRaw, setSeriesRaw] = useState<{ orderDate: string; total: number }[]>([]);
  const [topCustomers, setTopCustomers] = useState<{ id: number; name: string; spend: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ title: string; revenue: number; units: number }[]>([]);
  const [nvr, setNvr] = useState<{ new: number; repeat: number }>({ new: 0, repeat: 0 });

  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string>('');

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
    if (!t) {
      r.replace('/login');
      return;
    }
    setToken(t);
  }, [r]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setErr('');

    (async () => {
      try {
        const s = await api<Summary>('/insights/summary', {}, token);
        setSummary({
          customers: Number(s.customers || 0),
          orders: Number(s.orders || 0),
          revenue: Number(s.revenue || 0),
          averageOrderValue: Number(s.averageOrderValue || 0),
        });

        const q = new URLSearchParams({ ...(from ? { from } : {}), ...(to ? { to } : {}) }).toString();
        const byDate = await api<{ orderDate: string; total: number }[]>(
          `/insights/orders-by-date${q ? `?${q}` : ''}`,
          {},
          token
        );
        setSeriesRaw(byDate);

        const tc = await api<{ id: number; name: string; spend: number }[]>(
          '/insights/top-customers',
          {},
          token
        );
        setTopCustomers(tc);

        const tp = await api<{ title: string; revenue: number; units: number }[]>(
          '/insights/top-products',
          {},
          token
        );
        setTopProducts(tp);

        const nv = await api<{ new: number; repeat: number }>('/insights/new-vs-repeat', {}, token);
        setNvr({ new: Number(nv.new || 0), repeat: Number(nv.repeat || 0) });
      } catch (e: any) {
        setErr(e?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    })();
  }, [token, from, to]);

  const series = useMemo(
    () =>
      seriesRaw.map((r) => ({
        date: new Date(r.orderDate).toLocaleDateString(),
        total: Number(r.total),
      })),
    [seriesRaw]
  );

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('tenantId');
    r.replace('/login');
  }

  const pieData = [
    { name: 'New', value: nvr.new },
    { name: 'Repeat', value: nvr.repeat },
  ];

  return (
    <main
      style={{
        padding: 32,
        fontFamily: 'system-ui',
        background: '#fff',
        color: '#111',
        minHeight: '100vh',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <h1 style={{ margin: 0, color: '#111' }}>Insights Dashboard</h1>
        <button
          onClick={logout}
          style={{
            padding: '6px 10px',
            border: '1px solid #444',
            borderRadius: 6,
            background: '#f5f5f5',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </header>

      {err && (
        <div style={{ color: 'crimson', marginBottom: 12 }}>
          {err}
        </div>
      )}

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 24,
          marginBottom: 32,
        }}
      >
        <Card title="Customers" value={summary.customers.toString()} />
        <Card title="Orders" value={summary.orders.toString()} />
        <Card title="Revenue" value={`₹${Number(summary.revenue).toFixed(2)}`} />
        <Card title="Avg Order Value" value={`₹${Number(summary.averageOrderValue).toFixed(2)}`} />
      </section>

      <section
        style={{
          display: 'flex',
          gap: 16,
          alignItems: 'flex-end',
          marginBottom: 32,
        }}
      >
        <LabeledDate
          label="From:"
          value={from}
          onChange={(v) => setFrom(v)}
        />
        <LabeledDate
          label="To:"
          value={to}
          onChange={(v) => setTo(v)}
        />
        <button
          onClick={() => {
            setFrom('');
            setTo('');
          }}
          style={{
            padding: '8px 14px',
            border: '1px solid #ccc',
            borderRadius: 6,
            background: '#f9f9f9',
            cursor: 'pointer',
            height: 38,
          }}
        >
          Clear
        </button>
      </section>

      <section
        style={{
          height: 400,
          border: '1px solid #ddd',
          borderRadius: 12,
          padding: 16,
          paddingBottom: 30,
          marginBottom: 40,
          background: '#fafafa',
        }}
      >
        <h3 style={{ margin: 0, marginBottom: 8, color: '#111' }}>Orders by date</h3>
        {loading ? (
          <Loader />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#0070f3" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </section>

      <section
        style={{
          height: 320,
          border: '1px solid #ddd',
          borderRadius: 12,
          padding: 16,
          background: '#fafafa',
          marginBottom: 32,
        }}
      >
        <h3 style={{ margin: 0, marginBottom: 8, color: '#111' }}>Top 5 customers by spend</h3>
        {loading ? (
          <Loader />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topCustomers.map((t) => ({ name: t.name, spend: Number(t.spend) }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" interval={0} tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="spend" fill="#0070f3" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>

      <section
        style={{
          height: 320,
          border: '1px solid #ddd',
          borderRadius: 12,
          padding: 16,
          background: '#fafafa',
          marginBottom: 32,
        }}
      >
        <h3 style={{ margin: 0, marginBottom: 8, color: '#111' }}>Top 5 products (by revenue)</h3>
        {loading ? (
          <Loader />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProducts.map((p) => ({ name: p.title, revenue: Number(p.revenue) }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" interval={0} tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>

      <section
        style={{
          height: 320,
          border: '1px solid #ddd',
          borderRadius: 12,
          padding: 16,
          background: '#fafafa',
        }}
      >
        <h3 style={{ margin: 0, marginBottom: 8, color: '#111' }}>New vs Repeat customers</h3>
        {loading ? (
          <Loader />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                <Cell />
                <Cell />
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </section>
    </main>
  );
}


function Card({ title, value }: { title: string; value: string }) {
  return (
    <div
      style={{
        padding: 20,
        border: '1px solid #ddd',
        borderRadius: 12,
        background: '#fafafa',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      <div style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#111' }}>{value}</div>
    </div>
  );
}

function Loader() {
  return <div style={{ padding: 12, color: '#777' }}>Loading…</div>;
}

function LabeledDate({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={{ marginBottom: 4, fontSize: 14, color: '#333' }}>{label}</label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '6px 10px',
          border: '1px solid #ccc',
          borderRadius: 6,
          fontSize: 14,
          minWidth: 160,
          height: 38,
          background: '#fff',
          color: '#111',
        }}
      />
    </div>
  );
}
