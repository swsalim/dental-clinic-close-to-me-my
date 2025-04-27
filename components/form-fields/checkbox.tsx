'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  /**
   * Optional CSS class name to add to the checkbox
   */
  className?: string;
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'focus-visible:ring-ring peer h-4 w-4 shrink-0 rounded-sm border border-gray-700 shadow focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-gray-700 data-[state=checked]:text-gray-100',
      className,
    )}
    {...props}>
    <CheckboxPrimitive.Indicator className={cn('flex items-center justify-center text-current')}>
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
