'use client';

import { useTranslations } from 'next-intl';
import { ListChecks, Clock, Users, Wallet } from 'lucide-react';
import { usePubyAuth } from '@/hooks/puby/useAuth';
import { useDashboard } from '@/hooks/puby/useDashboard';
import StatCard from '@/components/puby/dashboard/StatCard';
import TaskSummary from '@/components/puby/dashboard/TaskSummary';
import PendingExpenses from '@/components/puby/dashboard/PendingExpenses';
import RecentActivity from '@/components/puby/dashboard/RecentActivity';
import MonthlyExpenseSummary from '@/components/puby/dashboard/MonthlyExpenseSummary';

export default function DashboardPage() {
  const t = useTranslations('puby.dashboard');
  const { pubyUser } = usePubyAuth();
  const {
    todayTasks, completedTasks, myPendingExpenses, pendingApprovals,
    recentExpenses, monthlyTotal, monthlyByProject, allUsers, projects, loading,
  } = useDashboard();

  if (!pubyUser) return null;

  const isAdmin = pubyUser.role === 'admin';
  const isManagerOrAdmin = pubyUser.role === 'manager' || isAdmin;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-text-primary">
        {t('welcome', { name: pubyUser.displayName })}
      </h1>

      {/* Stat cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={ListChecks}
          label={t('todayTasks')}
          value={`${completedTasks}/${todayTasks.length}`}
          accent="text-blue-400"
        />
        <StatCard
          icon={Clock}
          label={t('myPendingExpenses')}
          value={myPendingExpenses.length}
          accent="text-amber-400"
        />
        {isManagerOrAdmin && (
          <StatCard
            icon={Clock}
            label={t('pendingExpenses')}
            value={pendingApprovals.length}
            sub={pendingApprovals.length > 0 ? t('approvalWaiting', { count: pendingApprovals.length }) : undefined}
            accent="text-red-400"
          />
        )}
        {isAdmin && (
          <StatCard
            icon={Wallet}
            label={t('monthlyExpense')}
            value={`${(monthlyTotal / 10000).toFixed(0)}만원`}
            accent="text-brand-mint"
          />
        )}
        {isAdmin && (
          <StatCard
            icon={Users}
            label={t('employeeOverview')}
            value={allUsers.length}
            sub={t('totalEmployees')}
            accent="text-brand-purple"
          />
        )}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left column */}
        <div className="space-y-4">
          <TaskSummary tasks={todayTasks} completedCount={completedTasks} />
          <PendingExpenses expenses={myPendingExpenses} title={t('myPendingExpenses')} />
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {isManagerOrAdmin && pendingApprovals.length > 0 && (
            <PendingExpenses expenses={pendingApprovals} title={t('pendingExpenses')} />
          )}
          <RecentActivity expenses={recentExpenses} />
        </div>
      </div>

      {/* Admin: Monthly expense breakdown */}
      {isAdmin && (
        <MonthlyExpenseSummary
          total={monthlyTotal}
          byProject={monthlyByProject}
          projects={projects}
        />
      )}
    </div>
  );
}
