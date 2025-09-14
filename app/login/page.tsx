'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('you@example.com');     
  const [password, setPassword] = useState('Strong@123');    
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const r = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const data = await api<{ token: string; tenantId: number }>(
        '/auth/login',
        { method: 'POST', body: JSON.stringify({ email, password }) }
      );
      localStorage.setItem('token', data.token);
      localStorage.setItem('tenantId', String(data.tenantId));
      r.push('/dashboard');
    } catch (e: any) {
      setErr(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{maxWidth: 380, margin: '80px auto', fontFamily: 'system-ui'}}>
      <h1 style={{marginBottom: 12}}>Login</h1>
      <form onSubmit={onSubmit} style={{display: 'grid', gap: 10}}>
        <label>
          Email
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6}}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6}}
          />
        </label>
        {err && <div style={{color: 'crimson', fontSize: 14}}>{err}</div>}
        <button
          type="submit"
          disabled={loading}
          style={{padding: '10px 12px', borderRadius: 6, border: '1px solid #333', background: '#111', color: '#fff'}}
        >
          {loading ? 'Signing in…' : 'Login'}
        </button>
      </form>
    </main>
  );
}
