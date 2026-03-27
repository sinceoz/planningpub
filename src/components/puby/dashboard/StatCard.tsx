'use client';

import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}

export default function StatCard({ icon: Icon, label, value, sub, accent = 'text-brand-purple' }: StatCardProps) {
  return (
    <div className="bg-surface-primary border border-border-default rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-surface-secondary ${accent}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-text-muted">{label}</p>
          <p className="text-xl font-bold text-text-primary">{value}</p>
          {sub && <p className="text-xs text-text-muted">{sub}</p>}
        </div>
      </div>
    </div>
  );
}
