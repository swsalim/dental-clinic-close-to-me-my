import React from 'react';

import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ClinicImage } from '@/types/clinic';
import { ArrowRightIcon, PersonStandingIcon } from 'lucide-react';

import { siteConfig } from '@/config/site';

import { absoluteUrl, cn, getPagination } from '@/lib/utils';

import { getDoctorsByState } from '@/helpers/doctors';
import { getStateBySlug, getStateListings, getStateMetadataBySlug } from '@/helpers/states';

import { LazyAdsArticle } from '@/components/ads/lazy-ads-article';
import { ClinicCard } from '@/components/cards/clinic-card';
import { ImageCloudinary } from '@/components/image/image-cloudinary';
import { ImageKit } from '@/components/image/image-kit';
import BreadcrumbJsonLd from '@/components/structured-data/breadcrumb-json-ld';
import WebPageJsonLd from '@/components/structured-data/web-page-json-ld';
import WebsiteJsonLd from '@/components/structured-data/website-json-ld';
import Breadcrumb from '@/components/ui/breadcrumb';
import { buttonVariants } from '@/components/ui/button';
import Container from '@/components/ui/container';
import { Pagination } from '@/components/ui/pagination';
import { Wrapper } from '@/components/ui/wrapper';

type StatePageProps = {
  params: Promise<{
    state: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: StatePageProps): Promise<Metadata> {
  const { state } = await params;
  const { page } = await searchParams;

  const stateData = await getStateMetadataBySlug(state);

  if (!stateData) {
    notFound();
  }

  const nearbyAreas = stateData.areas
    ?.slice(0, 3)
    .map((area) => area.name)
    .join(', ');

  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('en-US', { month: 'long' });
  const currentYear = currentDate.getFullYear();
  const title = `Top ${stateData.clinics?.length} Dental Clinics in ${stateData.name} [${currentMonth} ${currentYear}]`;
  const description = `Explore ${stateData.clinics?.length} trusted dental clinics across cities like ${nearbyAreas} in ${stateData?.name}. Find services, reviews, and opening hours.`;
  const url = !page
    ? absoluteUrl(`/${state}`)
    : page === '1'
      ? absoluteUrl(`/${state}`)
      : absoluteUrl(`/${state}?page=${page}`);

  // Build the OG image URL with optional background image
  const ogImageUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/og-list`);
  ogImageUrl.searchParams.set('title', title);
  if (stateData.banner_image) {
    ogImageUrl.searchParams.set('image', stateData.banner_image);
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
  };
}

export async function generateStaticParams() {
  const states = await getStateListings();

  return states.map((state) => ({
    state: state.slug,
  }));
}

export default async function StatePage({ params, searchParams }: StatePageProps) {
  const { state } = await params;
  const { page } = await searchParams;

  const limit = 20;
  const currentPage = page ? +page : 1;
  const { from, to } = getPagination(currentPage, limit);

  // Fetch state metadata and clinics data in parallel
  const [stateMeta, stateData] = await Promise.all([
    getStateMetadataBySlug(state),
    getStateBySlug(state, from, to),
  ]);

  if (!stateMeta || !stateData) {
    notFound();
  }

  const doctorsResult = await getDoctorsByState(state, 5, 0);
  const doctors = doctorsResult.data;
  const totalDoctors = doctorsResult.count || 0;

  const totalClinics = stateMeta.clinics?.length || 0;
  const totalPages = Math.ceil(totalClinics / limit);

  const nearbyAreas = stateData.areas
    ?.slice(0, 3)
    .map((area) => area.name)
    .join(', ');

  const nearbyAreasWithLinks = stateData.areas?.slice(0, 3);

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

  const JSONLDlistItems = stateData.clinics?.slice(0, 20).map((clinic, index) => ({
    '@type': 'ListItem',
    position: `${index + 1}`,
    item: {
      '@type': 'Dentist',
      '@id': absoluteUrl(`/place/${clinic.slug}`),
      name: clinic.name,
      image: absoluteUrl(`/api/og?title=${clinic.name}`),
      address: {
        '@type': 'PostalAddress',
        addressLocality: clinic.area?.name,
        addressRegion: clinic.state?.name,
        postalCode: clinic.postal_code,
        streetAddress: clinic.address,
        addressCountry: 'MY',
      },
      telephone: clinic.phone,
      url: absoluteUrl(`/place/${clinic.slug}`),
    },
  }));

  return (
    <>
      <WebsiteJsonLd />
      <WebPageJsonLd
        description={description}
        id={`/${state}`}
        lastReviewed={new Date().toISOString()}
        reviewedBy={process.env.NEXT_PUBLIC_SCHEMA_REVIEWER}
      />
      <BreadcrumbJsonLd itemListElements={JSONLDbreadcrumbs} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: `Dental Clinics in ${stateData.name}`,
            itemListElement: JSONLDlistItems,
          }),
        }}
      />
      <Wrapper
        style={{
          backgroundImage: `url('${stateData.banner_image}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
        }}
        className="before:absolute before:inset-0 before:bg-black/50 before:content-['']">
        <Container className="relative z-10">
          <div className="flex flex-col gap-4 py-12 md:py-24">
            <Breadcrumb items={breadcrumbItems} theme="dark" />
            <h1 className="text-balance text-4xl font-black text-white">{title}</h1>
            <p className="text-balance text-lg font-medium text-white">
              Explore {totalClinics} trusted dental clinics across cities like{' '}
              {nearbyAreasWithLinks?.map((area, index) => (
                <>
                  <Link
                    href={absoluteUrl(`/${area.state?.slug}/${area.slug}`)}
                    key={area.slug}
                    className="text-blue-300 hover:border-blue-300 hover:text-blue-300">
                    {area.name}
                  </Link>
                  {index < nearbyAreasWithLinks.length - 2 && ', '}
                  {index === nearbyAreasWithLinks.length - 2 && ', and '}
                </>
              ))}{' '}
              in {stateData?.name}. Find services, reviews, and opening hours.
            </p>
          </div>
        </Container>
      </Wrapper>

      <Wrapper size="sm">
        <Container>
          <div className="flex flex-col gap-y-6">
            {totalDoctors > 0 && (
              <div className="flex flex-col gap-y-4 rounded-lg border-blue-300 bg-blue-50/70 px-6 py-4 text-blue-900">
                <h2 className="text-balance text-xl font-bold md:text-xl">
                  Browse Dentists in {stateData.name}
                </h2>
                <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:justify-start">
                  <div className="flex space-x-3 md:-space-x-1">
                    {doctors.map((doctor, index) => (
                      <Link
                        href={`/dentist/${doctor.slug}`}
                        className="relative size-16 overflow-hidden rounded-full outline -outline-offset-1 outline-blue-200 ring-2 ring-blue-300"
                        key={`${doctor.id}-${index}`}>
                        {doctor.images?.[0] && (
                          <ImageKit
                            src={doctor.images?.[0].image_url}
                            alt={`Photo of ${doctor.name}`}
                            width={100}
                            height={100}
                            sizes="(max-width: 600px) 100vw, 350px"
                            quality={85}
                            directory="doctors"
                            priority
                            className="h-full w-full object-cover"
                          />
                        )}
                        {!doctor.images?.[0] && (
                          <div className="mx-auto mb-6 h-full w-full p-0 md:p-0">
                            <PersonStandingIcon className="size-12" />
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                  <Link
                    href={`/${state}/dentists`}
                    className={cn(
                      buttonVariants({ variant: 'secondary' }),
                      'w-full border-blue-300 bg-blue-200/40 text-sm text-blue-800 hover:border-blue-400 hover:bg-blue-200/60 hover:text-blue-900 active:border-blue-400 active:bg-blue-200/80 active:text-blue-900 sm:w-auto',
                    )}>
                    View All Dentists
                  </Link>
                </div>
              </div>
            )}
            <h2 className="mb-6 text-balance text-xl font-bold md:text-2xl">
              {totalClinics} Dental Clinics in {stateData.name}
            </h2>
            {stateData.clinics?.length > 0 ? (
              <>
                <div
                  className={cn(
                    'grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8 lg:grid-cols-4',
                  )}>
                  {stateData.clinics
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
                            postalCode={clinic.postal_code ?? ''}
                            state={clinic.state?.name ?? ''}
                            area={clinic.area?.name ?? ''}
                            image={(clinic.images?.[0] as unknown as ClinicImage).image_url}
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
                    <ImageCloudinary
                      src="lost-boy.png"
                      alt="No dental clinics found"
                      width={500}
                      height={500}
                      className="h-full w-full object-cover"
                      sizes="(max-width: 600px) 100vw, 450px"
                      quality={85}
                    />
                  </div>
                </div>
                <h2 className="text-balance text-2xl font-bold md:text-4xl">Oops!</h2>
                <p className="text-balance text-lg">No dental clinics found in {stateData.name}.</p>
                <div className="flex flex-col gap-y-2 md:flex-row md:gap-x-3">
                  <Link
                    href="/submit"
                    className={cn(buttonVariants({ variant: 'primary' }), 'flex flex-row gap-x-2')}>
                    Add a clinic
                    <ArrowRightIcon className="size-4" />
                  </Link>
                  <Link
                    href="/"
                    className={cn(buttonVariants({ variant: 'ghost' }), 'flex flex-row gap-x-2')}>
                    Get back to homepage
                    <ArrowRightIcon className="size-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </Container>
      </Wrapper>

      <Wrapper size="sm">
        <Container>
          <div className="flex flex-col gap-y-6">
            <h2 className="text-balance text-xl font-bold md:text-2xl">
              Dental Clinics near {stateData.name}
            </h2>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
              {stateMeta.areas?.map((area) => (
                <h3 className="text-balance text-base font-medium" key={area.slug}>
                  <Link
                    href={absoluteUrl(`/${state}/${area.slug}`)}
                    className="py-1 hover:border-transparent">
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
