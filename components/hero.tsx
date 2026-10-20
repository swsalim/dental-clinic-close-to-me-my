/* Hallmark · hero: H2 Split Diptych · genre: editorial · tone: utilitarian
 * knobs: ratio=7/5 · right=proof-column · divider=vertical-rule · enrichment: none
 * pre-emit critique: P4 H5 E5 S5 R4 V5
 */
import Image from 'next/image';
import Link from 'next/link';

import { MapTrifold, Tooth, Users } from '@phosphor-icons/react/dist/ssr';
import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr';

import { cn } from '@/lib/utils';

import { getDoctors } from '@/helpers/doctors';

import { getHomeDirectoryStats } from '@/components/listing/home-stats';
import { buttonVariants } from '@/components/ui/button';
import Container from '@/components/ui/container';

function formatStat(value: number) {
  return value.toLocaleString('en-MY');
}

const popularSearches = [
  { label: 'Kuala Lumpur', href: '/kuala-lumpur' },
  { label: 'Johor Bahru', href: '/johor-bahru' },
  { label: 'Penang', href: '/penang' },
  { label: 'Dental Implants', href: '/services/dental-implants' },
  { label: 'Braces', href: '/services/braces' },
];

export async function Hero() {
  const [{ count: doctorsCountRaw }, directoryStats] = await Promise.all([
    getDoctors({ limit: 6 }),
    getHomeDirectoryStats(),
  ]);
  const doctorsCount = doctorsCountRaw ?? 0;

  const proofStats: { value: number; label: string; icon: typeof Tooth }[] = [
    { value: directoryStats.clinicCount, label: 'Clinics', icon: Tooth },
    { value: doctorsCount, label: 'Professionals', icon: Users },
    { value: directoryStats.stateCount, label: 'States', icon: MapTrifold },
  ].filter((stat) => stat.value > 0);

  return (
    <section className="relative border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/hero-home.webp"
        alt="Hero background"
        width={2080}
        height={1170}
        className="absolute inset-0 h-full w-full object-cover object-left md:object-center"
        loading="eager"
      />
      <Container className="relative z-10 min-w-0 pb-8 pt-10 md:pt-12 lg:pb-8 lg:pt-16">
        <div className="grid min-w-0 items-center gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12 xl:gap-16">
          <div className="min-h-48 min-w-0">
            <h1 className="max-w-xl text-balance font-display text-[clamp(2rem,5vw,3.25rem)] font-bold leading-[1.05] tracking-tight text-gray-900 dark:text-gray-50">
              Find the right dental care near you
            </h1>

            <p className="mt-4 max-w-lg text-base leading-relaxed text-gray-600 md:text-lg dark:text-gray-300">
              Compare dental clinics, services, opening hours and contact details across Malaysia.
            </p>

            <div className="mt-8 flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/browse"
                prefetch={false}
                className={cn(
                  buttonVariants({ variant: 'primary', size: 'large' }),
                  'inline-flex min-h-11 w-full items-center justify-center sm:w-auto',
                )}>
                Browse by location
                <ArrowRightIcon weight="duotone" className="ms-2 size-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-4 flex flex-row flex-wrap items-center gap-4">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Popular searches:
              </span>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((search) => (
                  <Link
                    key={search.label}
                    href={search.href}
                    prefetch={false}
                    className={cn(
                      buttonVariants({ variant: 'secondary' }),
                      'rounded-full px-3 py-2 text-xs font-medium',
                    )}>
                    {search.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <aside
            className="flex h-full min-w-0 flex-col items-start justify-start lg:items-end lg:justify-end"
            aria-label="Directory snapshot">
            <div className="w-full overflow-hidden rounded-lg bg-white/90 px-6 py-4">
              {proofStats.length > 0 && (
                <dl className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-3">
                  {proofStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="flex min-w-0 flex-row items-start justify-start gap-x-2">
                      <stat.icon
                        weight="duotone"
                        className="size-8 shrink-0 text-blue-600 dark:text-blue-400"
                        aria-hidden="true"
                      />
                      <div className="flex flex-col items-start justify-center">
                        <dd className="font-display text-base font-bold tabular-nums text-gray-900 md:text-base dark:text-gray-50">
                          {formatStat(stat.value)}
                        </dd>
                        <dt className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400">
                          {stat.label}
                        </dt>
                      </div>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}
