import React from 'react';

import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ClinicImage } from '@/types/clinic';
import { ArrowRightIcon } from 'lucide-react';

import { siteConfig } from '@/config/site';

import { absoluteUrl, cn, getPagination } from '@/lib/utils';

import { getAreaBySlug, getAreaListings, getAreaMetadataBySlug } from '@/helpers/areas';
import { getStateMetadataBySlug } from '@/helpers/states';

import { LazyAdsArticle } from '@/components/ads/lazy-ads-article';
import { ClinicCard } from '@/components/cards/clinic-card';
import AddBookingForm from '@/components/forms/add-booking-form';
import { ImageKit } from '@/components/image/image-kit';
import BreadcrumbJsonLd from '@/components/structured-data/breadcrumb-json-ld';
import CollectionPageJsonLd from '@/components/structured-data/collection-page-json-ld';
import Breadcrumb from '@/components/ui/breadcrumb';
import { buttonVariants } from '@/components/ui/button';
import Container from '@/components/ui/container';
import { Pagination } from '@/components/ui/pagination';
import Prose from '@/components/ui/prose';
import { Wrapper } from '@/components/ui/wrapper';

type AreaPageProps = {
  params: Promise<{
    state: string;
    area: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params, searchParams }: AreaPageProps): Promise<Metadata> {
  const { state, area } = await params;
  const { page } = await searchParams;

  const areaData = await getAreaMetadataBySlug(area);

  if (!areaData) {
    notFound();
  }

  const validState = areaData?.state?.slug === state;

  if (!validState || !areaData) {
    notFound();
  }

  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('en-US', { month: 'long' });
  const currentYear = currentDate.getFullYear();
  const title = `Top ${areaData.clinics?.length} Dental Clinics in ${areaData.name}, ${areaData.state.name} [${currentMonth} ${currentYear}]`;
  const description = `Explore ${areaData.clinics?.length} trusted dental clinics located in ${areaData.name}, ${areaData.state.name}. Find services, reviews, and opening hours.`;
  const url = !page
    ? absoluteUrl(`/${state}/${area}`)
    : page === '1'
      ? absoluteUrl(`/${state}/${area}`)
      : absoluteUrl(`/${state}/${area}?page=${page}`);

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
  };
}

export async function generateStaticParams() {
  const areas = await getAreaListings();

  return areas.map((area) => ({
    state: area.state?.slug,
    area: area.slug,
  }));
}

// Allow dynamic rendering to handle pagination searchParams
export const revalidate = 3600; // Revalidate every hour (3600 seconds)

export default async function AreaPage({ params, searchParams }: AreaPageProps) {
  const { state, area } = await params;
  const { page } = await searchParams;
  const isJohorBahru = state === 'johor' && area === 'johor-bahru';

  const limit = isJohorBahru ? 21 : 20;
  const currentPage = page ? +page : 1;
  const { from, to } = getPagination(currentPage, limit);

  // Fetch area metadata and clinics data in parallel
  const [areaMeta, areaData, stateMeta] = await Promise.all([
    getAreaMetadataBySlug(area),
    getAreaBySlug(area, from, to),
    getStateMetadataBySlug(state),
  ]);

  // Early validation
  if (!areaMeta || !areaData || !stateMeta) {
    notFound();
  }

  const validState = areaMeta.state?.slug === state;
  if (!validState) {
    notFound();
  }

  const totalClinics = areaMeta.clinics?.length || 0;
  const totalPages = Math.ceil(totalClinics / limit);

  const title = `Top Dental Clinics in ${areaData.name}, ${areaData.state?.name}`;
  const description = `Explore ${totalClinics} trusted dental clinics across cities in ${areaData.state?.name}. Find services, reviews, and opening hours.`;

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
        {(areaData.image || areaData.state?.image) && (
          <ImageKit
            src={areaData.image || areaData.state?.image || ''}
            alt={`${areaData.name}, ${areaData.state?.name} aesthetic clinics background`}
            width={1920}
            height={600}
            priority
            quality={85}
            sizes="100vw"
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
            <h1 className="text-balance text-4xl font-black text-white">{title}</h1>
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
          {isJohorBahru && (
            <Prose className="mb-12 block lg:hidden">
              <AddBookingForm currentUrl={absoluteUrl(`/${state}/${area}`)} area={areaData.name} />
            </Prose>
          )}
          <h2 className="mb-6 text-balance text-xl font-bold md:text-2xl">
            {totalClinics} Dental Clinics in {areaData.name}, {areaData.state?.name}
          </h2>
          {areaData.clinics?.length > 0 ? (
            <>
              <div className={cn(isJohorBahru && 'grid grid-cols-1 gap-8 lg:grid-cols-sidebar')}>
                <div
                  className={cn(
                    'grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8',
                    !isJohorBahru && 'lg:grid-cols-4',
                  )}>
                  {areaData.clinics
                    ?.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0))
                    .map((clinic, index) => {
                      return (
                        <React.Fragment key={clinic.slug}>
                          {(index + 1) % 6 == 0 && <LazyAdsArticle />}
                          <ClinicCard
                            key={clinic.slug}
                            slug={clinic.slug ?? ''}
                            name={clinic.name ?? ''}
                            address={clinic.address ?? ''}
                            phone={clinic.phone ?? ''}
                            image={
                              clinic.images?.[0]
                                ? (clinic.images[0] as unknown as ClinicImage).image_url
                                : undefined
                            }
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
                {isJohorBahru && (
                  <Prose className="hidden lg:block">
                    <AddBookingForm
                      currentUrl={absoluteUrl(`/${state}/${area}`)}
                      area={areaData.name}
                    />
                  </Prose>
                )}
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-y-4">
              <div className="flex flex-col items-center justify-center">
                <div className="relative size-64 md:size-96">
                  <ImageKit
                    src="lost-boy.png"
                    directory="dental-clinics-my"
                    alt="No dental clinics found"
                    width={500}
                    height={500}
                    sizes="(max-width: 600px) 100vw, 450px"
                    quality={85}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <h2 className="text-balance text-2xl font-bold md:text-4xl">Oops!</h2>
              <p className="text-balance text-lg">
                We&apos;re not ready in {areaData.name}, {areaData.state?.name}.
              </p>
              <div className="flex flex-col gap-y-2 md:flex-row md:gap-x-3">
                <Link
                  href="/submit"
                  className={cn(buttonVariants({ variant: 'primary' }), 'flex flex-row gap-x-2')}
                  prefetch={false}>
                  Add a clinic
                  <ArrowRightIcon className="size-4" />
                </Link>
                <Link
                  href="/"
                  className={cn(buttonVariants({ variant: 'ghost' }), 'flex flex-row gap-x-2')}
                  prefetch={false}>
                  Get back to homepage
                  <ArrowRightIcon className="size-4" />
                </Link>
              </div>
            </div>
          )}
        </Container>
      </Wrapper>
      <Wrapper size="sm">
        <Container>
          <div className="flex flex-col gap-y-6">
            <h2 className="text-balance text-xl font-bold md:text-2xl">
              Dental Clinics near {areaData.name}, {areaData.state?.name}
            </h2>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
              {stateMeta.areas?.map((area) => (
                <h3 className="text-balance text-base font-medium" key={area.slug}>
                  <Link
                    href={absoluteUrl(`/${state}/${area.slug}`)}
                    className="py-1 hover:border-transparent"
                    prefetch={false}>
                    {area.name}, {area.state?.name}
                  </Link>
                </h3>
              ))}
            </div>
          </div>
        </Container>
      </Wrapper>
    </>
  );
}
