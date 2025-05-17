import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ArrowRightIcon } from 'lucide-react';

import { siteConfig } from '@/config/site';

import { absoluteUrl, cn } from '@/lib/utils';

import { getStateBySlug, getStateListings, getStateMetadataBySlug } from '@/helpers/states';

import { ClinicCard } from '@/components/cards/clinic-card';
import { ImageCloudinary } from '@/components/image/image-cloudinary';
import BreadcrumbJsonLd from '@/components/structured-data/breadcrumb-json-ld';
import WebPageJsonLd from '@/components/structured-data/web-page-json-ld';
import WebsiteJsonLd from '@/components/structured-data/website-json-ld';
import Breadcrumb from '@/components/ui/breadcrumb';
import { buttonVariants } from '@/components/ui/button';
import Container from '@/components/ui/container';
import { Wrapper } from '@/components/ui/wrapper';

type StatePageProps = {
  params: Promise<{
    state: string;
  }>;
};

export async function generateMetadata({ params }: StatePageProps): Promise<Metadata> {
  const { state } = await params;

  const stateData = await getStateMetadataBySlug(state);

  if (!stateData) {
    notFound();
  }

  const nearbyAreas = stateData.areas
    ?.slice(0, 3)
    .map((area) => area.name)
    .join(', ');

  const title = `Find Dental Clinics in ${stateData.name}`;
  const description = `Explore ${stateData.clinics?.length} trusted dental clinics across cities like ${nearbyAreas} in ${stateData?.name}. Find services, reviews, and opening hours.`;

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(`/${state}`),
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/${state}`),
      images: [
        {
          url: new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/og?title=${title}`),
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
  const states = await getStateListings();

  return states.map((state) => ({
    state: state.slug,
  }));
}

export default async function StatePage({ params }: StatePageProps) {
  const { state } = await params;

  const stateData = await getStateBySlug(state);

  if (!stateData) {
    notFound();
  }

  const nearbyAreas = stateData.areas
    ?.slice(0, 3)
    .map((area) => area.name)
    .join(', ');

  const nearbyAreasWithLinks = stateData.areas?.slice(0, 3);

  const title = `Find Dental Clinics in ${stateData.name}`;
  const description = `Explore ${stateData.clinics?.length} trusted dental clinics across cities like ${nearbyAreas} in ${stateData?.name}. Find services, reviews, and opening hours.`;

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

  const JSONLDlistItems = stateData.clinics?.map((clinic, index) => ({
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
            directory: `Directory of Dental Clinics in ${stateData.name}, Malaysia`,
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
              Explore {stateData.clinics?.length} trusted dental clinics across cities like{' '}
              {nearbyAreasWithLinks?.map((area, index) => (
                <>
                  <Link href={absoluteUrl(`/${area.state.slug}/${area.slug}`)} key={area.slug}>
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
      <Wrapper>
        <Container>
          {stateData.clinics?.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
              {stateData.clinics?.map((clinic) => (
                <ClinicCard
                  key={clinic.slug}
                  slug={clinic.slug ?? ''}
                  name={clinic.name ?? ''}
                  address={clinic.address ?? ''}
                  phone={clinic.phone ?? ''}
                  postalCode={clinic.postal_code ?? ''}
                  state={clinic.state?.name ?? ''}
                  area={clinic.area?.name ?? ''}
                  image={clinic.images?.[0]}
                  rating={clinic.rating}
                  hours={clinic.hours ?? []}
                  specialHours={clinic.special_hours ?? []}
                  openOnPublicHolidays={clinic.open_on_public_holidays ?? false}
                />
              ))}
            </div>
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
                  />
                </div>
              </div>
              <h2 className="text-balance text-2xl font-bold md:text-4xl">Oops!</h2>
              <p className="text-balance text-lg">No dental clinics found in {stateData.name}.</p>
              <Link
                href="/"
                className={cn(buttonVariants({ variant: 'primary' }), 'flex flex-row gap-x-2')}>
                Get back to homepage
                <ArrowRightIcon className="size-4" />
              </Link>
            </div>
          )}
        </Container>
      </Wrapper>
    </>
  );
}
