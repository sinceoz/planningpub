// src/components/puby/schedule/TaskCard.tsx
'use client';

import { useTranslations } from 'next-intl';
import { Check, Trash2, GripVertical } from 'lucide-react';
import type { PubyTask } from '@/types/puby';
import { TASK_CATEGORIES } from '@/types/puby';

interface TaskCardProps {
  task: PubyTask;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: PubyTask) => void;
  draggable?: boolean;
}

export default function TaskCard({ task, onToggleComplete, onDelete, onEdit, draggable }: TaskCardProps) {
  const t = useTranslations('puby.schedule');
  const category = TASK_CATEGORIES[task.category];

  return (
    <div
      className={`group flex items-center gap-3 p-3 rounded-lg border transition-all ${
        task.completed
          ? 'bg-surface-secondary/50 border-border-default opacity-60'
          : 'bg-surface-secondary border-border-default hover:border-brand-purple/30'
      }`}
    >
      {draggable && (
        <GripVertical className="w-4 h-4 text-text-muted cursor-grab shrink-0" />
      )}

      {/* Category color indicator */}
      <div
        className="w-1 h-10 rounded-full shrink-0"
        style={{ backgroundColor: task.color || category?.color || '#6366f1' }}
      />

      {/* Content */}
      <button
        className="flex-1 text-left min-w-0"
        onClick={() => onEdit(task)}
      >
        <div className={`text-sm font-medium truncate ${task.completed ? 'line-through text-text-muted' : 'text-text-primary'}`}>
          {task.title}
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
          <span>{task.startTime} – {task.endTime}</span>
          <span className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: `${task.color || category?.color}20`, color: task.color || category?.color }}>
            {category?.label || task.category}
          </span>
        </div>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onToggleComplete(task.id, task.completed)}
          className={`p-1.5 rounded-md transition-colors ${
            task.completed
              ? 'text-green-400 bg-green-400/10'
              : 'text-text-muted hover:text-green-400 hover:bg-green-400/10'
          }`}
          aria-label={t('completed')}
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-1.5 rounded-md text-text-muted hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all"
          aria-label={t('delete')}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
