"use client";

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: number; // px
  thickness?: number; // border width px
  className?: string;
  colorClassName?: string; // e.g., 'border-blue-500'
}

export default function LoadingSpinner({
  size = 24,
  thickness = 2,
  className,
  colorClassName = 'border-current',
}: LoadingSpinnerProps) {
  const style: React.CSSProperties = {
    width: size,
    height: size,
    borderWidth: thickness,
  };
  return (
    <div
      className={cn(
        'rounded-full animate-spin border-solid border-t-transparent',
        colorClassName,
        className,
      )}
      style={style}
      aria-label="Loading"
      role="status"
    />
  );
}


