/* Hallmark · hero: H2 Split Diptych · genre: editorial · tone: utilitarian
 * knobs: ratio=7/5 · right=proof-column · divider=vertical-rule · enrichment: none
 * pre-emit critique: P4 H5 E5 S5 R4 V5
 */

import Link from 'next/link';

import { ClinicImage } from '@/types/clinic';
import { ArrowRightIcon, PersonStandingIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

import { getDoctors } from '@/helpers/doctors';

import { buttonVariants } from '@/components/ui/button';
import Container from '@/components/ui/container';

import { getHomeDirectoryStats } from '@/components/listing/home-stats';

import { ImageKit } from './image/image-kit';

function formatStat(value: number) {
  return value.toLocaleString('en-MY');
}

function buildLede(
  clinicCount: number,
  doctorsCount: number,
  stateCount: number,
): string {
  const parts: string[] = [];

  if (clinicCount > 0) {
    parts.push(`${formatStat(clinicCount)} listed clinics`);
  }
  if (doctorsCount > 0) {
    parts.push(`${formatStat(doctorsCount)} dental professionals`);
  }
  if (stateCount > 0) {
    parts.push(`${formatStat(stateCount)} states`);
  }

  if (parts.length === 0) {
    return 'Compare clinics, read patient reviews, and book appointments across Malaysia.';
  }

  return `${parts.join(' · ')}. Compare reviews, hours, and contact details near you.`;
}

export async function Hero() {
  const [{ data: doctorsData, count: doctorsCountRaw }, directoryStats] = await Promise.all([
    getDoctors({ limit: 6 }),
    getHomeDirectoryStats(),
  ]);
  const doctorsCount = doctorsCountRaw ?? 0;

  const proofStats = [
    { value: directoryStats.clinicCount, label: 'Clinics' },
    { value: doctorsCount, label: 'Professionals' },
    { value: directoryStats.stateCount, label: 'States' },
  ].filter((stat) => stat.value > 0);

  return (
    <section className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <Container className="min-w-0 py-10 md:py-14 lg:py-16">
        <div className="grid min-w-0 items-center gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12 xl:gap-16">
          <div className="min-w-0">
            <h1 className="font-display max-w-xl text-balance text-[clamp(2rem,5vw,3.25rem)] font-bold leading-[1.05] tracking-tight text-gray-900 dark:text-gray-50">
              Find dental care near you
            </h1>

            <p className="mt-4 max-w-lg text-base leading-relaxed text-gray-600 md:text-lg dark:text-gray-300">
              {buildLede(
                directoryStats.clinicCount,
                doctorsCount,
                directoryStats.stateCount,
              )}
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
                <ArrowRightIcon className="ms-2 size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/dentists"
                prefetch={false}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'large' }),
                  'inline-flex min-h-11 w-full items-center justify-center border-gray-300 sm:w-auto dark:border-gray-600',
                )}>
                Find a dentist
              </Link>
            </div>
          </div>

          <aside
            className="min-w-0 border-t border-gray-200 pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0 xl:pl-12 dark:border-gray-800"
            aria-label="Directory snapshot">
            {doctorsData.length > 0 ? (
              <div className="mb-6 grid min-w-0 grid-cols-3 gap-2 sm:max-w-sm sm:grid-cols-3 lg:max-w-none">
                {doctorsData.map((doctor) => (
                  <Link
                    key={doctor.id}
                    href={`/dentist/${doctor.slug}`}
                    prefetch={false}
                    className="group relative aspect-square min-w-0 overflow-hidden rounded-lg ring-1 ring-gray-200 transition hover:ring-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:ring-gray-700 dark:hover:ring-blue-500 dark:focus-visible:ring-offset-gray-900">
                    {doctor.images?.[0] ? (
                      <ImageKit
                        src={(doctor.images[0] as unknown as ClinicImage).image_url}
                        alt=""
                        width={120}
                        height={120}
                        priority
                        sizes="(max-width: 1024px) 33vw, 120px"
                        className="size-full object-cover transition duration-150 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      />
                    ) : (
                      <span className="flex size-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                        <PersonStandingIcon
                          className="size-7 text-gray-500 dark:text-gray-400"
                          aria-hidden="true"
                        />
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            ) : null}

            {proofStats.length > 0 ? (
              <dl className="grid min-w-0 grid-cols-3 gap-3 border-t border-gray-200 pt-5 dark:border-gray-800">
                {proofStats.map((stat) => (
                  <div key={stat.label} className="min-w-0">
                    <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {stat.label}
                    </dt>
                    <dd className="font-display mt-1 text-xl font-bold tabular-nums text-gray-900 md:text-2xl dark:text-gray-50">
                      {formatStat(stat.value)}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}

            <Link
              href="/dentists"
              prefetch={false}
              className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-blue-600 no-underline transition hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:text-blue-400 dark:hover:text-blue-300 dark:focus-visible:ring-offset-gray-900">
              View all professionals
              <ArrowRightIcon className="ms-1.5 size-4" aria-hidden="true" />
            </Link>
          </aside>
        </div>
      </Container>
    </section>
  );
}
