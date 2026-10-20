import Link from 'next/link';

import { cn } from '@/lib/utils';

import { buttonVariants } from '@/components/ui/button';
import Container from '@/components/ui/container';

export function HomeCtaStrip() {
  return (
    <section className="bg-gray-50 pb-16 dark:border-gray-800 dark:bg-gray-950/40">
      <Container className="dark:bg-blue-950 flex min-w-0 flex-col gap-6 overflow-hidden rounded-2xl bg-blue-100 py-8 md:flex-row md:items-center md:justify-between md:py-10">
        <div className="min-w-0 max-w-xl">
          <h2 className="text-balance font-display text-2xl font-bold text-blue-900 md:text-3xl dark:text-blue-50">
            Own a clinic? Get in front of patients searching today.
          </h2>
          <p className="mt-2 text-base text-blue-600 dark:text-blue-300">
            List your practice or upgrade for premium placement across the directory.
          </p>
        </div>
        <div className="flex min-w-0 shrink-0 flex-col gap-3 sm:flex-row">
          <Link
            href="/submit"
            prefetch={false}
            className={cn(
              buttonVariants({ variant: 'primary', size: 'large' }),
              'inline-flex min-h-11 w-full items-center justify-center sm:w-auto',
            )}>
            List your clinic for RM99
          </Link>
        </div>
      </Container>
    </section>
  );
}
