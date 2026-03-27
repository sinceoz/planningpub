'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePubyAuth } from '@/hooks/puby/useAuth';
import { useProjects } from '@/hooks/puby/useProjects';
import { Plus, X, Pencil } from 'lucide-react';
import type { PubyProject, ApprovalFlow, ProjectStatus } from '@/types/puby';

export default function ProjectsPage() {
  const t = useTranslations('puby.projects');
  const { pubyUser } = usePubyAuth();
  const { projects, loading, createProject, updateProject, deleteProject } = useProjects();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PubyProject | null>(null);

  const [name, setName] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('proposal');
  const [approvalFlow, setApprovalFlow] = useState<ApprovalFlow>('direct');
  const [managerId, setManagerId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function openNew() {
    setEditing(null); setName(''); setStatus('proposal'); setApprovalFlow('direct'); setManagerId('');
    setShowForm(true);
  }

  function openEdit(p: PubyProject) {
    setEditing(p); setName(p.name); setStatus(p.status); setApprovalFlow(p.approvalFlow); setManagerId(p.managerId || '');
    setShowForm(true);
  }

  async function handleSubmit() {
    if (!pubyUser || !name) return;
    setSubmitting(true);
    try {
      const data: Record<string, any> = { name, status, approvalFlow, members: [], createdBy: pubyUser.uid };
      if (approvalFlow === 'two_step' && managerId) {
        data.managerId = managerId;
      }
      if (editing) {
        if (approvalFlow !== 'two_step') data.managerId = '';
        await updateProject(editing.id, data);
      } else {
        await createProject(data as any);
      }
      setShowForm(false);
    } finally { setSubmitting(false); }
  }

  if (pubyUser?.role !== 'admin') return null;

  const inputClass = "w-full px-3 py-2 rounded-lg bg-surface-secondary border border-border-default focus:border-brand-purple focus:outline-none text-text-primary text-sm";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <button onClick={openNew} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-purple to-brand-mint text-white text-sm font-semibold">
          <Plus className="w-4 h-4" />{t('addProject')}
        </button>
      </div>

      {loading ? <div className="text-center text-text-muted py-12">Loading...</div> : projects.length === 0 ? (
        <div className="text-center text-text-muted py-12">{t('noProjects')}</div>
      ) : (
        <div className="space-y-2">
          {projects.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-4 bg-surface-secondary rounded-lg">
              <div>
                <div className="text-sm font-medium text-text-primary">{p.name}</div>
                <div className="text-xs text-text-muted mt-0.5">
                  {t(`statuses.${p.status}`)} · {p.approvalFlow === 'two_step' ? t('twoStep') : t('direct')}
                </div>
              </div>
              <button onClick={() => openEdit(p)} className="p-2 text-text-muted hover:text-brand-purple transition-colors">
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-surface-primary border border-border-default rounded-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editing ? t('editProject') : t('addProject')}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-text-muted" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-sm text-text-muted mb-1">{t('name')}</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} /></div>
              <div><label className="block text-sm text-text-muted mb-1">{t('status')}</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)} className={inputClass}>
                  <option value="proposal">{t('statuses.proposal')}</option>
                  <option value="in_progress">{t('statuses.in_progress')}</option>
                  <option value="completed">{t('statuses.completed')}</option>
                </select>
              </div>
              <div><label className="block text-sm text-text-muted mb-1">{t('approvalFlow')}</label>
                <select value={approvalFlow} onChange={(e) => setApprovalFlow(e.target.value as ApprovalFlow)} className={inputClass}>
                  <option value="direct">{t('direct')}</option>
                  <option value="two_step">{t('twoStep')}</option>
                </select>
              </div>
              {approvalFlow === 'two_step' && (
                <div><label className="block text-sm text-text-muted mb-1">{t('manager')}</label>
                  <input type="text" value={managerId} onChange={(e) => setManagerId(e.target.value)} placeholder="Manager UID" className={inputClass} />
                </div>
              )}
              <button onClick={handleSubmit} disabled={submitting || !name}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-brand-purple to-brand-mint text-white font-semibold disabled:opacity-50">
                {submitting ? '...' : editing ? t('editProject') : t('addProject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
