import React from 'react';

import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ArrowRightIcon } from 'lucide-react';

import { siteConfig } from '@/config/site';

import { absoluteUrl, getPagination } from '@/lib/utils';
import { cn } from '@/lib/utils';

import { getDoctors } from '@/helpers/doctors';

import { LazyAdsArticle } from '@/components/ads/lazy-ads-article';
import { DoctorCard } from '@/components/cards/doctor-card';
import BreadcrumbJsonLd from '@/components/structured-data/breadcrumb-json-ld';
import WebPageJsonLd from '@/components/structured-data/web-page-json-ld';
import Container from '@/components/ui/container';
import { Pagination } from '@/components/ui/pagination';
import Prose from '@/components/ui/prose';
import { Wrapper } from '@/components/ui/wrapper';

type DentistsPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ searchParams }: DentistsPageProps): Promise<Metadata> {
  const { page } = await searchParams;

  const doctorsResult = await getDoctors();

  const totalDoctors = doctorsResult.count || 0;

  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('en-US', { month: 'long' });
  const currentYear = currentDate.getFullYear();

  const title = `Browse Top ${totalDoctors} Dentists in Malaysia [${currentMonth} ${currentYear}]`;
  const description =
    'Find dentists across Malaysia. Browse by state, city, or clinic to find a dentist near you. Information includes clinic locations and contact details.';
  const url = !page
    ? absoluteUrl('/dentists')
    : page === '1'
      ? absoluteUrl('/dentists')
      : absoluteUrl(`/dentists?page=${page}`);

  // Build the OG image URL
  const ogImageUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/og`);
  ogImageUrl.searchParams.set('title', title);

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

export default async function DentistsPage({ searchParams }: DentistsPageProps) {
  const { page } = await searchParams;

  const limit = 20;
  const currentPage = page ? +page : 1;
  const { from } = getPagination(currentPage, limit);

  // Fetch doctors with pagination
  const [doctorsResult] = await Promise.all([getDoctors({ limit, offset: from })]);

  const doctors = doctorsResult.data;
  const totalDoctors = doctorsResult.count || 0;
  const totalPages = Math.ceil(totalDoctors / limit);

  if (currentPage > totalPages && totalPages > 0) {
    notFound();
  }

  const featuredDoctors = doctors.filter((doctor) => doctor.is_featured);

  const JSONLDbreadcrumbs = [
    {
      item: `${process.env.NEXT_PUBLIC_BASE_URL}`,
      name: 'Home',
      position: '1',
    },
    {
      item: `${process.env.NEXT_PUBLIC_BASE_URL}/dentists`,
      name: 'Dentists',
      position: '2',
    },
  ];

  const JSONLDlistItems = doctors?.map((doctor, index) => ({
    '@type': 'ListItem',
    name: doctor.name,
    url: absoluteUrl(`/dentist/${doctor.slug}`),
    position: `${from + index + 1}`,
  }));

  const addListItemsJsonLd = () => {
    return {
      __html: `{
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Dentists in Malaysia",
        "description": "Discover dentists across Malaysia. Browse by state, city, or clinic to find a dentist near you.",
        "itemListElement": ${JSON.stringify(JSONLDlistItems)}
      }`,
    };
  };

  const doctorByState = [
    {
      href: '/selangor/dentists',
      title: 'Dentists in Selangor',
      description: 'Find dentists in Selangor',
    },
    {
      href: '/kuala-lumpur/dentists',
      title: 'Dentists in Kuala Lumpur',
      description: 'Find dentists in Kuala Lumpur',
    },
    {
      href: '/penang/dentists',
      title: 'Dentists in Penang',
      description: 'Find dentists in Penang',
    },
    {
      href: '/johor/dentists',
      title: 'Dentists in Johor',
      description: 'Find dentists in Johor',
    },
    {
      href: '/sarawak/dentists',
      title: 'Dentists in Sarawak',
      description: 'Find dentists in Sarawak',
    },
    {
      href: '/perak/dentists',
      title: 'Dentists in Perak',
      description: 'Find dentists in Perak',
    },
  ];

  return (
    <>
      <WebPageJsonLd
        description="Discover dentists across Malaysia. Browse by state, city, or clinic to find a dentist near you. Information includes clinic locations and contact details."
        id="/dentists"
        lastReviewed={new Date().toISOString()}
        reviewedBy={process.env.NEXT_PUBLIC_SCHEMA_REVIEWER}
      />
      <BreadcrumbJsonLd itemListElements={JSONLDbreadcrumbs} />
      <script
        id="dentist-list-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={addListItemsJsonLd()}
      />
      <Wrapper>
        <Container>
          <div className="flex min-w-0 flex-1 flex-col gap-y-6 md:gap-y-12">
            <Prose>
              <h1 className="text-balance text-4xl font-black">
                Find the Best Dentists in Malaysia
              </h1>
              <p className="text-balance text-lg font-medium text-gray-600">
                Browse dentists by{' '}
                <Link
                  href="/browse"
                  className="text-blue-500 hover:border-blue-600 hover:text-blue-600"
                  prefetch={false}>
                  state
                </Link>
                , or{' '}
                <Link
                  href="/browse"
                  className="text-blue-500 hover:border-blue-600 hover:text-blue-600"
                  prefetch={false}>
                  city
                </Link>
                . Helping you find dental professionals near you, faster.
              </p>
            </Prose>

            <section className="">
              <h2 className="mb-6 text-2xl font-semibold">Browse Dentists by State</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {doctorByState.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn('flex w-fit flex-row items-center gap-2 text-start font-normal')}
                    prefetch={false}>
                    <span>
                      <span className="block font-medium">{link.title}</span>
                    </span>
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </section>

            <div className="space-y-8">
              {/* Featured Dentists */}
              {featuredDoctors.length > 0 && (
                <section>
                  <h2 className="mb-6 text-2xl font-semibold">Featured Dentists</h2>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
                    {featuredDoctors.slice(0, 6).map((doctor) => (
                      <DoctorCard key={doctor.id} doctor={doctor} />
                    ))}
                  </div>
                </section>
              )}

              {/* All Dentists */}
              <section>
                <h2 className="mb-6 text-balance text-xl font-bold md:text-2xl">
                  All Dentists ({totalDoctors})
                </h2>
                {doctors.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {doctors.map((doctor, index) => (
                        <React.Fragment key={doctor.id}>
                          {(index + 1) % 6 == 0 && <LazyAdsArticle />}
                          <DoctorCard doctor={doctor} />
                        </React.Fragment>
                      ))}
                    </div>
                    <Pagination currentPage={currentPage} totalPages={totalPages} />
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-y-4 py-12">
                    <h3 className="text-balance text-xl font-semibold">No dentists found</h3>
                    <p className="text-balance text-gray-600">
                      We couldn&apos;t find any dentists matching your criteria.
                    </p>
                  </div>
                )}
              </section>
            </div>
          </div>
        </Container>
      </Wrapper>
    </>
  );
}
