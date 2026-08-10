'use client';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

/**
 * DESIGN.md — button-primary：近黑 #111 / 白字 / 40px 高 / 8px 圆角 / Inter 14px 600
 * 行动层保持单色，不用任何 accent 色。
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 font-semibold whitespace-nowrap rounded-md transition-colors duration-120 ease-out-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/15 disabled:bg-surface-strong disabled:text-muted disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-ink text-white hover:bg-ink-soft h-10 px-5 text-[14px]',
        secondary: 'bg-canvas text-ink border border-hairline hover:bg-surface-soft h-10 px-5 text-[14px]',
        ghost: 'text-muted hover:text-ink hover:bg-surface-soft h-10 px-4 text-[14px]',
        outline: 'border border-hairline text-muted hover:text-ink hover:bg-surface-soft h-10 px-4 text-[14px]',
        danger: 'bg-danger text-white hover:bg-danger/90 h-10 px-5 text-[14px]',
      },
      size: {
        default: '',
        sm: 'h-8 px-3.5 text-[13px]',
        icon: 'w-10 h-10 p-0',
        'icon-sm': 'w-7 h-7 p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />;
  },
);
Button.displayName = 'Button';
export { buttonVariants };
