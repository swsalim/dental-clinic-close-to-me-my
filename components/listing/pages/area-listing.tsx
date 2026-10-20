import React from 'react';

import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ClinicImage } from '@/types/clinic';
import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr';

import { siteConfig } from '@/config/site';

import { getAreaBySlugCached } from '@/lib/data';
import { getAllGuides } from '@/lib/guides';
import { imageKitUrl } from '@/lib/imagekit-url';
import { listingCanonicalPath, MAX_INDEXED_LISTING_PAGE } from '@/lib/listing/pagination';
import { resolveMediaUrl } from '@/lib/media';
import { MEDIA } from '@/lib/media-sizes';
import { absoluteUrl, cn, getPagination } from '@/lib/utils';

import { getStateBySlug } from '@/helpers/states';

import { LazyAdsArticle } from '@/components/ads/lazy-ads-article';
import { ClinicCard } from '@/components/cards/clinic-card';
import AddBookingForm from '@/components/forms/add-booking-form';
import { MediaImage } from '@/components/image/media-image';
import BreadcrumbJsonLd from '@/components/structured-data/breadcrumb-json-ld';
import CollectionPageJsonLd from '@/components/structured-data/collection-page-json-ld';
import Breadcrumb from '@/components/ui/breadcrumb';
import { buttonVariants } from '@/components/ui/button';
import Container from '@/components/ui/container';
import { Pagination } from '@/components/ui/pagination';
import Prose from '@/components/ui/prose';
import { Wrapper } from '@/components/ui/wrapper';

type AreaListingProps = {
  state: string;
  area: string;
  currentPage: number;
};

export async function generateAreaListingMetadata(
  state: string,
  area: string,
  currentPage: number,
): Promise<Metadata> {
  const isJohorBahru = state === 'johor' && area === 'johor-bahru';
  const limit = isJohorBahru ? 21 : 20;
  const { from, to } = getPagination(currentPage, limit);
  const areaData = await getAreaBySlugCached(area, from, to);

  if (!areaData) {
    notFound();
  }
  const validState = areaData.state?.slug === state;
  if (!validState) {
    notFound();
  }

  const clinicCount = areaData.total_clinics ?? 0;
  const title = `Top ${clinicCount} Dental Clinics in ${areaData.name}, ${areaData.state.name}`;
  const description = `Explore ${areaData.total_clinics} trusted dental clinics located in ${areaData.name}, ${areaData.state.name}. Find services, reviews, and opening hours.`;
  const url = absoluteUrl(listingCanonicalPath(`/${state}/${area}`, currentPage));

  // Build the OG image URL with optional background image
  const ogImageUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/og-list`);
  ogImageUrl.searchParams.set('title', title);
  if (areaData.image || areaData.state?.image) {
    ogImageUrl.searchParams.set('image', areaData.image || areaData.state?.image || '');
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
          url: new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/og?title=${title}`),
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

export async function AreaListing({ state, area, currentPage }: AreaListingProps) {
  const isJohorBahru = state === 'johor' && area === 'johor-bahru';

  const limit = isJohorBahru ? 21 : 20;
  const { from, to } = getPagination(currentPage, limit);

  // Fetch area metadata and clinics data in parallel
  const [areaData, stateData] = await Promise.all([
    getAreaBySlugCached(area, from, to),
    getStateBySlug(state, from, to),
  ]);

  // Early validation
  if (!areaData || !stateData) {
    notFound();
  }

  const validState = areaData.state?.slug === state;
  if (!validState) {
    notFound();
  }

  const totalClinics = areaData.total_clinics || 0;
  const totalPages = Math.ceil(totalClinics / limit);

  const title = `Top Dental Clinics in ${areaData.name}, ${areaData.state?.name}`;
  const description = `Explore ${totalClinics} trusted dental clinics across cities in ${areaData.state?.name}. Find services, reviews, and opening hours.`;

  const guides = getAllGuides().slice(0, 4);

  const breadcrumbItems = [
    {
      name: areaData.state?.name,
      url: absoluteUrl(`/${areaData.state?.slug}`),
    },
    {
      name: areaData.name,
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
      name: areaData.state?.name,
      position: '2',
    },
    {
      item: absoluteUrl(`/${state}/${area}`),
      name: areaData.name,
      position: '3',
    },
  ];

  const areaBackgroundSrc = resolveMediaUrl(areaData) || resolveMediaUrl(areaData.state);

  return (
    <>
      <BreadcrumbJsonLd itemListElements={JSONLDbreadcrumbs} />
      <CollectionPageJsonLd
        name={`Dental Clinics in ${areaData.name}, ${areaData.state?.name}`}
        url={`/${state}/${area}`}
        description={description}
        clinics={areaData.clinics ?? []}
      />
      <Wrapper className="relative overflow-hidden">
        {/* Optimized background image using Next.js Image */}
        {areaBackgroundSrc && (
          <MediaImage
            src={areaBackgroundSrc}
            alt={`${areaData.name}, ${areaData.state?.name} aesthetic clinics background`}
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
            <p className="text-balance text-lg font-medium text-white">
              Explore {totalClinics} trusted dental clinics across cities in{' '}
              <Link
                href={absoluteUrl(`/${areaData.state?.slug}`)}
                className="text-blue-300 hover:border-blue-300 hover:text-blue-300"
                prefetch={false}>
                {areaData.state?.name}
              </Link>
              . Find services, reviews, and opening hours.
            </p>
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

              <div className="flex flex-col gap-y-6">
                {isJohorBahru && (
                  <Prose className="block lg:hidden">
                    <AddBookingForm
                      currentUrl={absoluteUrl(`/${state}/${area}`)}
                      area={areaData.name}
                    />
                  </Prose>
                )}
                <h2 className="mb-6 text-balance font-display text-xl font-bold md:text-2xl">
                  {totalClinics} Dental Clinics in {areaData.name}, {areaData.state?.name}
                </h2>
                {areaData.clinics?.length > 0 ? (
                  <>
                    <div
                      className={cn(
                        'grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8',
                      )}>
                      {areaData.clinics
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
                                image={clinic.images?.[0] as ClinicImage | undefined}
                                postalCode={clinic.postal_code ?? ''}
                                state={areaData.state?.name ?? ''}
                                area={areaData.name ?? ''}
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
                      We&apos;re not ready in {areaData.name}, {areaData.state?.name}.
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
              {isJohorBahru && (
                <Prose className="hidden lg:block">
                  <AddBookingForm
                    currentUrl={absoluteUrl(`/${state}/${area}`)}
                    area={areaData.name}
                  />
                </Prose>
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
    </>
  );
}
