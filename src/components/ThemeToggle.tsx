"use client";

import { cn } from '@/lib/utils';
import useTheme from '@/lib/useTheme';

interface ThemeToggleProps {
  position?: 'fixed-bottom-right' | 'inline';
}

export default function ThemeToggle({ position = 'fixed-bottom-right' }: ThemeToggleProps) {
  const { isDark, toggle } = useTheme();
  const Button = (
    <button
      onClick={toggle}
      className={cn(
        'flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-300 shadow-sm',
        isDark ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
      )}
      aria-label="Toggle dark mode"
    >
      <span className="text-sm font-medium">{isDark ? 'Ciemny' : 'Jasny'}</span>
      <div className={cn('w-3 h-3 rounded-full', isDark ? 'bg-indigo-500' : 'bg-yellow-400')} />
    </button>
  );

  if (position === 'fixed-bottom-right') {
    return <div className="fixed bottom-4 right-4 z-50">{Button}</div>;
  }
  return Button;
}


