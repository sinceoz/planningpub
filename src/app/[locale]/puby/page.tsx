'use client';

import { useEffect } from 'react';
import LoginForm from '@/components/puby/auth/LoginForm';
import { usePubyAuth } from '@/hooks/puby/useAuth';
import { useRouter } from '@/i18n/routing';

export default function PubyLoginPage() {
  const { pubyUser, loading } = usePubyAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && pubyUser) {
      router.push('/puby/dashboard');
    }
  }, [loading, pubyUser, router]);

  return <LoginForm />;
}
