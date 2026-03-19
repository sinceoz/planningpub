'use client';

import { useState, useEffect } from 'react';
import AdminPortfolio from '@/components/admin/AdminPortfolio';
import AdminPartners from '@/components/admin/AdminPartners';
import { LogOut } from 'lucide-react';

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'pub=8528';

const TABS = [
  { key: 'portfolio', label: '포트폴리오' },
  { key: 'partners', label: '파트너' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [pwError, setPwError] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('portfolio');

  useEffect(() => {
    if (
      localStorage.getItem('admin_authed') === 'true' ||
      sessionStorage.getItem('admin_authed') === 'true'
    ) {
      setAuthed(true);
    }
  }, []);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      sessionStorage.setItem('admin_authed', 'true');
      if (rememberMe) {
        localStorage.setItem('admin_authed', 'true');
      }
      setPwError(false);
    } else {
      setPwError(true);
    }
  };

  const handleLogout = () => {
    setAuthed(false);
    sessionStorage.removeItem('admin_authed');
    localStorage.removeItem('admin_authed');
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-dark px-6">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Admin</h1>
          <p className="text-sm text-text-muted mb-6">관리자 비밀번호를 입력하세요.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPwError(false);
              }}
              placeholder="비밀번호"
              className="w-full px-4 py-3 rounded-lg bg-bg-card border border-border-default text-text-primary placeholder:text-text-dim focus:outline-none focus:border-brand-purple"
              autoFocus
            />
            {pwError && (
              <p className="text-error text-sm mt-2">비밀번호가 일치하지 않습니다.</p>
            )}
            <label className="flex items-center gap-2 mt-3 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-border-default accent-brand-purple"
              />
              <span className="text-sm text-text-muted">자동 로그인</span>
            </label>
            <button
              type="submit"
              className="w-full mt-4 px-4 py-3 rounded-lg bg-brand-purple text-white font-semibold hover:bg-brand-purple-light transition-colors cursor-pointer"
            >
              로그인
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Tab bar + Logout */}
        <div className="flex items-center justify-between mb-6 border-b border-border-default">
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === tab.key
                    ? 'text-brand-mint border-b-2 border-brand-mint -mb-px'
                    : 'text-text-dim hover:text-text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-border-default text-text-dim hover:text-text-primary transition-all cursor-pointer -mt-1"
            title="로그아웃"
          >
            <LogOut size={15} />
          </button>
        </div>

        {/* Tab content */}
        {activeTab === 'portfolio' && <AdminPortfolio />}
        {activeTab === 'partners' && <AdminPartners />}
      </div>
    </div>
  );
}
