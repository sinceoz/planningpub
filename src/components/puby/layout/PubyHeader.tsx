'use client';

import { useTranslations } from 'next-intl';
import { usePubyAuth } from '@/hooks/puby/useAuth';
import { Bell, Sun, Moon, LogOut } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function PubyHeader() {
  const t = useTranslations('puby.header');
  const { pubyUser, signOut } = usePubyAuth();

  if (!pubyUser) return null;

  const isDark = pubyUser.themePreference === 'dark';

  async function toggleTheme() {
    if (!pubyUser) return;
    const newTheme = isDark ? 'light' : 'dark';
    await updateDoc(doc(db, 'puby_users', pubyUser.uid), {
      themePreference: newTheme,
    });
  }

  return (
    <header className="h-14 border-b border-border-default bg-surface-primary px-4 flex items-center justify-between md:justify-end gap-3">
      <div className="md:hidden text-sm font-medium text-text-primary">
        {pubyUser.displayName}
      </div>

      <div className="flex items-center gap-2">
        <button
          className="relative p-2 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-surface-secondary"
          aria-label={t('notifications')}
        >
          <Bell className="w-4 h-4" />
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-surface-secondary"
          aria-label={t('theme')}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="hidden md:flex items-center gap-2 px-2 text-sm">
          <span className="text-text-muted">{pubyUser.displayName}</span>
          <span className="text-xs text-text-muted bg-surface-secondary px-2 py-0.5 rounded">
            {pubyUser.role}
          </span>
        </div>

        <button
          onClick={signOut}
          className="p-2 text-text-muted hover:text-red-400 transition-colors rounded-lg hover:bg-surface-secondary"
          aria-label={t('logout')}
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
