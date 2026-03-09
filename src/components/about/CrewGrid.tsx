'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import SectionLabel from '@/components/ui/SectionLabel';
import { CREW_MEMBERS } from '@/lib/constants';
import { User } from 'lucide-react';

export default function CrewGrid() {
  const t = useTranslations('about.crew');
  const locale = useLocale();

  return (
    <section className="py-24 px-6 bg-bg-card/50">
      <div className="max-w-5xl mx-auto">
        <SectionLabel>{t('label')}</SectionLabel>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-text-primary mt-4 mb-12"
        >
          {t('title')}
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {CREW_MEMBERS.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center group"
            >
              {/* 프로필 이미지 플레이스홀더 */}
              <div className="w-28 h-28 mx-auto rounded-full bg-bg-surface border border-border-default flex items-center justify-center group-hover:border-brand-purple/30 transition-colors">
                <User size={36} className="text-text-dim" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-text-primary">
                {locale === 'ko' ? member.name : member.nameEn}
              </h3>
              <p className="text-sm text-text-muted mt-1">
                {locale === 'ko' ? member.role : member.roleEn}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
