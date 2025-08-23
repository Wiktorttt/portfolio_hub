"use client";

import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  description: string;
  accent: 'blue' | 'violet' | 'indigo' | 'teal' | 'orange' | 'cyan' | 'pink';
  icon: React.ReactNode;
  isDark?: boolean;
}

const accentBg: Record<HeaderProps['accent'], string> = {
  blue: 'bg-blue-50 ring-blue-100',
  violet: 'bg-violet-50 ring-violet-100',
  indigo: 'bg-indigo-50 ring-indigo-100',
  teal: 'bg-teal-50 ring-teal-100',
  orange: 'bg-orange-50 ring-orange-100',
  cyan: 'bg-cyan-50 ring-cyan-100',
  pink: 'bg-pink-50 ring-pink-100',
};

const accentSolid: Record<HeaderProps['accent'], string> = {
  blue: 'bg-blue-600',
  violet: 'bg-violet-600',
  indigo: 'bg-indigo-600',
  teal: 'bg-teal-600',
  orange: 'bg-orange-500',
  cyan: 'bg-cyan-600',
  pink: 'bg-pink-500',
};

export default function Header({ title, description, accent, icon, isDark }: HeaderProps) {
  return (
    <div className={cn('relative overflow-hidden rounded-2xl p-6 shadow-sm ring-1', isDark ? 'bg-slate-900 ring-slate-800' : accentBg[accent])}>
      <div className="relative flex items-center gap-4">
        <div className={cn('h-16 w-16 rounded-xl flex items-center justify-center', isDark ? 'bg-slate-800' : accentSolid[accent])}>
          <div className="text-white">{icon}</div>
        </div>
        <div>
          <h1 className={cn('text-3xl sm:text-4xl font-bold mb-1', isDark ? 'text-slate-100' : 'text-slate-900')}>{title}</h1>
          <p className={cn('text-base sm:text-lg', isDark ? 'text-slate-400' : 'text-slate-600')}>{description}</p>
        </div>
      </div>
    </div>
  );
}


