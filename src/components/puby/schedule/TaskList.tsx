// src/components/puby/schedule/TaskList.tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { useTasks } from '@/hooks/puby/useTasks';
import { getTodayString, getTomorrowString } from '@/lib/puby/format';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import type { PubyTask } from '@/types/puby';

export default function TaskList() {
  const t = useTranslations('puby.schedule');
  const [tab, setTab] = useState<'today' | 'tomorrow'>('today');
  const date = tab === 'today' ? getTodayString() : getTomorrowString();
  const { tasks, loading, addTask, updateTask, deleteTask, toggleComplete } = useTasks(date);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<PubyTask | null>(null);

  function handleEdit(task: PubyTask) {
    setEditingTask(task);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingTask(null);
  }

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('myTasks')}</h1>
          {tasks.length > 0 && (
            <p className="text-sm text-text-muted mt-1">
              {completedCount}/{tasks.length} {t('completed')}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-purple to-brand-mint text-white text-sm font-semibold hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          {t('addTask')}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 p-1 bg-surface-secondary rounded-lg w-fit">
        <button
          onClick={() => setTab('today')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === 'today' ? 'bg-brand-purple text-white' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          {t('today')}
        </button>
        <button
          onClick={() => setTab('tomorrow')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === 'tomorrow' ? 'bg-brand-purple text-white' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          {t('tomorrow')}
        </button>
      </div>

      {/* Task list */}
      {loading ? (
        <div className="text-center text-text-muted py-12">{t('loading')}</div>
      ) : tasks.length === 0 ? (
        <div className="text-center text-text-muted py-12">{t('noTasks')}</div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={toggleComplete}
              onDelete={deleteTask}
              onEdit={handleEdit}
              draggable
            />
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <TaskForm
          onSubmit={addTask}
          onClose={handleCloseForm}
          editingTask={editingTask}
          onUpdate={updateTask}
        />
      )}
    </div>
  );
}
