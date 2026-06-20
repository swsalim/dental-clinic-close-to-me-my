import Link from 'next/link';

import { ArrowRightIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

import { buttonVariants } from '@/components/ui/button';
import Container from '@/components/ui/container';

export function HomeCtaStrip() {
  return (
    <section className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/40">
      <Container className="flex min-w-0 flex-col gap-6 py-12 md:flex-row md:items-center md:justify-between md:py-14">
        <div className="min-w-0 max-w-xl">
          <h2 className="font-display text-balance text-2xl font-bold text-gray-900 md:text-3xl dark:text-gray-50">
            Own a clinic? Get in front of patients searching today.
          </h2>
          <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
            List your practice or upgrade for premium placement across the directory.
          </p>
        </div>
        <div className="flex min-w-0 shrink-0 flex-col gap-3 sm:flex-row">
          <Link
            href="/submit"
            prefetch={false}
            className={cn(
              buttonVariants({ variant: 'outline', size: 'large' }),
              'inline-flex min-h-11 w-full items-center justify-center sm:w-auto',
            )}>
            Submit listing
          </Link>
          <Link
            href="/advertise-with-us"
            prefetch={false}
            className={cn(
              buttonVariants({ variant: 'primary', size: 'large' }),
              'inline-flex min-h-11 w-full items-center justify-center sm:w-auto',
            )}>
            Advertise with us
            <ArrowRightIcon className="ms-2 size-4" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
