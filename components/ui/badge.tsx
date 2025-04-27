import { HTMLAttributes } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'status font-regular inline-flex items-center rounded-md px-2 py-1 text-xs font-medium uppercase tracking-wide shadow',
  {
    variants: {
      variant: {
        default: 'bg-gray-200 text-gray-900',
        zinc: 'bg-gray-50 font-medium text-gray-700',
        indigo: 'bg-indigo-50 text-indigo-700 font-medium',
        blue: 'bg-blue-50 font-medium text-blue-700 hover:bg-blue-200/50',
        red: 'bg-red-50 font-medium text-red-700',
        green: 'bg-green-50 font-medium text-green-700',
        yellow: 'bg-yellow-50 font-medium text-yellow-700',
        outline: 'bg-gray-50 capitalize text-gray-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ variant, className, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
