// src/components/puby/schedule/TeamBoardMobile.tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { TASK_CATEGORIES } from '@/types/puby';
import type { PubyTask, PubyUser } from '@/types/puby';

interface TeamBoardMobileProps {
  schedules: { user: PubyUser; tasks: PubyTask[] }[];
}

export default function TeamBoardMobile({ schedules }: TeamBoardMobileProps) {
  const t = useTranslations('puby.schedule');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggleExpand(uid: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  }

  return (
    <div className="space-y-2">
      {schedules.map(({ user, tasks }) => {
        const isOpen = expanded.has(user.uid);
        return (
          <div key={user.uid} className="border border-border-default rounded-lg overflow-hidden">
            <button
              onClick={() => toggleExpand(user.uid)}
              className="w-full flex items-center justify-between p-3 bg-surface-secondary/50 hover:bg-surface-secondary transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text-primary">{user.displayName}</span>
                <span className="text-xs text-text-muted">{user.department}</span>
                <span className="text-xs text-text-muted bg-surface-secondary px-1.5 py-0.5 rounded">
                  {tasks.length}건
                </span>
              </div>
              {isOpen ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
            </button>

            {isOpen && (
              <div className="p-2 space-y-1.5">
                {tasks.length === 0 ? (
                  <p className="text-xs text-text-muted text-center py-2">{t('noTasks')}</p>
                ) : (
                  tasks.map((task) => {
                    const category = TASK_CATEGORIES[task.category];
                    return (
                      <div
                        key={task.id}
                        className={`flex items-center gap-2 p-2 rounded-md ${task.completed ? 'opacity-50' : ''}`}
                      >
                        <div className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: task.color || category?.color }} />
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm truncate ${task.completed ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                            {task.title}
                          </div>
                          <div className="text-xs text-text-muted">
                            {task.startTime} – {task.endTime}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}

      {schedules.length === 0 && (
        <div className="text-center text-text-muted py-12">{t('noTasks')}</div>
      )}
    </div>
  );
}
