import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md transition-colors duration-200 ease-in-out',
  {
    variants: {
      variant: {
        primary:
          'border border-solid border-transparent bg-brand text-white hover:bg-brand/80 hover:text-white focus:border-brand/80 focus:outline-none active:bg-brand/80',
        secondary:
          'border border-solid border-gray-300 bg-white text-gray-500 hover:border-gray-700 hover:text-gray-800 focus:border-gray-700 active:border-gray-700 active:bg-gray-50 active:text-gray-800',
        outline:
          'border border-gray-300/50 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-100 hover:text-gray-700 focus:border-blue-300 active:bg-gray-100 active:text-gray-700',
        ghost:
          'bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-700 focus:border-blue-300 active:bg-gray-100 active:text-gray-700 dark:text-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-100',
        danger:
          'border border-solid border-transparent bg-red-600 text-white hover:bg-red-800 hover:text-white focus:border-red-800 focus:outline-none active:bg-red-800',
      },
      size: {
        default: 'px-4 py-2',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  children?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
