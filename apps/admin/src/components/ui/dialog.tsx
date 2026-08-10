'use client';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react';
import { cn } from '@/lib/cn';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export const DialogContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="anim-overlay fixed inset-0 z-50 bg-black/40 backdrop-blur-[4px]" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'anim-dialog fixed left-1/2 top-1/2 z-50 w-[440px]',
        'bg-surface-card rounded-xl border border-hairline shadow-overlay',
        'focus:outline-none',
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 text-muted-soft hover:text-ink transition-colors">
        <X className="w-4 h-4" />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = 'DialogContent';

export function DialogHeader({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  return <div className={cn('px-5 py-4 border-b border-hairline-soft', className)} {...props} />;
}

export function DialogTitle({ className, ...props }: ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn('text-[15px] font-semibold text-ink', className)} {...props} />;
}

export function DialogDescription({ className, ...props }: ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn('text-[12px] text-muted mt-0.5', className)} {...props} />;
}

export function DialogFooter({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  return <div className={cn('flex items-center justify-end gap-2 px-5 py-3.5 border-t border-hairline-soft', className)} {...props} />;
}

export function DialogBody({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  return <div className={cn('px-5 py-4 space-y-3.5', className)} {...props} />;
}
