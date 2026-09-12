import React from 'react';

import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ClinicImage } from '@/types/clinic';
import { ArrowRightIcon } from 'lucide-react';

import { siteConfig } from '@/config/site';

import { getAllServicesCached } from '@/lib/data';
import { imageKitUrl } from '@/lib/imagekit-url';
import { listingCanonicalPath } from '@/lib/listing/pagination';
import { MEDIA } from '@/lib/media-sizes';
import { cn, getPagination } from '@/lib/utils';
import { absoluteUrl } from '@/lib/utils';

import { getClinicByServiceId } from '@/helpers/clinics';

import { LazyAdsArticle } from '@/components/ads/lazy-ads-article';
import { ClinicCard } from '@/components/cards/clinic-card';
import { MediaImage } from '@/components/image/media-image';
import BreadcrumbJsonLd from '@/components/structured-data/breadcrumb-json-ld';
import WebPageJsonLd from '@/components/structured-data/web-page-json-ld';
import { buttonVariants } from '@/components/ui/button';
import Container from '@/components/ui/container';
import { Pagination } from '@/components/ui/pagination';
import { Wrapper } from '@/components/ui/wrapper';

type ServiceListingProps = {
  serviceSlug: string;
  currentPage: number;
};

export async function generateServiceListingMetadata(
  serviceSlug: string,
  currentPage: number,
): Promise<Metadata> {
  const services = await getAllServicesCached();
  const serviceData = services.find((service) => service.slug === serviceSlug);

  if (!serviceData) {
    notFound();
  }

  const serviceName = serviceData.name;
  const serviceDescription = serviceData.description || serviceData.name;

  const title = `${serviceName} - Find Top Dental Clinics`;
  const description = `Find qualified dental clinics offering ${serviceDescription.toLowerCase()} services near you. Compare reviews, locations, and book appointments online.`;
  const url = absoluteUrl(listingCanonicalPath(`/services/${serviceSlug}`, currentPage));

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

export async function ServiceListing({ serviceSlug, currentPage }: ServiceListingProps) {
  const limit = 20;
  const { from, to } = getPagination(currentPage, limit);

  const services = await getAllServicesCached();
  const serviceData = services.find((service) => service.slug === serviceSlug);

  if (!serviceData) {
    notFound();
  }

  const clinicsResult = await getClinicByServiceId(serviceData.id, from, to);

  const clinics = clinicsResult.clinics || [];
  const totalClinics = clinicsResult.count || 0;
  const totalPages = Math.ceil(totalClinics / limit);
  const { name: serviceName } = serviceData;
  const serviceDescription = serviceData.description ?? serviceData.name;

  const title = `${serviceName} - Find Top Dental Clinics`;
  const description = `Find qualified dental clinics offering ${serviceDescription.toLowerCase()} services near you. Compare reviews, locations, and book appointments online.`;

  const JSONLDbreadcrumbs = [
    {
      item: `${process.env.NEXT_PUBLIC_BASE_URL}`,
      name: 'Home',
      position: '1',
    },
    {
      // TODO: change to services
      item: absoluteUrl(`/browse`),
      name: 'Services',
      position: '2',
    },
    {
      item: absoluteUrl(`/services/${serviceSlug}`),
      name: serviceData.name,
      position: '3',
    },
  ];

  const JSONLDlistItems = clinics.slice(0, 20).map((clinic, index) => ({
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
      <WebPageJsonLd
        description={description}
        id={`/services/${serviceSlug}`}
        reviewedBy={process.env.NEXT_PUBLIC_SCHEMA_REVIEWER}
      />
      <BreadcrumbJsonLd itemListElements={JSONLDbreadcrumbs} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: title,
            itemListElement: JSONLDlistItems,
          }),
        }}
      />
      <Wrapper>
        <Container>
          <h1 className="mb-0 font-display text-xl font-black leading-7 text-gray-800 sm:truncate sm:text-3xl sm:leading-9 dark:text-gray-50">
            {serviceData.name}
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">{serviceData.description}</p>
        </Container>
      </Wrapper>

      <Wrapper className="py-0 md:py-0">
        <Container>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {services.map((service) => (
              <Link
                href={absoluteUrl(`/services/${service.slug}`)}
                className="text-balance py-1 text-base font-medium hover:border-transparent md:text-lg"
                key={service.slug}
                prefetch={false}>
                {service.name}
              </Link>
            ))}
          </div>
        </Container>
      </Wrapper>

      <Wrapper>
        <Container>
          <h2 className="mb-6 text-balance font-display text-xl font-bold md:text-2xl">
            {totalClinics} Dental Clinics that provides {serviceData.name}
          </h2>
          {clinics.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
                {clinics
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
                          image={
                            clinic.images?.[0]
                              ? (clinic.images[0] as ClinicImage)
                              : undefined
                          }
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
              <h2 className="text-balance font-display text-2xl font-bold md:text-4xl">Oops!</h2>
              <p className="text-balance text-lg">No dental clinics provides {serviceData.name}.</p>
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
    </>
  );
}
