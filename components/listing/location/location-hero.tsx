import { Suspense } from 'react';

import { CalendarBlank, Star, Tooth, WhatsappLogo } from '@phosphor-icons/react/dist/ssr';

import type { HubGlanceStats } from '@/lib/listing/hub-copy';
import type { LocationFacets } from '@/lib/listing/location-filters';
import { MEDIA } from '@/lib/media-sizes';

import { MediaImage } from '@/components/image/media-image';
import { BackToFirstPage } from '@/components/listing/back-to-first-page';
import { LocationSearch } from '@/components/listing/location/location-search';
import { LocationSearchForm } from '@/components/listing/location/location-search-form';
import Breadcrumb from '@/components/ui/breadcrumb';
import Container from '@/components/ui/container';

type BreadcrumbItem = {
  name?: string;
  url?: string;
};

export type LocationHeroStat = {
  key: 'clinics' | 'weekends' | 'whatsapp' | 'rating';
  value: string;
  label: string;
};

const STAT_ICONS = {
  clinics: Tooth,
  weekends: CalendarBlank,
  whatsapp: WhatsappLogo,
  rating: Star,
} as const;

export function locationHeroStats(
  clinicCount: number,
  facets: LocationFacets,
  glance: HubGlanceStats,
): LocationHeroStat[] {
  const whatsapp = facets.total > 0 ? facets.whatsapp : glance.whatsappCount;
  const stats: LocationHeroStat[] = [
    { key: 'clinics', value: clinicCount.toLocaleString('en-MY'), label: 'Clinics' },
  ];

  if (facets.total > 0) {
    stats.push({
      key: 'weekends',
      value: facets.weekends.toLocaleString('en-MY'),
      label: 'Open on weekends',
    });
  }

  if (whatsapp > 0) {
    stats.push({
      key: 'whatsapp',
      value: whatsapp.toLocaleString('en-MY'),
      label: 'WhatsApp',
    });
  }

  if (facets.averageRating != null) {
    stats.push({
      key: 'rating',
      value: facets.averageRating.toFixed(1),
      label: 'Avg. rating',
    });
  }

  return stats;
}

export function LocationHero({
  breadcrumbItems,
  heading,
  intro,
  backHref,
  placeName,
  currentPage,
  backgroundSrc,
  searchBasePath,
  searchPlaceholder,
  stats,
}: {
  breadcrumbItems: BreadcrumbItem[];
  heading: string;
  intro: string;
  backHref: string;
  placeName: string;
  currentPage: number;
  backgroundSrc?: string | null;
  searchBasePath: string;
  searchPlaceholder: string;
  stats: LocationHeroStat[];
}) {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-gray-900">
      {backgroundSrc ? (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[min(48%,40rem)] lg:block"
          aria-hidden="true">
          <MediaImage
            src={backgroundSrc}
            alt=""
            width={MEDIA.hero.width}
            height={MEDIA.hero.height}
            priority
            sizes="40rem"
            className="h-full w-full object-cover object-[center_30%]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white from-0% via-white/80 via-[32%] to-transparent dark:from-gray-900 dark:via-gray-900/85" />
        </div>
      ) : null}
      <Container className="relative">
        <div className="flex max-w-3xl flex-col gap-4 py-8 md:max-w-4xl md:py-10">
          <Breadcrumb items={breadcrumbItems} />
          <div className="flex flex-col gap-2">
            <h1 className="text-balance font-display text-3xl font-black text-gray-950 md:text-4xl dark:text-white">
              {heading}
            </h1>
            <BackToFirstPage href={backHref} placeName={placeName} currentPage={currentPage} />
            <p className="max-w-2xl text-base text-gray-600 dark:text-gray-300">{intro}</p>
          </div>
          <Suspense
            fallback={
              <LocationSearchForm basePath={searchBasePath} placeholder={searchPlaceholder} />
            }>
            <LocationSearch basePath={searchBasePath} placeholder={searchPlaceholder} />
          </Suspense>
          {stats.length > 0 ? (
            <dl className="my-3 grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-4">
              {stats.map((stat) => {
                const Icon = STAT_ICONS[stat.key];
                return (
                  <div key={stat.key} className="flex items-center gap-4">
                    <Icon
                      className="size-6 shrink-0 text-blue-600 dark:text-blue-300"
                      aria-hidden="true"
                      weight="duotone"
                    />
                    <div>
                      <dd className="font-display text-lg font-bold leading-none text-gray-950 dark:text-white">
                        {stat.value}
                      </dd>
                      <dt className="mt-1 text-sm font-semibold text-gray-500 dark:text-gray-400">
                        {stat.label}
                      </dt>
                    </div>
                  </div>
                );
              })}
            </dl>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
