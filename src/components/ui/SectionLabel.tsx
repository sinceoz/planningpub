'use client';

import { motion } from 'framer-motion';

interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

export default function SectionLabel({ children, className = '' }: SectionLabelProps) {
  return (
    <motion.div
      className={`flex items-center gap-3 mb-4 ${className}`}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <span className="h-px w-8 bg-gradient-to-r from-brand-purple to-brand-mint" />
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-mint">
        {children}
      </span>
      <span className="h-px flex-1 bg-gradient-to-r from-brand-mint/30 to-transparent" />
    </motion.div>
  );
}
