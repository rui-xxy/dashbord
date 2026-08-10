'use client';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react';
import { cn } from '@/lib/cn';

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export const DropdownMenuContent = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'anim-pop z-50 min-w-[10rem] overflow-hidden rounded-lg bg-surface-panel border border-hairline shadow-overlay p-1',
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = 'DropdownMenuContent';

export const DropdownMenuItem = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Item>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      'flex h-9 cursor-pointer select-none items-center gap-2 rounded-sm px-2.5 text-[13px] text-body',
      'transition-colors duration-120 ease-out-expo',
      'data-[highlighted]:bg-surface-soft data-[highlighted]:text-ink data-[highlighted]:outline-none',
      className,
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = 'DropdownMenuItem';

export const DropdownMenuSeparator = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator ref={ref} className={cn('my-1 h-px bg-hairline', className)} {...props} />
));
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';
