'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { usePubyAuth } from '@/hooks/puby/useAuth';
import { LayoutDashboard, Calendar, Receipt, Users } from 'lucide-react';

const MOBILE_TABS = [
  { href: '/puby/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
  { href: '/puby/schedule/my', icon: Calendar, labelKey: 'myTasks' },
  { href: '/puby/expense', icon: Receipt, labelKey: 'expenseList' },
  { href: '/puby/admin', icon: Users, labelKey: 'admin', adminOnly: true },
];

export default function PubyMobileNav() {
  const t = useTranslations('puby.sidebar');
  const pathname = usePathname();
  const { pubyUser } = usePubyAuth();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-primary border-t border-border-default">
      <div className="flex items-center justify-around h-14">
        {MOBILE_TABS.map((tab) => {
          if (tab.adminOnly && pubyUser?.role !== 'admin') return null;
          const Icon = tab.icon;
          const isActive = pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 text-xs transition-colors ${
                isActive ? 'text-brand-purple' : 'text-text-muted'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{t(tab.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
