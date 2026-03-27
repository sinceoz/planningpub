'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { CheckCircle, Circle } from 'lucide-react';
import Link from 'next/link';
import type { PubyTask } from '@/types/puby';
import { TASK_CATEGORIES } from '@/types/puby';

interface Props {
  tasks: PubyTask[];
  completedCount: number;
}

export default function TaskSummary({ tasks, completedCount }: Props) {
  const t = useTranslations('puby.dashboard');
  const locale = useLocale();

  return (
    <div className="bg-surface-primary border border-border-default rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-text-primary">{t('todayTasks')}</h3>
        <span className="text-xs text-text-muted">
          {t('completedOf', { done: completedCount, total: tasks.length })}
        </span>
      </div>

      {tasks.length === 0 ? (
        <p className="text-sm text-text-muted py-4 text-center">{t('noTasksToday')}</p>
      ) : (
        <ul className="space-y-2">
          {tasks.slice(0, 5).map((task) => (
            <li key={task.id} className="flex items-center gap-2">
              {task.completed
                ? <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                : <Circle className="w-4 h-4 text-text-muted shrink-0" />
              }
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: TASK_CATEGORIES[task.category]?.color }}
              />
              <span className={`text-sm truncate ${task.completed ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                {task.title}
              </span>
              <span className="text-xs text-text-muted ml-auto shrink-0">
                {task.startTime}–{task.endTime}
              </span>
            </li>
          ))}
        </ul>
      )}

      {tasks.length > 5 && (
        <Link href={`/${locale}/puby/schedule/my`} className="block text-center text-xs text-brand-purple mt-3 hover:underline">
          {t('viewAll')}
        </Link>
      )}
    </div>
  );
}
