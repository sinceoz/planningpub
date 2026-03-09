'use client';

import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function GlassCard({ children, className = '', hover = true }: GlassCardProps) {
  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-lg
        bg-bg-surface border border-border-default
        backdrop-blur-xl
        ${hover ? 'gradient-border transition-all duration-400 hover:bg-bg-surface-hover hover:border-border-hover hover:-translate-y-1 hover:shadow-glass-hover' : ''}
        ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}
