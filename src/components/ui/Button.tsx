'use client';

import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  type = 'button',
  disabled = false,
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-gradient-to-r from-brand-purple to-brand-mint text-white hover:shadow-[0_8px_25px_-8px_var(--color-brand-mint-glow)] hover:-translate-y-0.5',
    ghost: 'bg-transparent border border-border-default text-text-primary hover:border-border-hover hover:bg-bg-surface',
    outline: 'bg-transparent border border-brand-purple text-brand-purple-light hover:bg-brand-purple/10',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  return (
    <motion.button
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.button>
  );
}
