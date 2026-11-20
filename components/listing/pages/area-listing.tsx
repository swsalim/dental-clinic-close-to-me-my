import { Suspense } from 'react';

import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr';

import { siteConfig } from '@/config/site';

import {
  getAllServicesCached,
  getAreaBySlugCached,
  getStateAreasWithClinicsCached,
} from '@/lib/data';
import { getAllGuides } from '@/lib/guides';
import { imageKitUrl } from '@/lib/imagekit-url';
import { areaIsIndexable, withMinimumHubLinks } from '@/lib/listing/hub-copy';
import { getHubGlance } from '@/lib/listing/hub-stats';
import { getLocationFacetsSafe } from '@/lib/listing/location-clinic-index';
import { listingClinicFromPage } from '@/lib/listing/location-filters';
import {
  countedPlaceTitle,
  isPastLastPage,
  listingMetaTitle,
  listingRobots,
  listingTotalPages,
  paginatedDescription,
  paginatedTitle,
} from '@/lib/listing/page-title';
import { listingCanonicalPath, MAX_INDEXED_LISTING_PAGE } from '@/lib/listing/pagination';
import { resolveMediaUrl } from '@/lib/media';
import { MEDIA } from '@/lib/media-sizes';
import { absoluteUrl, cn, getPagination } from '@/lib/utils';

import { getStateBySlug } from '@/helpers/states';

import AddBookingForm from '@/components/forms/add-booking-form';
import { MediaImage } from '@/components/image/media-image';
import { ClinicResultGrid } from '@/components/listing/location/clinic-result-grid';
import { LocationBrowser } from '@/components/listing/location/location-browser';
import { LocationHero, locationHeroStats } from '@/components/listing/location/location-hero';
import { LocationSeo } from '@/components/listing/location/location-seo';
import BreadcrumbJsonLd from '@/components/structured-data/breadcrumb-json-ld';
import CollectionPageJsonLd from '@/components/structured-data/collection-page-json-ld';
import { buttonVariants } from '@/components/ui/button';
import Container from '@/components/ui/container';
import { Pagination } from '@/components/ui/pagination';
import Prose from '@/components/ui/prose';

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
  if (isPastLastPage(currentPage, clinicCount, limit)) {
    notFound();
  }
  const glance = await getHubGlance('area', areaData.id);

  const totalPages = listingTotalPages(clinicCount, limit);
  const title = paginatedTitle(
    countedPlaceTitle(clinicCount, 'Dental Clinic', `${areaData.name}, ${areaData.state.name}`),
    currentPage,
    totalPages,
  );
  const description = paginatedDescription(
    `Explore ${areaData.total_clinics} dental clinics located in ${areaData.name}, ${areaData.state.name}. Find services, reviews, and opening hours.`,
    currentPage,
    { perPage: limit, totalItems: clinicCount, noun: 'clinics' },
  );
  const url = absoluteUrl(listingCanonicalPath(`/${state}/${area}`, currentPage));

  return {
    title: listingMetaTitle(title, currentPage),
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
          url: siteConfig.openGraph.image,
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
          url: siteConfig.openGraph.image,
          width: siteConfig.openGraph.width,
          height: siteConfig.openGraph.height,
          alt: title,
        },
      ],
    },
    robots: listingRobots(
      currentPage,
      areaIsIndexable(glance.clinicCount),
      MAX_INDEXED_LISTING_PAGE,
    ),
  };
}

