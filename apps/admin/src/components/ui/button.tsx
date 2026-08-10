'use client';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 font-semibold whitespace-nowrap rounded-md transition-colors duration-120 ease-out-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-ink text-white hover:bg-ink-soft h-8 px-3.5 text-[13px]',
        accent: 'bg-accent text-white hover:bg-accent-hover h-8 px-3.5 text-[13px]',
        secondary: 'bg-surface-card text-ink border border-hairline hover:bg-surface-soft h-8 px-3.5 text-[13px]',
        ghost: 'text-muted hover:text-ink hover:bg-surface-soft h-8 px-2.5 text-[13px]',
        outline: 'border border-hairline text-muted hover:text-ink hover:bg-surface-soft h-8 px-2.5 text-[13px]',
        danger: 'bg-danger text-white hover:bg-danger/90 h-8 px-3.5 text-[13px]',
      },
      size: { default: '', icon: 'w-8 h-8 p-0', 'icon-sm': 'w-7 h-7 p-0' },
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
