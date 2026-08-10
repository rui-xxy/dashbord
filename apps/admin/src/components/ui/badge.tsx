import { cva, type VariantProps } from 'class-variance-authority';
import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

/** DESIGN.md — badge-pill：胶囊圆角 / caption 13px 500 / 浅灰或 pastel 底 */
const badgeVariants = cva(
  'inline-flex items-center text-caption rounded-full px-2.5 py-0.5',
  {
    variants: {
      variant: {
        neutral: 'bg-surface-card text-ink',
        ink: 'bg-ink text-white',
        accent: 'bg-accent-faint text-accent-hover',
        success: 'bg-success-soft text-success',
        warning: 'bg-warning-soft text-warning',
        danger: 'bg-danger-soft text-danger',
        // pastel 色组（角色标签等分类场景）
        orange: 'bg-badge-orange/15 text-[#C2410C]',
        pink: 'bg-badge-pink/15 text-[#BE185D]',
        violet: 'bg-badge-violet/15 text-[#6D28D9]',
        emerald: 'bg-badge-emerald/20 text-[#047857]',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
);

export function Badge({ className, variant, ...props }: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
