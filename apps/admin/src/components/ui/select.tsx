'use client';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react';
import { cn } from '@/lib/cn';

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export const SelectTrigger = forwardRef<
  ElementRef<typeof SelectPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'group flex h-8 w-full items-center justify-between gap-2 px-2.5 text-[13px] text-ink',
      'bg-surface-card border border-hairline rounded-md shadow-[0_1px_2px_rgba(0,0,0,0.03)]',
      'data-[placeholder]:text-muted-soft',
      'hover:border-surface-active',
      'focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(37,99,235,0.24)]',
      'data-[state=open]:border-accent data-[state=open]:shadow-[0_0_0_3px_rgba(37,99,235,0.24)]',
      'transition-all duration-120 ease-out-expo disabled:opacity-50 disabled:pointer-events-none',
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="w-3.5 h-3.5 text-muted-soft transition-transform duration-200 ease-out-expo group-data-[state=open]:rotate-180" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = 'SelectTrigger';

export const SelectContent = forwardRef<
  ElementRef<typeof SelectPrimitive.Content>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', sideOffset = 4, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      position={position}
      sideOffset={sideOffset}
      className={cn(
        'anim-pop relative z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden',
        'rounded-lg bg-surface-card border border-hairline shadow-overlay',
        className,
      )}
      {...props}
    >
      <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = 'SelectContent';

export const SelectItem = forwardRef<
  ElementRef<typeof SelectPrimitive.Item>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex h-8 cursor-pointer select-none items-center rounded-sm pl-7 pr-2 text-[13px] text-body',
      'transition-colors duration-120 ease-out-expo',
      'data-[highlighted]:bg-surface-soft data-[highlighted]:text-ink data-[highlighted]:outline-none',
      'data-[state=checked]:text-ink data-[state=checked]:font-medium',
      'data-[disabled]:opacity-50 data-[disabled]:pointer-events-none',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="w-3.5 h-3.5 text-accent" strokeWidth={2.5} />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = 'SelectItem';
