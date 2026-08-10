'use client';
import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'bloom h-8 w-full px-2.5 text-[13px] text-ink bg-surface-card border border-hairline rounded-md',
        'placeholder:text-muted-soft transition-all duration-120 ease-out-expo',
        'disabled:bg-surface-soft disabled:text-muted',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
