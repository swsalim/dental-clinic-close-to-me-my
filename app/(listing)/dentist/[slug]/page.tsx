import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import type { ClinicDoctor } from '@/types/clinic';

import { siteConfig } from '@/config/site';

import { absoluteUrl, cn } from '@/lib/utils';

import { getDoctorBySlug, getDoctorListings, getDoctorMetadataBySlug } from '@/helpers/doctors';

import { LazyAdsLeaderboard } from '@/components/ads/lazy-ads-leaderboard';
import { LazyAdsSquare } from '@/components/ads/lazy-ads-square';
import { ClinicCard } from '@/components/cards/clinic-card';
import { ImageCloudinary } from '@/components/image/image-cloudinary';
import BreadcrumbJsonLd from '@/components/structured-data/breadcrumb-json-ld';
import BusinessJsonLd from '@/components/structured-data/business-json-ld';
import DentistJsonLd from '@/components/structured-data/physician-json-ld';
import Breadcrumb from '@/components/ui/breadcrumb';
import { buttonVariants } from '@/components/ui/button';
import Container from '@/components/ui/container';
import Prose from '@/components/ui/prose';
import { Wrapper } from '@/components/ui/wrapper';

interface DentistPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: DentistPageProps): Promise<Metadata> {
  const { slug } = await params;
  const doctor = await getDoctorMetadataBySlug(slug);

  if (!doctor) {
    return {
      title: 'Dentist Not Found',
    };
  }

  const config = {
    title: `${doctor.name} - Dentist in ${doctor.clinics?.[0]?.area?.name}, ${doctor.clinics?.[0]?.state?.name}, Malaysia`,
    description: `Learn more about ${doctor.name}, a dentist based in ${doctor.clinics?.[0]?.area?.name}, ${doctor.clinics?.[0]?.state?.name}. View clinic location, contact number, and clinic opening hours.`,
    url: `/dentist/${slug}`,
  };

  return {
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
          url: new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/og?title=${doctor.name}`),
          width: siteConfig.openGraph.width,
          height: siteConfig.openGraph.height,
          alt: doctor.name,
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
          url: new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/og?title=${doctor.name}`),
          width: siteConfig.openGraph.width,
          height: siteConfig.openGraph.height,
          alt: doctor.name,
        },
      ],
    },
  };
}

export async function generateStaticParams() {
  const doctors = await getDoctorListings();
  return doctors.map((doctor) => ({
    slug: doctor.slug,
  }));
}

