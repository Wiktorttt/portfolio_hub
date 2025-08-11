'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PanelCardProps {
  id: string;
  name: string;
  description: string;
  icon?: React.ReactNode;
  gradient: string;
  disabled?: boolean;
}

export default function PanelCard({ id, name, description, icon, gradient, disabled = false }: PanelCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled) {
        window.location.href = `/${id}`;
      }
    }
  };

  return (
    <Link 
      href={disabled ? "#" : `/${id}`} 
      onClick={disabled ? (e) => e.preventDefault() : undefined}
      onKeyDown={handleKeyDown}
      aria-label={`Navigate to ${name} - ${description}`}
      aria-disabled={disabled}
    >
      <div 
        className={cn(
          "group cursor-pointer bg-slate-900/50 border transition-all duration-300 rounded-lg",
          disabled 
            ? "border-red-500/30 opacity-50 cursor-not-allowed" 
            : "border-slate-800 hover:border-slate-700 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        )}
        role="button"
        tabIndex={disabled ? -1 : 0}
      >
        <div className="p-6 flex flex-col items-center h-56">
          <div className={cn(
            "w-16 h-16 rounded-2xl bg-gradient-to-br",
            gradient,
            "flex items-center justify-center",
            disabled ? "" : "group-hover:scale-110",
            "transition-transform duration-300"
          )}>
            <div className={cn("text-white", disabled && "opacity-50")}>
              {icon}
            </div>
          </div>
          
          <h3 className={cn(
            "text-xl font-bold mt-4 text-center transition-colors duration-300",
            disabled 
              ? "text-slate-500" 
              : "text-slate-100 group-hover:text-emerald-400"
          )}>
            {name}
          </h3>
          
          <p className={cn(
            "text-center mt-2 text-sm leading-relaxed transition-colors duration-300",
            disabled 
              ? "text-slate-600" 
              : "text-slate-400 group-hover:text-emerald-400/80"
          )}>
            {description}
          </p>
          
          <div className="mt-auto pt-4">
            <div className={cn(
              "w-8 h-1 bg-gradient-to-r from-transparent to-transparent transition-colors duration-300",
              disabled 
                ? "via-red-500/50" 
                : "via-slate-600 group-hover:via-emerald-500"
            )}></div>
          </div>
        </div>
      </div>
    </Link>
  );
} 