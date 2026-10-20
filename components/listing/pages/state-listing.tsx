import React from 'react';

import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ClinicImage } from '@/types/clinic';
import {
  ArrowRight as ArrowRightIcon,
  MapTrifold,
  Tooth,
  Users,
} from '@phosphor-icons/react/dist/ssr';
import pluralize from 'pluralize';

import { siteConfig } from '@/config/site';

import { getStateAreasWithClinicsCached, getStateBySlugCached } from '@/lib/data';
import { getAllGuides } from '@/lib/guides';
import { imageKitUrl } from '@/lib/imagekit-url';
import { listingCanonicalPath, MAX_INDEXED_LISTING_PAGE } from '@/lib/listing/pagination';
import { resolveMediaUrl } from '@/lib/media';
import { MEDIA } from '@/lib/media-sizes';
import { absoluteUrl, cn, getPagination } from '@/lib/utils';

import { getDoctorsByState } from '@/helpers/doctors';

import { LazyAdsArticle } from '@/components/ads/lazy-ads-article';
import { ClinicCard } from '@/components/cards/clinic-card';
import { MediaImage } from '@/components/image/media-image';
import {
  getFeaturedListingCardPlaceholder,
  getFeaturedPartnerCardPlaceholder,
} from '@/components/listing/featured-clinic-spotlight';
import { HomeCtaStrip } from '@/components/listing/home-cta-strip';
import BreadcrumbJsonLd from '@/components/structured-data/breadcrumb-json-ld';
import CollectionPageJsonLd from '@/components/structured-data/collection-page-json-ld';
import Breadcrumb from '@/components/ui/breadcrumb';
import { buttonVariants } from '@/components/ui/button';
import Container from '@/components/ui/container';
import { Pagination } from '@/components/ui/pagination';
import { Wrapper } from '@/components/ui/wrapper';

type StateListingProps = {
  state: string;
  currentPage: number;
};

