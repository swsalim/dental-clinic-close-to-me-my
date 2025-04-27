import React from 'react';

import { cn } from '@/lib/utils';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function Container({ className, children, ...props }: ContainerProps) {
  return (
    <div
      className={cn('max-w-8xl relative mx-auto w-full px-6 py-8 sm:px-8', className)}
      {...props}>
      {children}
    </div>
  );
}
