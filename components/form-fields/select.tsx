'use client';

import * as React from 'react';

import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

export interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  /**
   * Optional CSS class name to add to the select trigger
   */
  className?: string;
}

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'focus:ring-ring relative flex h-9 w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-gray-500 placeholder:text-gray-300 focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:placeholder:text-gray-600',
      className,
    )}
    {...props}>
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));

SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

export interface SelectContentProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {
  /**
   * Optional CSS class name to add to the select content
   */
  className?: string;
  /**
   * Position of the select content
   * @default "popper"
   */
  position?: 'popper' | 'item-aligned';
}

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  SelectContentProps
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white text-gray-700 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:placeholder:text-gray-600',
        position === 'popper' &&
          'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className,
      )}
      position={position}
      {...props}>
      <SelectPrimitive.Viewport
        className={cn(
          'p-1',
          position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]',
        )}>
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));

SelectContent.displayName = SelectPrimitive.Content.displayName;

export interface SelectLabelProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label> {
  /**
   * Optional CSS class name to add to the select label
   */
  className?: string;
}

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  SelectLabelProps
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('px-2 py-1.5 text-sm font-semibold', className)}
    {...props}
  />
));

SelectLabel.displayName = SelectPrimitive.Label.displayName;

export interface SelectItemProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {
  /**
   * Optional CSS class name to add to the select item
   */
  className?: string;
}

const SelectItem = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Item>, SelectItemProps>(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        'relative flex w-full cursor-default cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-blue-50 focus:text-blue-700 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:text-gray-400 dark:focus:bg-gray-800 dark:focus:text-gray-200',
        className,
      )}
      {...props}>
      <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  ),
);

SelectItem.displayName = SelectPrimitive.Item.displayName;

export interface SelectSeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator> {
  /**
   * Optional CSS class name to add to the select separator
   */
  className?: string;
}

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  SelectSeparatorProps
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-gray-300', className)}
    {...props}
  />
));

SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
};
