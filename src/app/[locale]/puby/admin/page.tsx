'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { usePubyAuth } from '@/hooks/puby/useAuth';
import { useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Plus, X, Pencil } from 'lucide-react';
import type { PubyUser, PubyRole } from '@/types/puby';

export default function EmployeesPage() {
  const t = useTranslations('puby.employees');
  const { pubyUser } = usePubyAuth();
  const router = useRouter();
  const locale = useLocale();

  const [users, setUsers] = useState<PubyUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite form
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<PubyRole>('user');
  const [inviteDept, setInviteDept] = useState('');
  const [invitePosition, setInvitePosition] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');

  // Edit form
  const [editing, setEditing] = useState<PubyUser | null>(null);
  const [editRole, setEditRole] = useState<PubyRole>('user');
  const [editDept, setEditDept] = useState('');
  const [editPosition, setEditPosition] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (pubyUser && pubyUser.role !== 'admin') {
      router.push('/puby/dashboard');
    }
  }, [pubyUser, router]);

  useEffect(() => {
    const q = query(collection(db, 'puby_users'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map((d) => ({ uid: d.id, ...d.data() } as PubyUser)));
      setLoading(false);
    });
    return unsub;
  }, []);

  if (pubyUser?.role !== 'admin') return null;

  const inputClass =
    'w-full px-3 py-2 rounded-lg bg-surface-secondary border border-border-default focus:border-brand-purple focus:outline-none text-text-primary text-sm';

  async function handleInvite() {
    if (!inviteEmail || !inviteDept || !invitePosition) return;
    setInviting(true);
    setInviteMsg('');
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/puby/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole, department: inviteDept, position: invitePosition, locale }),
      });
      if (res.ok) {
        setInviteMsg(t('inviteSuccess'));
        setInviteEmail('');
        setInviteDept('');
        setInvitePosition('');
        setInviteRole('user');
        setTimeout(() => { setShowInvite(false); setInviteMsg(''); }, 1500);
      } else {
        setInviteMsg(t('inviteError'));
      }
    } catch {
      setInviteMsg(t('inviteError'));
    } finally {
      setInviting(false);
    }
  }

  function openEdit(u: PubyUser) {
    setEditing(u);
    setEditRole(u.role);
    setEditDept(u.department);
    setEditPosition(u.position);
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'puby_users', editing.uid), {
        role: editRole,
        department: editDept,
        position: editPosition,
        updatedAt: Timestamp.now(),
      });
      setEditing(null);
    } finally {
      setSaving(false);
    }
  }

  const ROLE_BADGE: Record<PubyRole, string> = {
    admin: 'bg-red-500/10 text-red-400',
    manager: 'bg-amber-500/10 text-amber-400',
    user: 'bg-surface-secondary text-text-muted',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <button
          onClick={() => { setShowInvite(true); setInviteMsg(''); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-purple to-brand-mint text-white text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          {t('invite')}
        </button>
      </div>

      {loading ? (
        <div className="text-center text-text-muted py-12">Loading...</div>
      ) : users.length === 0 ? (
        <div className="text-center text-text-muted py-12">{t('noEmployees')}</div>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.uid} className="flex items-center justify-between p-4 bg-surface-secondary rounded-lg">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${ROLE_BADGE[u.role]}`}>
                  {t(`roles.${u.role}`)}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-text-primary truncate">{u.displayName}</div>
                  <div className="text-xs text-text-muted truncate">
                    {u.email} · {u.department} · {u.position}
                  </div>
                </div>
              </div>
              {u.uid !== pubyUser?.uid && (
                <button onClick={() => openEdit(u)} className="p-2 text-text-muted hover:text-brand-purple transition-colors shrink-0 ml-2">
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowInvite(false)}>
          <div className="bg-surface-primary border border-border-default rounded-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{t('inviteEmployee')}</h2>
              <button onClick={() => setShowInvite(false)}><X className="w-5 h-5 text-text-muted" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-1">{t('email')}</label>
                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">{t('role')}</label>
                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as PubyRole)} className={inputClass}>
                  <option value="user">{t('roles.user')}</option>
                  <option value="manager">{t('roles.manager')}</option>
                  <option value="admin">{t('roles.admin')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">{t('department')}</label>
                <input type="text" value={inviteDept} onChange={(e) => setInviteDept(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">{t('position')}</label>
                <input type="text" value={invitePosition} onChange={(e) => setInvitePosition(e.target.value)} className={inputClass} />
              </div>
              {inviteMsg && (
                <p className={`text-sm ${inviteMsg === t('inviteSuccess') ? 'text-green-400' : 'text-red-400'}`}>
                  {inviteMsg}
                </p>
              )}
              <button
                onClick={handleInvite}
                disabled={inviting || !inviteEmail || !inviteDept || !invitePosition}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-brand-purple to-brand-mint text-white font-semibold disabled:opacity-50"
              >
                {inviting ? t('sending') : t('sendInvite')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setEditing(null)}>
          <div className="bg-surface-primary border border-border-default rounded-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{t('editEmployee')}</h2>
              <button onClick={() => setEditing(null)}><X className="w-5 h-5 text-text-muted" /></button>
            </div>
            <div className="mb-3 text-sm text-text-muted">{editing.displayName} ({editing.email})</div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-1">{t('role')}</label>
                <select value={editRole} onChange={(e) => setEditRole(e.target.value as PubyRole)} className={inputClass}>
                  <option value="user">{t('roles.user')}</option>
                  <option value="manager">{t('roles.manager')}</option>
                  <option value="admin">{t('roles.admin')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">{t('department')}</label>
                <input type="text" value={editDept} onChange={(e) => setEditDept(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">{t('position')}</label>
                <input type="text" value={editPosition} onChange={(e) => setEditPosition(e.target.value)} className={inputClass} />
              </div>
              <button
                onClick={handleSave}
                disabled={saving || !editDept || !editPosition}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-brand-purple to-brand-mint text-white font-semibold disabled:opacity-50"
              >
                {saving ? '...' : t('saveChanges')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