export default async function DentistPage({ params }: DentistPageProps) {
  const { slug } = await params;
  const doctor = await getDoctorBySlug(slug);

  if (!doctor) {
    notFound();
  }

  // Type assertion to ensure TypeScript recognizes the clinics property
  const doctorWithClinics = doctor as ClinicDoctor;

  const images = doctor.images || [];
  const [profileImage, ...galleryImages] = images;

  const breadcrumbItems = [
    { name: 'Dentists', url: '/dentists' },
    { name: doctorWithClinics.name },
  ];

  const JSONLDbreadcrumbs = [
    {
      item: `${process.env.NEXT_PUBLIC_BASE_URL}`,
      name: 'Home',
      position: '1',
    },
    {
      item: absoluteUrl(`/dentists`),
      name: 'Dentists',
      position: '2',
    },
    {
      item: absoluteUrl(`/dentist/${slug}`),
      name: doctorWithClinics.name,
      position: '3',
    },
  ];

  const primaryClinic =
    doctorWithClinics.clinics && doctorWithClinics.clinics.length > 0
      ? doctorWithClinics.clinics[0]
      : null;

  return (
    <>
      {doctorWithClinics.clinics && doctorWithClinics.clinics.length > 0 && (
        <BusinessJsonLd
          name={primaryClinic?.name}
          url={`${process.env.NEXT_PUBLIC_BASE_URL}/dentist/${slug}`}
          image={doctorWithClinics.images?.[0] || ''}
          email={primaryClinic?.email || null}
          phone={primaryClinic?.phone || null}
          location={{
            area: (primaryClinic?.area?.name ?? 'Unknown') as string,
            state: (primaryClinic?.state?.name ?? 'Unknown') as string,
            postal_code: (primaryClinic?.postal_code ?? 'Unknown') as string,
            address: (primaryClinic?.address ?? 'Unknown') as string,
          }}
          coordinate={{
            lat: primaryClinic?.latitude || 0,
            long: primaryClinic?.longitude || 0,
          }}
          rating={{
            value: primaryClinic?.rating || 0,
            count: primaryClinic?.review_count || 0,
          }}
        />
      )}
      <DentistJsonLd
        name={doctor.name}
        url={absoluteUrl(`/dentist/${doctor.slug}`)}
        photo={doctor.images?.[0] || ''}
        phone={primaryClinic?.phone || null}
        specialty="Dentistry"
        email={primaryClinic?.email || 'support@dentalclinicclosetome.my'}
        clinic={{
          name: primaryClinic?.name || '',
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/place/${primaryClinic?.slug}`,
        }}
        location={{
          address: primaryClinic?.address || '',
          area: primaryClinic?.area?.name || '',
          state: primaryClinic?.state?.name || '',
          country: 'Malaysia',
          postal_code: primaryClinic?.postal_code || '',
        }}
        coordinate={{
          lat: primaryClinic?.latitude || 0,
          long: primaryClinic?.longitude || 0,
        }}
      />
      <BreadcrumbJsonLd itemListElements={JSONLDbreadcrumbs} />
      <Wrapper className="pb-0 md:pb-0">
        <Container>
          <div className="py-8 md:gap-8 lg:grid lg:grid-cols-sidebar lg:gap-10">
            <div className="flex min-w-0 flex-1 flex-col gap-y-6 md:gap-y-12">
              <Breadcrumb items={breadcrumbItems} />
              {/* Doctor Header */}
              <div className="flex flex-row items-start justify-end gap-6">
                <div className="aspect-[2/3] w-full max-w-72">
                  <ImageCloudinary
                    src={profileImage}
                    alt={`${doctor.name} - Profile Image`}
                    className="h-full w-full rounded-lg object-cover"
                  />
                </div>
                <div className="flex grow flex-col items-start justify-end gap-2">
                  <h1 className="mb-0 text-xl font-black leading-7 text-gray-800 sm:truncate sm:text-3xl sm:leading-9 dark:text-gray-50">
                    {doctor.name}
                  </h1>
                  {doctor.qualification && (
                    <div
                      className="font-bold text-gray-500 dark:text-gray-500"
                      dangerouslySetInnerHTML={{ __html: doctor.qualification }}
                    />
                  )}
                  {/* Doctor Bio */}
                  {doctor.bio && (
                    <Prose className="hidden md:block">
                      <div dangerouslySetInnerHTML={{ __html: doctor.bio }} />
                    </Prose>
                  )}
                </div>
              </div>

              {/* Doctor Bio */}
              {doctor.bio && (
                <Prose className="md:hidden">
                  <div dangerouslySetInnerHTML={{ __html: doctor.bio }} />
                </Prose>
              )}

              <div>
                <LazyAdsLeaderboard />
              </div>

              {/* Doctor Images */}
              {galleryImages && galleryImages.length > 0 && (
                <Prose>
                  <h2 className="mb-4 text-xl font-semibold">Photos</h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {galleryImages.map((image, index) => (
                      <ImageCloudinary
                        key={index}
                        src={image}
                        alt={`${doctor.name} - Photo ${index + 1}`}
                        className="h-64 w-full rounded-lg object-cover"
                      />
                    ))}
                  </div>
                </Prose>
              )}

              {/* Featured Video */}
              {doctor.featured_video && (
                <Prose>
                  <h2 className="mb-4 text-xl font-semibold">Video</h2>
                  <div className="aspect-video">
                    <iframe
                      src={doctor.featured_video}
                      title={`${doctor.name} - Featured Video`}
                      className="h-full w-full rounded-lg"
                      allowFullScreen
                    />
                  </div>
                </Prose>
              )}

              {/* Associated Clinics */}
              {doctor.clinics && doctor.clinics.length > 0 && (
                <Prose>
                  <h2 className="mb-4 text-xl font-semibold">Practices At</h2>
                  <div className="not-prose grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-3">
                    {doctor.clinics.map((clinic) => (
                      <ClinicCard
                        key={clinic.id}
                        slug={clinic.slug}
                        name={clinic.name}
                        address={clinic.address ?? ''}
                        phone={clinic.phone ?? ''}
                        postalCode={clinic.postal_code ?? ''}
                        state={clinic.state?.name ?? ''}
                        area={clinic.area?.name ?? ''}
                        image={clinic.images?.[0]}
                        isFeatured={false}
                        rating={clinic.rating}
                        hours={[]}
                        specialHours={[]}
                        openOnPublicHolidays={false}
                      />
                    ))}
                  </div>
                </Prose>
              )}

              {/* Call to Action */}
              <div className="rounded-lg bg-blue-50 px-6 py-8 text-center">
                <h2 className="mb-2 mt-0 text-xl font-semibold">Book an Appointment</h2>
                <p className="mb-4 text-gray-600">
                  Ready to schedule your dental appointment with {doctor.name}?
                </p>
                {doctor.clinics && doctor.clinics.length > 0 && (
                  <div className="not-prose flex flex-col items-center justify-center gap-4 md:flex-row">
                    {doctor.clinics.map((clinic) => (
                      <Link
                        key={clinic.id}
                        href={`/place/${clinic.slug}`}
                        className={cn(buttonVariants({ variant: 'primary' }))}>
                        Book at {clinic.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <aside>
              <div className="mt-8 lg:mt-0">
                <LazyAdsSquare />
              </div>
            </aside>
          </div>
        </Container>
      </Wrapper>
    </>
  );
}
