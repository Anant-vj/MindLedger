import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function Button({ className, variant = 'primary', ...props }) {
  const variants = {
    primary: 'px-4 py-2 bg-[#6366F1] text-white rounded-xl font-medium hover:bg-[#4F46E5] shadow-[0_2px_10px_rgba(99,102,241,0.2)] transition-all duration-200 active:scale-95 disabled:opacity-50',
    secondary: 'px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all duration-200 active:scale-95 disabled:opacity-50 dark:bg-white/5 dark:text-[#9CA3AF] dark:hover:bg-white/10 dark:hover:text-[#F9FAFB]',
    outline: 'px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-all duration-200 active:scale-95 disabled:opacity-50 dark:border-[#374151] dark:text-[#9CA3AF] dark:hover:bg-[#111827] dark:hover:border-[#4b5563]',
    ghost: 'px-4 py-2 text-slate-600 rounded-xl font-medium hover:bg-slate-100 transition-all duration-200 active:scale-95 disabled:opacity-50 dark:text-[#9CA3AF] dark:hover:text-[#F9FAFB] dark:hover:bg-white/5',
    danger: 'px-4 py-2 bg-[#EF4444] text-white rounded-xl font-medium hover:bg-red-600 shadow-[0_2px_10px_rgba(239,68,68,0.2)] transition-all duration-200 active:scale-95 disabled:opacity-50',
  };

  return (
    <button 
      className={cn(variants[variant], className)} 
      {...props} 
    />
  );
}

export function Input({ className, ...props }) {
  return (
    <input 
      className={cn('input-field', className)} 
      {...props} 
    />
  );
}

export function Card({ className, children, glass = false }) {
  return (
    <div className={cn(
      'p-6 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-[#111827] dark:border-[#374151] dark:shadow-xl dark:hover:border-[#4b5563]',
      glass && 'glass-card dark:glass-card-dark',
      className
    )}>
      {children}
    </div>
  );
}
