import { ComponentPropsWithoutRef, ElementType } from 'react';

import { cn } from '@/lib/utils';

interface ProseProps<T extends ElementType = 'div'> {
  as?: T;
  className?: string;
}

export default function Prose<T extends ElementType = 'div'>({
  as: Component = 'div' as T,
  className,
  ...props
}: ProseProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof ProseProps<T>>) {
  return (
    <Component
      className={cn(
        className,
        'prose prose-zinc max-w-none',
        // headings
        'prose-headings:relative prose-headings:scroll-mt-[6rem] prose-headings:capitalize prose-h1:mb-4 prose-h1:font-semibold prose-h2:text-xl prose-h2:font-medium prose-h3:text-lg prose-h3:font-medium md:prose-h2:text-2xl md:prose-h3:text-xl',
        // lead
        'prose-lead:text-gray-500',
        // links
        'prose-a:border-b-2 prose-a:border-transparent prose-a:font-normal prose-a:text-blue-600 prose-a:no-underline prose-a:duration-200 hover:prose-a:border-blue-500',
        // link underline
        'prose-a:no-underline prose-a:shadow-[inset_0_-2px_0_0_var(--tw-prose-background,#fff),inset_0_calc(-1*(var(--tw-prose-underline-size,4px)+2px))_0_0_var(--tw-prose-underline,theme(colors.sky.300))] hover:prose-a:[--tw-prose-underline-size:6px]',
        // pre
        'prose-pre:rounded-xl prose-pre:bg-gray-900 prose-pre:shadow-lg',
        'break-words',
      )}
      {...(props as any)}
    />
  );
}
