'use client';

import { Suspense } from 'react';
import { usePathname } from '@/i18n/routing';
import PubyAuthProvider from '@/components/puby/auth/PubyAuthProvider';
import PubySidebar from '@/components/puby/layout/PubySidebar';
import PubyHeader from '@/components/puby/layout/PubyHeader';
import PubyMobileNav from '@/components/puby/layout/PubyMobileNav';
import { usePubyAuth } from '@/hooks/puby/useAuth';

function PubyLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { pubyUser, loading } = usePubyAuth();

  const isInvitePage = pathname.includes('/puby/invite/');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="animate-spin w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isInvitePage) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
        {children}
      </div>
    );
  }

  if (!pubyUser) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
        {children}
      </div>
    );
  }

  return (
    <div className={pubyUser.themePreference === 'light' ? 'puby-light' : ''}>
      <div className="flex min-h-[calc(100vh-64px)]">
        <PubySidebar />
        <div className="flex-1 flex flex-col">
          <PubyHeader />
          <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
      <PubyMobileNav />
    </div>
  );
}

export default function PubyLayout({ children }: { children: React.ReactNode }) {
  return (
    <PubyAuthProvider>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="animate-spin w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full" />
        </div>
      }>
        <PubyLayoutInner>{children}</PubyLayoutInner>
      </Suspense>
    </PubyAuthProvider>
  );
}
