import { Suspense } from 'react';

import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr';

import { siteConfig } from '@/config/site';

import {
  getAllServicesCached,
  getStateAreasWithClinicsCached,
  getStateBySlugCached,
} from '@/lib/data';
import { getAllGuides } from '@/lib/guides';
import { imageKitUrl } from '@/lib/imagekit-url';
import { withMinimumHubLinks } from '@/lib/listing/hub-copy';
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

import { MediaImage } from '@/components/image/media-image';
import { ClinicResultGrid } from '@/components/listing/location/clinic-result-grid';
import { LocationBrowser } from '@/components/listing/location/location-browser';
import { LocationHero, locationHeroStats } from '@/components/listing/location/location-hero';
import { LocationSeo } from '@/components/listing/location/location-seo';
import { HomeCtaStrip } from '@/components/listing/home-cta-strip';
import BreadcrumbJsonLd from '@/components/structured-data/breadcrumb-json-ld';
import CollectionPageJsonLd from '@/components/structured-data/collection-page-json-ld';
import { buttonVariants } from '@/components/ui/button';
import Container from '@/components/ui/container';
import { Pagination } from '@/components/ui/pagination';

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

  if (isPastLastPage(currentPage, clinicCount, limit)) {
    notFound();
  }

  const totalPages = listingTotalPages(clinicCount, limit);
  const title = paginatedTitle(
    countedPlaceTitle(clinicCount, 'Dental Clinic', stateData.name),
    currentPage,
    totalPages,
  );
  const description = paginatedDescription(
    `Explore ${stateData.total_clinics} dental clinics across cities like ${nearbyAreas} in ${stateData?.name}. Find services, reviews, and opening hours.`,
    currentPage,
    { perPage: limit, totalItems: clinicCount, noun: 'clinics' },
  );
  const url = absoluteUrl(listingCanonicalPath(`/${state}`, currentPage));

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
    robots: listingRobots(currentPage, clinicCount > 0, MAX_INDEXED_LISTING_PAGE),
  };
}

export async function StateListing({ state, currentPage }: StateListingProps) {
  const limit = 20;
  const { from, to } = getPagination(currentPage, limit);

  const [stateData, areasWithClinics, services, facets] = await Promise.all([
    getStateBySlugCached(state, from, to),
    getStateAreasWithClinicsCached(state),
    getAllServicesCached(),
    getLocationFacetsSafe({ kind: 'state', stateSlug: state }),
  ]);

  if (!stateData) {
    notFound();
  }

  const totalClinics = stateData.total_clinics || 0;
  const glance = await getHubGlance('state', stateData.id);
  const hubLinks = withMinimumHubLinks([
    ...areasWithClinics.map((area) => ({
      href: `/${state}/${area.slug}`,
      label: `${area.name} (${area.clinicCount.toLocaleString('en-MY')})`,
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

  const guides = getAllGuides().slice(0, 4);
  const featuredAreas = areasWithClinics.slice(0, 3);
  const nearbyAreas = featuredAreas.map((area) => area.name).join(', ');

  const title = `Dental Clinics in ${stateData.name}`;
  const description = `Explore ${totalClinics} dental clinics across cities like ${nearbyAreas} in ${stateData?.name}. Find services, reviews, and opening hours.`;
  const indexedTitle = countedPlaceTitle(totalClinics, 'Dental Clinic', stateData.name);
  const documentTitle = paginatedTitle(indexedTitle, currentPage, totalPages);
  const documentDescription = paginatedDescription(description, currentPage, {
    perPage: limit,
    totalItems: totalClinics,
    noun: 'clinics',
  });
  const heading = currentPage > 1 ? documentTitle : title;

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
  const listingClinics = [...(stateData.clinics ?? [])]
    .sort((left, right) => Number(right.is_featured) - Number(left.is_featured))
    .map((clinic) => listingClinicFromPage(clinic, { state: stateData.name }));
  const sampleArea = stateData.areas?.[0]?.name;
  const heroStats = locationHeroStats(totalClinics, facets, glance);
  const sundayCount = facets.total > 0 ? facets.sunday : glance.sundayOpenCount;
  const whatsappCount = facets.total > 0 ? facets.whatsapp : glance.whatsappCount;

  return (
    <>
      <BreadcrumbJsonLd itemListElements={JSONLDbreadcrumbs} />
      <CollectionPageJsonLd
        name={currentPage > 1 ? documentTitle : `Dental Clinics in ${stateData.name}`}
        url={listingCanonicalPath(`/${state}`, currentPage)}
        description={currentPage > 1 ? documentDescription : description}
        clinics={stateData.clinics ?? []}
      />
      <LocationHero
        breadcrumbItems={breadcrumbItems}
        heading={heading}
        intro={`Compare ${totalClinics.toLocaleString('en-MY')} dental clinics in ${stateData.name} by ratings, opening hours, services and contact options.`}
        backHref={`/${state}`}
        placeName={stateData.name}
        currentPage={currentPage}
        backgroundSrc={stateBackgroundSrc}
        searchBasePath={`/${state}`}
        searchPlaceholder={`Search clinics in ${stateData.name}...`}
        stats={heroStats}
      />
      <section className="bg-white dark:bg-gray-900">
        <Container className="py-8 md:py-10">
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
                      <ClinicResultGrid
                        clinics={listingClinics}
                        showSampleCards={currentPage === 1}
                        sampleState={stateData.name}
                        sampleArea={sampleArea}
                      />
                      <Pagination currentPage={currentPage} totalPages={totalPages} />
                    </div>
                  </div>
                }
              >
                <LocationBrowser
                  basePath={`/${state}`}
                  scope={{ kind: 'state', stateSlug: state }}
                  limit={limit}
                  currentPage={currentPage}
                  totalClinics={totalClinics}
                  totalPages={totalPages}
                  clinics={listingClinics}
                  facets={facets}
                  showSampleCards={currentPage === 1}
                  sampleState={stateData.name}
                  sampleArea={sampleArea}
                  emptyHref={`/${state}`}
                  listHeading={indexedTitle}
                />
              </Suspense>
              {currentPage === 1 ? (
                <LocationSeo
                  placeName={stateData.name}
                  placeLabel={stateData.name}
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
                No dental clinics found in {stateData.name}.
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
      <HomeCtaStrip />
    </>
  );
}

