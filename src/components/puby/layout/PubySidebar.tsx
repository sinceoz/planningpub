'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { usePubyAuth } from '@/hooks/puby/useAuth';
import {
  LayoutDashboard, Calendar, ListTodo, Receipt,
  FilePlus, Users, FolderKanban, Settings, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  href: string;
  icon: React.ElementType;
  labelKey: string;
  children?: { href: string; labelKey: string }[];
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/puby/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
  {
    href: '/puby/schedule', icon: Calendar, labelKey: 'schedule',
    children: [
      { href: '/puby/schedule', labelKey: 'teamBoard' },
      { href: '/puby/schedule/my', labelKey: 'myTasks' },
    ],
  },
  {
    href: '/puby/expense', icon: Receipt, labelKey: 'expense',
    children: [
      { href: '/puby/expense', labelKey: 'expenseList' },
      { href: '/puby/expense/new/labor', labelKey: 'newLabor' },
      { href: '/puby/expense/new/vendor', labelKey: 'newVendor' },
      { href: '/puby/expense/new/card', labelKey: 'newCard' },
    ],
  },
  {
    href: '/puby/admin', icon: Users, labelKey: 'admin', adminOnly: true,
    children: [
      { href: '/puby/admin', labelKey: 'employees' },
      { href: '/puby/admin/projects', labelKey: 'projects' },
      { href: '/puby/admin/settings', labelKey: 'settings' },
    ],
  },
];

export default function PubySidebar() {
  const t = useTranslations('puby.sidebar');
  const pathname = usePathname();
  const { pubyUser } = usePubyAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-border-default bg-surface-primary transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      <div className="flex-1 py-4">
        {NAV_ITEMS.map((item) => {
          if (item.adminOnly && pubyUser?.role !== 'admin') return null;
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'text-brand-purple bg-brand-purple/10 border-r-2 border-brand-purple'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface-secondary'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{t(item.labelKey)}</span>}
              </Link>
              {!collapsed && isActive && item.children?.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className={`block pl-11 pr-4 py-2 text-sm transition-colors ${
                    pathname === child.href
                      ? 'text-brand-purple'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {t(child.labelKey)}
                </Link>
              ))}
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="p-3 text-text-muted hover:text-text-primary border-t border-border-default"
      >
        {collapsed ? <ChevronRight className="w-4 h-4 mx-auto" /> : <ChevronLeft className="w-4 h-4 mx-auto" />}
      </button>
    </aside>
  );
}
