
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const r = useRouter();
  useEffect(() => {
    const has = typeof window !== 'undefined' && localStorage.getItem('token');
    r.replace(has ? '/dashboard' : '/login');
  }, [r]);

  return null;
}
