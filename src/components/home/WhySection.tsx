'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export default function WhySection() {
  const t = useTranslations('why');

  const items = [
    { num: '01', title: t('item1Title'), desc: t('item1Desc') },
    { num: '02', title: t('item2Title'), desc: t('item2Desc') },
    { num: '03', title: t('item3Title'), desc: t('item3Desc') },
  ];

  return (
    <section className="py-28 md:py-36 px-6 md:px-12 lg:px-20 overflow-hidden relative">
      {/* Subtle grid lines */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '100px 100px',
        }}
      />

      <div className="max-w-7xl mx-auto">
        {/* Large headline */}
        <div className="max-w-4xl">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-xs font-bold tracking-[0.3em] uppercase text-brand-mint mb-6"
          >
            {t('label')}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
            className="text-[2.6rem] md:text-[4rem] lg:text-[5rem] font-bold text-text-primary leading-[1.08] tracking-[-0.04em] whitespace-pre-line"
          >
            {t('headline')}
          </motion.h2>
        </div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="mt-12 md:mt-16 h-[1px] origin-left"
          style={{
            background:
              'linear-gradient(90deg, var(--color-brand-purple), var(--color-brand-mint), transparent)',
          }}
        />

        {/* 3 differentiators */}
        <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-border-default/40">
          {items.map((item, i) => (
            <motion.div
              key={item.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.23, 1, 0.32, 1] }}
              className="py-10 md:py-0 md:px-10 first:md:pl-0 last:md:pr-0 group"
            >
              {/* Number */}
              <p
                className="text-[4rem] md:text-[5rem] lg:text-[6rem] font-black leading-none tracking-[-0.05em] select-none"
                style={{
                  background: 'linear-gradient(135deg, var(--color-brand-purple), var(--color-brand-mint))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  opacity: 0.25,
                }}
              >
                {item.num}
              </p>

              {/* Title */}
              <h3 className="mt-3 text-xl md:text-2xl font-bold text-text-primary tracking-[-0.02em] group-hover:text-brand-mint transition-colors">
                {item.title}
              </h3>

              {/* Desc */}
              <p className="mt-3 text-sm md:text-base text-text-muted leading-[1.8]">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
