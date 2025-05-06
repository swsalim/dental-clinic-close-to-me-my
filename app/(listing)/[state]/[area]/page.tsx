import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { siteConfig } from '@/config/site';

import { absoluteUrl } from '@/lib/utils';

import { getAreaBySlug, getAreaListings, getAreaMetadataBySlug } from '@/helpers/areas';

import { ClinicCard } from '@/components/cards/clinic-card';
import BreadcrumbJsonLd from '@/components/structured-data/breadcrumb-json-ld';
import WebPageJsonLd from '@/components/structured-data/web-page-json-ld';
import WebsiteJsonLd from '@/components/structured-data/website-json-ld';
import Breadcrumb from '@/components/ui/breadcrumb';
import Container from '@/components/ui/container';
import { Wrapper } from '@/components/ui/wrapper';

type AreaPageProps = {
  params: Promise<{
    state: string;
    area: string;
  }>;
};

export async function generateMetadata({ params }: AreaPageProps): Promise<Metadata> {
  const { state, area } = await params;

  const areaData = await getAreaMetadataBySlug(area);

  if (!areaData) {
    notFound();
  }

  const validState = areaData?.state?.slug === state;

  if (!validState || !areaData) {
    notFound();
  }

  const title = `Dental Clinic in ${areaData.name}, ${areaData.state.name}`;
  const description = `Explore trusted dental clinics located in ${areaData.name}, ${areaData.state.name}. Find services, reviews, and opening hours.`;

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(`/${state}/${area}`),
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/${state}/${area}`),
      images: [
        {
          url: new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/og?title=${areaData.name}`),
          width: siteConfig.openGraph.width,
          height: siteConfig.openGraph.height,
          alt: areaData?.name,
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
          url: new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/og?title=${areaData?.name}`),
          width: siteConfig.openGraph.width,
          height: siteConfig.openGraph.height,
          alt: areaData?.name,
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

export default async function AreaPage({ params }: AreaPageProps) {
  const { state, area } = await params;

  const areaData = await getAreaBySlug(area);

  const validState = areaData?.state?.slug === state;

  if (!validState || !areaData) {
    notFound();
  }

  const title = `Find Dental Clinics in ${areaData.name}, ${areaData.state?.name}`;
  const description = `Explore ${areaData.clinics?.length} trusted dental clinics across cities in ${areaData.state?.name}. Find services, reviews, and opening hours.`;

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

  const JSONLDlistItems = areaData.clinics?.map((clinic, index) => ({
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
        id={`/${state}/${area}`}
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
            name: `Dental Clinics in ${areaData.name}, ${areaData.state?.name}`,
            directory: `Directory of Dental Clinics in ${areaData.name}, ${areaData.state?.name}, Malaysia`,
            itemListElement: JSONLDlistItems,
          }),
        }}
      />
      <Wrapper
        style={{
          backgroundImage: `url('${areaData.banner_image || areaData.thumbnail_image || areaData.state?.banner_image || areaData.state?.thumbnail_image}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
        }}
        className="before:absolute before:inset-0 before:bg-black/50 before:content-['']">
        <Container className="relative z-10">
          <Breadcrumb items={breadcrumbItems} theme="dark" />
          <h1 className="text-balance text-4xl font-black text-white">{title}</h1>
          <p className="text-balance text-lg font-medium text-white">
            Explore {areaData.clinics?.length} trusted dental clinics across cities in{' '}
            <Link href={absoluteUrl(`/${areaData.state?.slug}`)}>{areaData.state?.name}</Link>. Find
            services, reviews, and opening hours.
          </p>
        </Container>
      </Wrapper>
      <Wrapper>
        <Container>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
            {areaData.clinics?.map((clinic) => (
              <ClinicCard
                key={clinic.slug}
                slug={clinic.slug ?? ''}
                name={clinic.name ?? ''}
                address={clinic.address ?? ''}
                phone={clinic.phone ?? ''}
                image={clinic.images?.[0]}
                rating={clinic.rating}
              />
            ))}
          </div>
        </Container>
      </Wrapper>
    </>
  );
}
