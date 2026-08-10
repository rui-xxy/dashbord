'use client';
import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

/** DESIGN.md — text-input：白底 / 40px 高 / 8px 圆角 / hairline 边框 / 聚焦转墨色 */
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'bloom h-10 w-full px-3.5 text-[14px] text-ink bg-canvas border border-hairline rounded-md',
        'placeholder:text-muted-soft transition-all duration-120 ease-out-expo',
        'disabled:bg-surface-soft disabled:text-muted',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
