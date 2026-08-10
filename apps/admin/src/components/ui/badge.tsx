import { cva, type VariantProps } from 'class-variance-authority';
import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center text-[11px] font-medium rounded-xs px-1.5 py-0.5',
  {
    variants: {
      variant: {
        neutral: 'bg-surface-panel text-ink-soft',
        accent: 'bg-accent-soft text-accent-hover',
        success: 'bg-success-soft text-success',
        warning: 'bg-warning-soft text-warning',
        danger: 'bg-danger-soft text-danger',
        pill: 'bg-surface-panel text-ink-soft rounded-full px-2',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
);

export function Badge({ className, variant, ...props }: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
