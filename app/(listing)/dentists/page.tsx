import { Metadata } from 'next';

import { siteConfig } from '@/config/site';

import { absoluteUrl } from '@/lib/utils';

import { getDoctors } from '@/helpers/doctors';

import { DoctorCard } from '@/components/cards/doctor-card';
import BreadcrumbJsonLd from '@/components/structured-data/breadcrumb-json-ld';
import WebPageJsonLd from '@/components/structured-data/web-page-json-ld';
import WebsiteJsonLd from '@/components/structured-data/website-json-ld';
import Container from '@/components/ui/container';
import Prose from '@/components/ui/prose';
import { Wrapper } from '@/components/ui/wrapper';

const config = {
  title: 'Find the Best Top Dentists in Malaysia | Find Trusted Dental Professionals Near You',
  description:
    'Discover dentists across Malaysia. Browse by state, city, or clinic to find a dentist near you. Information includes clinic locations and contact details.',
  url: '/dentists',
};

export const metadata: Metadata = {
  title: config.title,
  description: config.description,
  alternates: {
    canonical: config.url,
  },
  openGraph: {
    title: config.title,
    description: config.description,
    url: config.url,
    images: [
      {
        url: new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/og?title=${config.title}`),
        width: siteConfig.openGraph.width,
        height: siteConfig.openGraph.height,
        alt: config.title,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    title: config.title,
    description: config.description,
    card: 'summary_large_image',
    creator: siteConfig.creator,
    images: [
      {
        url: new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/og?title=${config.title}`),
        width: siteConfig.openGraph.width,
        height: siteConfig.openGraph.height,
        alt: config.title,
      },
    ],
  },
};

export default async function DentistsPage() {
  const [doctorsResult] = await Promise.all([getDoctors({ limit: 50 })]);

  const doctors = doctorsResult.data;

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
    position: `${index + 1}`,
  }));

  const addListItemsJsonLd = () => {
    return {
      __html: `{
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "${config.title}",
        "description": "${config.description}",
        "itemListElement": ${JSON.stringify(JSONLDlistItems)}
      }`,
    };
  };

  return (
    <>
      <WebsiteJsonLd />
      <WebPageJsonLd
        description={config.description}
        id={`/dentists`}
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
          <Prose>
            <h1 className="text-balance text-4xl font-black">Find the Best Dentists in Malaysia</h1>
            <p className="text-balance text-lg font-medium text-gray-600">
              Browse dentists by state, city, or affiliated clinic. Helping you find dental
              professionals near you, faster.
            </p>
          </Prose>

          <div className="my-12 space-y-8">
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

            {/* Browse by Specialty */}
            {/* <section>
                <h2 className="mb-6 text-2xl font-semibold">Browse by Specialty</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {specialties.map((specialty) => (
                    <Link
                      key={specialty}
                      href={`/dentists/specialty/${encodeURIComponent(specialty || '')}`}
                      className="block rounded-lg border p-4 transition-colors hover:bg-gray-50">
                      <h3 className="font-medium text-gray-900">{specialty}</h3>
                    </Link>
                  ))}
                </div>
              </section> */}

            {/* All Dentists */}
            <section>
              <h2 className="mb-6 text-balance text-xl font-bold md:text-2xl">All Dentists</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {doctors.slice(0, 12).map((doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
              </div>
              {/* TODO add pagination */}
              {/* {doctors.length > 12 && (
                <div className="mt-8 text-center">
                  <Link
                    href="/dentists/all"
                    className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700">
                    View All Dentists
                  </Link>
                </div>
              )} */}
            </section>
          </div>
        </Container>
      </Wrapper>
    </>
  );
}
