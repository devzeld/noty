'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import { useAuth } from '@/hooks/useAuth';

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <div>Caricamento...</div>;

  return (
    <main>
      <h1>Benvenuto su Noty</h1>
      <button onClick={() => router.push('/auth/login')}>Accedi ora</button>
    </main>
  );
}