export async function generateStateListingMetadata(
  state: string,
  currentPage: number,
): Promise<Metadata> {
  const limit = 20;
  const { from, to } = getPagination(currentPage, limit);
  const [stateData, areasWithClinics] = await Promise.all([
    getStateBySlugCached(state, from, to),
    getStateAreasWithClinicsCached(state),
  ]);

  if (!stateData) {
    notFound();
  }

  const featuredAreas = areasWithClinics.slice(0, 3);
  const nearbyAreas = featuredAreas.map((area) => area.name).join(', ');
  const clinicCount = stateData.total_clinics ?? 0;

  const title = `Top ${clinicCount} Dental Clinics in ${stateData.name}`;
  const description = `Explore ${stateData.total_clinics} trusted dental clinics across cities like ${nearbyAreas} in ${stateData?.name}. Find services, reviews, and opening hours.`;
  const url = absoluteUrl(listingCanonicalPath(`/${state}`, currentPage));

  // Build the OG image URL with optional background image
  const ogImageUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/og-list`);
  ogImageUrl.searchParams.set('title', title);
  if (stateData.image) {
    ogImageUrl.searchParams.set('image', stateData.image);
  }

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      images: [
        {
          url: ogImageUrl,
          width: siteConfig.openGraph.width,
          height: siteConfig.openGraph.height,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      title,
      description,
      card: 'summary_large_image',
      creator: siteConfig.creator,
      images: [
        {
          url: ogImageUrl,
          width: siteConfig.openGraph.width,
          height: siteConfig.openGraph.height,
          alt: title,
        },
      ],
    },
    robots: {
      index: clinicCount > 0 && currentPage <= MAX_INDEXED_LISTING_PAGE,
      follow: true,
    },
  };
}

export async function StateListing({ state, currentPage }: StateListingProps) {
  const limit = 20;
  const { from, to } = getPagination(currentPage, limit);

  const [stateData, areasWithClinics, doctorsResult] = await Promise.all([
    getStateBySlugCached(state, from, to),
    getStateAreasWithClinicsCached(state),
    getDoctorsByState(state, 5, 0),
  ]);

  if (!stateData) {
    notFound();
  }

  const totalDoctors = doctorsResult.count || 0;

  const totalClinics = stateData.total_clinics || 0;
  const totalPages = Math.ceil(totalClinics / limit);

  const topAreas = areasWithClinics.slice(0, 6);
  const guides = getAllGuides().slice(0, 4);
  const featuredAreas = areasWithClinics.slice(0, 3);
  const nearbyAreas = featuredAreas.map((area) => area.name).join(', ');
  const nearbyAreasWithLinks = featuredAreas;

  const title = `Top Dental Clinics in ${stateData.name}`;
  const description = `Explore ${totalClinics} trusted dental clinics across cities like ${nearbyAreas} in ${stateData?.name}. Find services, reviews, and opening hours.`;

  const breadcrumbItems = [
    {
      name: stateData.name,
    },
  ];

  const JSONLDbreadcrumbs = [
    {
      item: `${process.env.NEXT_PUBLIC_BASE_URL}`,
      name: 'Home',
      position: '1',
    },
    {
      item: absoluteUrl(`/${state}`),
      name: stateData.name,
      position: '2',
    },
  ];

  const stateBackgroundSrc = resolveMediaUrl(stateData);

  return (
    <>
      <BreadcrumbJsonLd itemListElements={JSONLDbreadcrumbs} />
      <CollectionPageJsonLd
        name={`Dental Clinics in ${stateData.name}`}
        url={`/${state}`}
        description={description}
        clinics={stateData.clinics ?? []}
      />
      <Wrapper className="relative overflow-hidden">
        {/* Optimized background image using Next.js Image */}
        {stateBackgroundSrc && (
          <MediaImage
            src={stateBackgroundSrc}
            alt={`${stateData.name} aesthetic clinics background`}
            width={MEDIA.hero.width}
            height={MEDIA.hero.height}
            priority
            sizes={MEDIA.hero.sizes}
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              objectPosition: 'center center',
            }}
          />
        )}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50" />
        <Container className="relative z-10">
          <div className="flex flex-col gap-4 py-12 md:py-24">
            <Breadcrumb items={breadcrumbItems} theme="dark" />
            <h1 className="text-balance font-display text-4xl font-black text-white">{title}</h1>
            <p className="max-w-lg text-balance text-lg font-medium text-white">
              Explore {totalClinics} trusted dental clinics across cities like{' '}
              {nearbyAreasWithLinks?.map((area, index) => (
                <React.Fragment key={area.slug}>
                  <Link
                    href={absoluteUrl(`/${area.state?.slug}/${area.slug}`)}
                    className="text-blue-300 hover:border-blue-300 hover:text-blue-300"
                    prefetch={false}>
                    {area.name}
                  </Link>
                  {index < nearbyAreasWithLinks.length - 2 && ', '}
                  {index === nearbyAreasWithLinks.length - 2 && ', and '}
                </React.Fragment>
              ))}{' '}
              in {stateData?.name}. Find services, reviews, and opening hours.
            </p>
            <dl className="flex max-w-lg flex-row items-center justify-between gap-4 text-white">
              <div className="flex flex-row items-center justify-center gap-3">
                <Tooth className="size-8" />
                <div className="flex flex-col items-start justify-center">
                  <dd className="font-display text-base font-bold">{totalClinics}</dd>
                  <dt className="text-sm">Clinics</dt>
                </div>
              </div>
              <div className="flex flex-row items-center justify-center gap-3">
                <Users className="size-8" />
                <div className="flex flex-col items-start justify-center">
                  <dd className="font-display text-base font-bold">{totalDoctors}</dd>
                  <dt className="text-sm">Dental professionals</dt>
                </div>
              </div>
              <div className="flex flex-row items-center justify-center gap-3">
                <MapTrifold className="size-8" />
                <div className="flex flex-col items-start justify-center">
                  <dd className="font-display text-base font-bold">{stateData.areas?.length}</dd>
                  <dt className="text-sm">Areas covered</dt>
                </div>
              </div>
            </dl>
          </div>
        </Container>
      </Wrapper>

      <Wrapper size="sm">
        <Container>
          <div className="py-8 md:gap-8 lg:grid lg:grid-cols-sidebar lg:gap-10">
            <div>
              <div className="mx-auto mb-10 max-w-2xl">
                <a
                  href="https://invl.me/clo4xl2"
                  className="hover:!border-b-transparent"
                  target="_blank"
                  rel="nofollow noopener noreferrer">
                  <Image
                    src="/images/product-philips-soniccare-wide.webp"
                    alt="Philips Sonicare Wide"
                    width={MEDIA.adLeaderboard.width}
                    height={MEDIA.adLeaderboard.height}
                    sizes={MEDIA.adLeaderboard.sizes}
                    className="m-0 h-auto w-full object-contain"
                  />
                </a>
              </div>
              {topAreas.length > 0 && (
                <section className="mb-10" aria-labelledby="browse-areas-heading">
                  <div className="mb-4 flex items-end justify-between gap-4">
                    <div className="min-w-0">
                      <h2
                        id="browse-areas-heading"
                        className="text-balance font-display text-xl font-bold text-blue-900 md:text-2xl dark:text-blue-100">
                        Browse areas in {stateData.name}
                      </h2>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        Select a city or area to view all dental clinics.
                      </p>
                    </div>
                    {areasWithClinics.length >= 6 && (
                      <Link
                        href="#areas"
                        prefetch={false}
                        className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-blue-600 no-underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                        View all areas
                        <ArrowRightIcon weight="duotone" className="size-4" aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                  <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 lg:mx-0 lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-0">
                    {topAreas.map((area) => {
                      const imageSrc = resolveMediaUrl(area) ?? stateBackgroundSrc;

                      return (
                        <li key={area.id} className="w-40 shrink-0 snap-start lg:w-auto">
                          <Link
                            href={absoluteUrl(`/${state}/${area.slug}`)}
                            prefetch={false}
                            className="bg-blue-950 group relative block aspect-[4/3] overflow-hidden rounded-xl no-underline">
                            {imageSrc && (
                              <MediaImage
                                src={imageSrc}
                                alt={area.name}
                                width={MEDIA.areaThumb.width}
                                height={MEDIA.areaThumb.height}
                                sizes="(max-width: 1024px) 160px, 16vw"
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                              />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/85 via-gray-950/20 to-transparent" />
                            <div className="absolute inset-x-0 bottom-0 p-3">
                              <h3 className="truncate font-display text-sm font-bold text-white">
                                {area.name}
                              </h3>
                              <p className="text-xs font-medium text-gray-200">
                                {area.clinicCount.toLocaleString('en-MY')}{' '}
                                {pluralize('clinic', area.clinicCount)}
                              </p>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}
              <div className="flex flex-col gap-y-6">
                <h2 className="text-balance font-display text-xl font-bold md:text-2xl">
                  {totalClinics} Dental Clinics in {stateData.name}
                </h2>
                {stateData.clinics?.length > 0 ? (
                  <>
                    <div
                      className={cn(
                        'grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8',
                      )}>
                      {currentPage === 1 && (
                        <>
                          <ClinicCard
                            key="featured-placeholder-partner"
                            {...getFeaturedPartnerCardPlaceholder(
                              stateData.name,
                              stateData.areas?.[0]?.name,
                            )}
                          />
                          <ClinicCard
                            key="featured-placeholder-listing"
                            {...getFeaturedListingCardPlaceholder(
                              stateData.name,
                              stateData.areas?.[1]?.name ?? stateData.areas?.[0]?.name,
                            )}
                          />
                        </>
                      )}
                      {stateData.clinics
                        ?.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0))
                        .map((clinic, index) => {
                          return (
                            <React.Fragment key={clinic.slug}>
                              {index === 5 && (
                                <div className="flex flex-col items-center justify-center gap-2 text-center">
                                  <a
                                    href="https://invl.me/clnlab2"
                                    className="hover:!border-b-transparent"
                                    target="_blank"
                                    rel="nofollow noopener noreferrer">
                                    <Image
                                      src="/images/total-image-2.jpg"
                                      alt="Total Image"
                                      width={MEDIA.adGrid.width}
                                      height={MEDIA.adGrid.height}
                                      priority
                                      quality={85}
                                      sizes={MEDIA.adGrid.sizes}
                                      className="m-0 h-auto w-full object-cover"
                                      style={{
                                        objectPosition: 'center center',
                                      }}
                                    />
                                  </a>
                                </div>
                              )}
                              {index !== 5 && (index + 1) % 6 == 0 && <LazyAdsArticle />}
                              <ClinicCard
                                key={clinic.slug}
                                slug={clinic.slug ?? ''}
                                name={clinic.name ?? ''}
                                address={clinic.address ?? ''}
                                phone={clinic.phone ?? ''}
                                postalCode={clinic.postal_code ?? ''}
                                state={clinic.state?.name ?? ''}
                                area={clinic.area?.name ?? ''}
                                image={clinic.images?.[0] as ClinicImage | undefined}
                                rating={clinic.rating}
                                isFeatured={clinic.is_featured ?? false}
                                hours={clinic.hours ?? []}
                                specialHours={clinic.special_hours ?? []}
                                openOnPublicHolidays={clinic.open_on_public_holidays ?? false}
                              />
                            </React.Fragment>
                          );
                        })}
                    </div>
                    <Pagination currentPage={currentPage} totalPages={totalPages} />
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-y-4">
                    <div className="flex flex-col items-center justify-center">
                      <div className="relative size-64 md:size-96">
                        <MediaImage
                          src={imageKitUrl('dental-clinics-my/lost-boy.png')}
                          alt="No dental clinics found"
                          width={MEDIA.empty.width}
                          height={MEDIA.empty.height}
                          sizes={MEDIA.empty.sizes}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                    <h2 className="text-balance font-display text-2xl font-bold md:text-4xl">
                      Oops!
                    </h2>
                    <p className="text-balance text-lg dark:text-gray-300">
                      No dental clinics found in {stateData.name}.
                    </p>
                    <div className="flex flex-col gap-y-2 md:flex-row md:gap-x-3">
                      <Link
                        href="/submit"
                        className={cn(
                          buttonVariants({ variant: 'primary' }),
                          'flex flex-row gap-x-2',
                        )}
                        prefetch={false}>
                        Add a clinic
                        <ArrowRightIcon weight="duotone" className="size-4" />
                      </Link>
                      <Link
                        href="/"
                        className={cn(
                          buttonVariants({ variant: 'ghost' }),
                          'flex flex-row gap-x-2',
                        )}
                        prefetch={false}>
                        Get back to homepage
                        <ArrowRightIcon weight="duotone" className="size-4" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <aside className="sticky top-20 flex flex-col gap-6 self-start">
              <a
                href="https://invl.me/clo4xmy"
                className="hover:!border-b-transparent"
                target="_blank"
                rel="nofollow noopener noreferrer">
                <Image
                  src="/images/product-curaprox.webp"
                  alt="Curaprox Orthodontic Kits"
                  width={MEDIA.card.width}
                  height={MEDIA.card.height}
                  sizes={MEDIA.card.sizes}
                  className="m-0 h-auto w-full object-contain"
                />
              </a>

              {guides.length > 0 && (
                <section
                  aria-labelledby="state-guides-heading"
                  className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <h2
                      id="state-guides-heading"
                      className="font-display text-base font-bold text-gray-900 dark:text-gray-50">
                      Guides
                    </h2>
                    <Link
                      href="/guides"
                      prefetch={false}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 no-underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                      All guides
                      <ArrowRightIcon weight="duotone" className="size-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                  <ul className="flex flex-col divide-y divide-gray-200 dark:divide-gray-800">
                    {guides.map((guide) => (
                      <li key={guide.slug}>
                        <Link
                          href={`/guides/${guide.slug}`}
                          prefetch={false}
                          className="block py-2.5 no-underline hover:border-transparent">
                          <span className="block text-sm font-medium text-gray-900 dark:text-gray-50">
                            {guide.title}
                          </span>
                          <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                            {guide.readingTimeMinutes} min read
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              <a
                href="https://invl.me/clo4xmw"
                className="hover:!border-b-transparent"
                target="_blank"
                rel="nofollow noopener noreferrer">
                <Image
                  src="/images/product-waterpik.webp"
                  alt="Waterpik Water Flosser"
                  width={MEDIA.card.width}
                  height={MEDIA.card.height}
                  sizes={MEDIA.card.sizes}
                  className="m-0 h-auto w-full object-contain"
                />
              </a>
              <a
                href="https://invl.me/clo4xl2"
                className="hover:!border-b-transparent"
                target="_blank"
                rel="nofollow noopener noreferrer">
                <Image
                  src="/images/product-philips-soniccare.webp"
                  alt="Philips Sonicare Wide"
                  width={MEDIA.card.width}
                  height={MEDIA.card.height}
                  sizes={MEDIA.card.sizes}
                  className="m-0 h-auto w-full object-contain"
                />
              </a>
            </aside>
          </div>
        </Container>
      </Wrapper>

      <HomeCtaStrip />
    </>
  );
}
