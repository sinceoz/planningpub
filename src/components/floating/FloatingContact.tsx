'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';

export default function FloatingContact() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const t = useTranslations('floating');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      message: formData.get('message') as string,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          organization: '',
          email: data.email,
          projectName: '',
          date: '',
          details: data.message,
          budget: '',
        }),
      });

      if (res.ok) {
        setStatus('success');
        setTimeout(() => {
          setOpen(false);
          setStatus('idle');
        }, 2000);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      {/* 플로팅 버튼 */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-brand-purple to-brand-mint text-white flex items-center justify-center shadow-lg hover:shadow-[0_8px_30px_-5px_var(--color-brand-mint-glow)] transition-shadow cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="문의하기"
      >
        <MessageCircle size={24} />
      </motion.button>

      {/* 모달 */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-24 right-6 z-50 w-[340px] glass rounded-xl p-6 shadow-glass"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-text-primary">{t('title')}</h3>
                  <p className="text-xs text-text-muted mt-0.5">{t('subtitle')}</p>
                </div>
                <button onClick={() => setOpen(false)} className="p-1 hover:text-brand-mint transition-colors cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              {status === 'success' ? (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">✓</div>
                  <p className="text-brand-mint font-semibold">{t('success')}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <input
                    name="name"
                    required
                    placeholder={t('name')}
                    className="w-full px-3 py-2.5 text-sm bg-bg-card border border-border-default rounded-md text-text-primary placeholder:text-text-dim focus:outline-none focus:border-brand-purple transition-colors"
                  />
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder={t('email')}
                    className="w-full px-3 py-2.5 text-sm bg-bg-card border border-border-default rounded-md text-text-primary placeholder:text-text-dim focus:outline-none focus:border-brand-purple transition-colors"
                  />
                  <textarea
                    name="message"
                    required
                    rows={3}
                    placeholder={t('message')}
                    className="w-full px-3 py-2.5 text-sm bg-bg-card border border-border-default rounded-md text-text-primary placeholder:text-text-dim focus:outline-none focus:border-brand-purple transition-colors resize-none"
                  />
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full py-2.5 text-sm font-semibold bg-gradient-to-r from-brand-purple to-brand-mint text-white rounded-md flex items-center justify-center gap-2 hover:shadow-[0_8px_25px_-8px_var(--color-brand-mint-glow)] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {status === 'sending' ? t('sending') : (
                      <>
                        <Send size={14} />
                        {t('submit')}
                      </>
                    )}
                  </button>
                  {status === 'error' && (
                    <p className="text-xs text-error text-center">{t('error')}</p>
                  )}
                </form>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