export async function AreaListing({ state, area, currentPage }: AreaListingProps) {
  const isJohorBahru = state === 'johor' && area === 'johor-bahru';

  const limit = isJohorBahru ? 21 : 20;
  const { from, to } = getPagination(currentPage, limit);

  // Fetch area metadata and clinics data in parallel
  const [areaData, stateData, areasInState, services, facets] = await Promise.all([
    getAreaBySlugCached(area, from, to),
    getStateBySlug(state, from, to),
    getStateAreasWithClinicsCached(state),
    getAllServicesCached(),
    getLocationFacetsSafe({ kind: 'area', stateSlug: state, areaSlug: area }),
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
  const glance = await getHubGlance('area', areaData.id);
  const hubLinks = withMinimumHubLinks([
    {
      href: `/${state}`,
      label: `Dental clinics in ${areaData.state?.name ?? 'this state'}`,
    },
    ...areasInState
      .filter((item) => item.slug !== area)
      .slice(0, 8)
      .map((item) => ({
        href: `/${state}/${item.slug}`,
        label: `${item.name} (${item.clinicCount.toLocaleString('en-MY')})`,
      })),
    ...services.slice(0, 4).map((service) => ({
      href: `/services/${service.slug}`,
      label: service.name,
    })),
  ]);
  const totalPages = Math.ceil(totalClinics / limit);
  if (isPastLastPage(currentPage, totalClinics, limit)) {
    notFound();
  }

  const place = `${areaData.name}, ${areaData.state?.name}`;
  const title = `Dental Clinics in ${place}`;
  const description = `Explore ${totalClinics} dental clinics across cities in ${areaData.state?.name}. Find services, reviews, and opening hours.`;
  const indexedTitle = countedPlaceTitle(totalClinics, 'Dental Clinic', place);
  const indexedDescription = `Explore ${totalClinics} dental clinics located in ${areaData.name}, ${areaData.state?.name}. Find services, reviews, and opening hours.`;
  const documentTitle = paginatedTitle(indexedTitle, currentPage, totalPages);
  const documentDescription = paginatedDescription(indexedDescription, currentPage, {
    perPage: limit,
    totalItems: totalClinics,
    noun: 'clinics',
  });
  const heading = currentPage > 1 ? documentTitle : title;

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
  const listingClinics = [...(areaData.clinics ?? [])]
    .sort((left, right) => Number(right.is_featured) - Number(left.is_featured))
    .map((clinic) =>
      listingClinicFromPage(clinic, {
        state: areaData.state?.name ?? '',
        area: areaData.name,
      }),
    );
  const heroStats = locationHeroStats(totalClinics, facets, glance);
  const sundayCount = facets.total > 0 ? facets.sunday : glance.sundayOpenCount;
  const whatsappCount = facets.total > 0 ? facets.whatsapp : glance.whatsappCount;
  const placeLabel = `${areaData.name}, ${areaData.state?.name ?? ''}`.replace(/, $/, '');

  return (
    <>
      <BreadcrumbJsonLd itemListElements={JSONLDbreadcrumbs} />
      <CollectionPageJsonLd
        name={
          currentPage > 1
            ? documentTitle
            : `Dental Clinics in ${areaData.name}, ${areaData.state?.name}`
        }
        url={listingCanonicalPath(`/${state}/${area}`, currentPage)}
        description={currentPage > 1 ? documentDescription : description}
        clinics={areaData.clinics ?? []}
      />
      <LocationHero
        breadcrumbItems={breadcrumbItems}
        heading={heading}
        intro={`Compare ${totalClinics.toLocaleString('en-MY')} dental clinics in ${placeLabel} by ratings, opening hours, services and contact options.`}
        backHref={`/${state}/${area}`}
        placeName={areaData.name}
        currentPage={currentPage}
        backgroundSrc={areaBackgroundSrc}
        searchBasePath={`/${state}/${area}`}
        searchPlaceholder={`Search clinics in ${areaData.name}...`}
        stats={heroStats}
      />
      <section className="bg-white dark:bg-gray-900">
        <Container className="py-8 md:py-10">
          {isJohorBahru ? (
            <Prose className="mb-8">
              <AddBookingForm currentUrl={absoluteUrl(`/${state}/${area}`)} area={areaData.name} />
            </Prose>
          ) : null}
          {listingClinics.length > 0 || currentPage > 1 ? (
            <>
              <Suspense
                fallback={
                  <div className="lg:grid lg:grid-cols-sidebar-left lg:items-start lg:gap-8">
                    <div className="hidden lg:block" aria-hidden="true" />
                    <div>
                      <h2 className="mb-4 font-display text-xl font-bold md:text-2xl">
                        {indexedTitle}
                      </h2>
                      <ClinicResultGrid clinics={listingClinics} />
                      <Pagination currentPage={currentPage} totalPages={totalPages} />
                    </div>
                  </div>
                }
              >
                <LocationBrowser
                  basePath={`/${state}/${area}`}
                  scope={{ kind: 'area', stateSlug: state, areaSlug: area }}
                  limit={limit}
                  currentPage={currentPage}
                  totalClinics={totalClinics}
                  totalPages={totalPages}
                  clinics={listingClinics}
                  facets={facets}
                  showSampleCards={false}
                  sampleState={areaData.state?.name ?? ''}
                  sampleArea={areaData.name}
                  emptyHref={`/${state}/${area}`}
                  listHeading={indexedTitle}
                />
              </Suspense>
              {currentPage === 1 ? (
                <LocationSeo
                  placeName={areaData.name}
                  placeLabel={placeLabel}
                  clinicCount={totalClinics}
                  stats={{
                    clinicCount: totalClinics,
                    sundayOpenCount: sundayCount,
                    whatsappCount,
                  }}
                  links={hubLinks}
                  guides={guides}
                />
              ) : null}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-y-4 py-8">
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
              <h2 className="text-balance font-display text-2xl font-bold md:text-4xl">Oops!</h2>
              <p className="text-balance text-lg dark:text-gray-300">
                We&apos;re not ready in {areaData.name}, {areaData.state?.name}.
              </p>
              <div className="flex flex-col gap-y-2 md:flex-row md:gap-x-3">
                <Link
                  href="/submit"
                  className={cn(buttonVariants({ variant: 'primary' }), 'flex flex-row gap-x-2')}
                  prefetch={false}
                >
                  Add a clinic
                  <ArrowRightIcon weight="duotone" className="size-4" />
                </Link>
                <Link
                  href="/"
                  className={cn(buttonVariants({ variant: 'ghost' }), 'flex flex-row gap-x-2')}
                  prefetch={false}
                >
                  Get back to homepage
                  <ArrowRightIcon weight="duotone" className="size-4" />
                </Link>
              </div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}

