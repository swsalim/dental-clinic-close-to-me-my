import React from 'react';

import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ArrowRightIcon } from 'lucide-react';

import { siteConfig } from '@/config/site';

import { absoluteUrl, getPagination } from '@/lib/utils';
import { cn } from '@/lib/utils';

import { getDoctorsByState } from '@/helpers/doctors';
import { getStateBySlug, getStateListings } from '@/helpers/states';

import { LazyAdsArticle } from '@/components/ads/lazy-ads-article';
import { DoctorCard } from '@/components/cards/doctor-card';
import { ImageKit } from '@/components/image/image-kit';
import BreadcrumbJsonLd from '@/components/structured-data/breadcrumb-json-ld';
import WebPageJsonLd from '@/components/structured-data/web-page-json-ld';
import Breadcrumb from '@/components/ui/breadcrumb';
import Container from '@/components/ui/container';
import { Pagination } from '@/components/ui/pagination';
import Prose from '@/components/ui/prose';
import { Wrapper } from '@/components/ui/wrapper';

type DentistsByStatePageProps = {
  params: Promise<{
    state: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: DentistsByStatePageProps): Promise<Metadata> {
  const { state } = await params;
  const { page } = await searchParams;

  const limit = 20;
  const parsedPage = page ? Number(page) : 1;
  const currentPage = isNaN(parsedPage) || parsedPage < 1 ? 1 : Math.floor(parsedPage);
  const { from, to } = getPagination(currentPage, limit);
  const stateData = await getStateBySlug(state, from, to);

  if (!stateData) {
    // Enhanced logging for production debugging
    console.error(`[DentistsByStatePage] State not found: "${state}"`);
    console.error(`[DentistsByStatePage] Pagination: from=${from}, to=${to}`);
    notFound();
  }

  const doctorsResult = await getDoctorsByState(state, 1, 0);
  const totalDoctors = doctorsResult.count || 0;

  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('en-US', { month: 'long' });
  const currentYear = currentDate.getFullYear();

  const title = `Top ${totalDoctors} Dentists in ${stateData.name} [${currentMonth} ${currentYear}]`;
  const description = `Discover ${totalDoctors} dentists in ${stateData.name}. Browse by city or clinic to find a dentist near you. Information includes clinic locations and contact details.`;
  const url = !page
    ? absoluteUrl(`/${state}/dentists`)
    : page === '1'
      ? absoluteUrl(`/${state}/dentists`)
      : absoluteUrl(`/${state}/dentists?page=${page}`);

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

export async function generateStaticParams() {
  const states = await getStateListings();

  // Log in production to debug build-time issues
  if (process.env.NODE_ENV === 'production') {
    console.log('[generateStaticParams] States found:', states.length);
    const sarawakExists = states.some((s) => s.slug === 'sarawak');
    console.log('[generateStaticParams] Sarawak exists:', sarawakExists);
  }

  return states.map((state) => ({
    state: state.slug,
  }));
}

// CRITICAL: Allow dynamic params not in generateStaticParams to be generated on-demand
// Without this, routes not pre-generated at build time will return 404 in production
export const dynamicParams = true;

export default async function DentistsByStatePage({
  params,
  searchParams,
}: DentistsByStatePageProps) {
  const { state } = await params;
  const { page } = await searchParams;

  const limit = 20;
  const parsedPage = page ? Number(page) : 1;
  const currentPage = isNaN(parsedPage) || parsedPage < 1 ? 1 : Math.floor(parsedPage);
  const { from, to } = getPagination(currentPage, limit);

  // Fetch state metadata and doctors data in parallel
  const [stateData, doctorsResult] = await Promise.all([
    getStateBySlug(state, from, to),
    getDoctorsByState(state, limit, from),
  ]);

  if (!stateData) {
    // Enhanced logging for production debugging
    console.error(`[DentistsByStatePage] State not found at runtime: "${state}"`);
    console.error(`[DentistsByStatePage] Pagination: from=${from}, to=${to}`);
    notFound();
  }

  const doctors = doctorsResult.data;
  const totalDoctors = doctorsResult.count || 0;
  const totalPages = Math.ceil(totalDoctors / limit);

  if (currentPage > totalPages && totalPages > 0) {
    notFound();
  }

  const featuredDoctors = doctors.filter((doctor) => doctor.is_featured);

  const breadcrumbItems = [
    {
      name: 'Dentists',
      url: '/dentists',
    },
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
      item: `${process.env.NEXT_PUBLIC_BASE_URL}/dentists`,
      name: 'Dentists',
      position: '2',
    },
    {
      item: absoluteUrl(`/${state}/dentists`),
      name: stateData.name,
      position: '3',
    },
  ];

  // TODO: add JSON-LD list items for dentists
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
        "name": "Dentists in ${stateData.name}",
        "description": "Discover dentists in ${stateData.name}. Browse by city or clinic to find a dentist near you.",
        "itemListElement": ${JSON.stringify(JSONLDlistItems)}
      }`,
    };
  };

  const title = `Dentists in ${stateData.name}`;
  const description = `Discover ${totalDoctors} dentists in ${stateData.name}. Browse by city or clinic to find a dentist near you. Information includes clinic locations and contact details.`;

  return (
    <>
      <WebPageJsonLd
        description={description}
        id={`/${state}/dentists`}
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
            <Breadcrumb items={breadcrumbItems} />

            <Prose>
              <h1 className="text-balance text-4xl font-black">{title}</h1>
              <p className="text-balance text-lg font-medium text-gray-600">
                Discover {totalDoctors} dentists in {stateData.name}. Browse by city or clinic to
                find a dentist near you.
              </p>
            </Prose>

            <div className="space-y-8">
              {/* Featured Dentists */}
              {featuredDoctors.length > 0 && (
                <section>
                  <h2 className="mb-6 text-2xl font-semibold">
                    Featured Dentists in {stateData.name}
                  </h2>
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
                  All Dentists in {stateData.name} ({totalDoctors})
                </h2>
                {doctors.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {doctors.map((doctor, index) => (
                        <React.Fragment key={doctor.id}>
                          {index === 5 && (
                            <div className="flex flex-col items-center justify-center gap-2 text-center">
                              <a
                                href="https://dub.sh/darley-toothpaste"
                                className="hover:!border-b-transparent">
                                <ImageKit
                                  src="watson-toothpaste-1-1.avif"
                                  directory="images"
                                  alt="Darlie toothpaste"
                                  width={600}
                                  height={600}
                                  priority
                                  quality={85}
                                  sizes="100vw"
                                  className="mb-0 h-auto w-full object-cover"
                                  style={{
                                    objectPosition: 'center center',
                                  }}
                                />
                              </a>
                              <a
                                href="https://dub.sh/watsons-promo"
                                className="text-sm !font-medium text-blue-500 hover:border-0 hover:text-blue-400 hover:no-underline dark:text-blue-300 dark:hover:text-blue-400">
                                Browse Watsons Promotions
                              </a>
                            </div>
                          )}
                          {index !== 5 && (index + 1) % 6 == 0 && <LazyAdsArticle />}
                          <DoctorCard doctor={doctor} />
                        </React.Fragment>
                      ))}
                    </div>
                    <Pagination currentPage={currentPage} totalPages={totalPages} />
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-y-4 py-12">
                    <h3 className="text-balance text-xl font-semibold">
                      No dentists found in {stateData.name}
                    </h3>
                    <p className="text-balance text-gray-600">
                      We couldn&apos;t find any dentists in {stateData.name} at the moment.
                    </p>
                    <div className="flex flex-col gap-y-2 md:flex-row md:gap-x-3">
                      <Link
                        href="/dentists"
                        className={cn(
                          'inline-flex items-center gap-x-2 text-blue-600 hover:text-blue-800',
                        )}
                        prefetch={false}>
                        Browse all dentists
                        <ArrowRightIcon className="h-4 w-4" />
                      </Link>
                    </div>
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
