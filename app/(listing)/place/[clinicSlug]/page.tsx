import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ClinicReview } from '@/types/clinic';
import { formatDistanceToNow } from 'date-fns';
import {
  FacebookIcon,
  InstagramIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  YoutubeIcon,
} from 'lucide-react';

import { siteConfig } from '@/config/site';

import { absoluteUrl, cn } from '@/lib/utils';

import {
  getClinicBySlug,
  getClinicListings,
  getClinicMetadataBySlug,
  parseClinicData,
} from '@/helpers/clinics';
import { getServiceIcon } from '@/helpers/services';

import { ClinicStatus } from '@/components/clinic-status';
import AddReviewForm from '@/components/forms/add-review-form';
import MapboxMap from '@/components/mapbox-map';
import BusinessJsonLd from '@/components/structured-data/business-json-ld';
import WebsiteJsonLd from '@/components/structured-data/website-json-ld';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import Container from '@/components/ui/container';
import Prose from '@/components/ui/prose';
import { StarRating } from '@/components/ui/star-rating';
import { TruncatedText } from '@/components/ui/truncated-text';
import { Wrapper } from '@/components/ui/wrapper';

type ClinicPageProps = {
  params: Promise<{
    clinicSlug: string;
  }>;
};

function Reviews({ reviews }: { reviews: Partial<ClinicReview>[] }) {
  return (
    <article>
      <h2>Reviews</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map(({ author_name, rating, text, review_time }) => (
          <Card key={`${author_name}-${review_time}`}>
            <CardHeader>
              <StarRating rating={rating ?? 0} showValue={false} />
            </CardHeader>
            {text && (
              <CardContent>
                <TruncatedText text={text} />
              </CardContent>
            )}
            <CardFooter className="flex flex-col items-start gap-1">
              <span className="text-base font-semibold text-gray-700 dark:text-gray-50">
                {author_name}
              </span>
              {review_time && (
                <span className="text-sm text-gray-500 dark:text-gray-300">
                  {formatDistanceToNow(new Date(review_time), { addSuffix: true })}
                </span>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </article>
  );
}

function Map({
  latitude = 0,
  longitude = 0,
  name = '',
}: {
  latitude: number;
  longitude: number;
  name: string;
}) {
  return (
    <article>
      <h2>Map</h2>

      <div className="mb-6 mt-2">
        <MapboxMap
          locations={[
            {
              lat: latitude,
              long: longitude,
              name,
            },
          ]}
        />
      </div>
    </article>
  );
}

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${period}`;
};

const formatShift = (open: string, close: string) => {
  const openHour = parseInt(open.split(':')[0], 10);
  const closeHour = parseInt(close.split(':')[0], 10);
  const openPeriod = openHour >= 12 ? 'PM' : 'AM';
  const closePeriod = closeHour >= 12 ? 'PM' : 'AM';

  const formattedOpen = formatTime(open);
  const formattedClose = formatTime(close);

  // If both times are in the same period, only show AM/PM once
  if (openPeriod === closePeriod) {
    return `${formattedOpen.replace(` ${openPeriod}`, '')} - ${formattedClose}`;
  }

  return `${formattedOpen} - ${formattedClose}`;
};

const renderOpeningHours = (parsedClinic: ReturnType<typeof parseClinicData>) => {
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <ul className="my-0 divide-y divide-gray-200 pl-0 dark:divide-gray-700">
      {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
        const dayShifts = parsedClinic.hours?.filter((h) => h.day_of_week === dayIndex);

        return (
          <li key={dayIndex} className="flex items-center justify-between gap-4 p-4">
            <span className="font-medium text-gray-700 dark:text-gray-50">
              {dayNames[dayIndex]}
            </span>
            <span className="text-gray-600 dark:text-gray-300">
              {dayShifts && dayShifts.length > 0
                ? dayShifts
                    .map((shift) =>
                      shift.open_time && shift.close_time
                        ? formatShift(shift.open_time, shift.close_time)
                        : 'Closed',
                    )
                    .join(', ')
                : 'Closed'}
            </span>
          </li>
        );
      })}
    </ul>
  );
};

export async function generateMetadata({ params }: ClinicPageProps): Promise<Metadata> {
  const { clinicSlug } = await params;

  const clinic = await getClinicMetadataBySlug(clinicSlug);

  if (!clinic) {
    notFound();
  }

  const title = clinic.name;
  const description = `Learn more about ${clinic.name}, a dental clinic located in ${clinic.area.name}, ${clinic.state.name}. View services, hours, and contact info.`;

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(`/place/${clinicSlug}`),
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/place/${clinicSlug}`),
      images: [
        {
          url: new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/og?title=${clinic?.name}`),
          width: siteConfig.openGraph.width,
          height: siteConfig.openGraph.height,
          alt: clinic?.name,
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
          url: new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/og?title=${clinic?.name}`),
          width: siteConfig.openGraph.width,
          height: siteConfig.openGraph.height,
          alt: clinic?.name,
        },
      ],
    },
  };
}

export async function generateStaticParams() {
  const clinics = await getClinicListings();

  return clinics.map((clinic) => ({
    clinicSlug: clinic.slug,
  }));
}

export default async function ClinicPage({ params }: ClinicPageProps) {
  const { clinicSlug } = await params;

  const rawClinicData = await getClinicBySlug(clinicSlug);

  if (!rawClinicData) {
    notFound();
  }

  const memberOf: { '@type': string; '@id': string } | null = null;

  // Format opening hours for JSON-LD using OpeningHoursSpecification
  const openingHoursSpecification =
    rawClinicData.hours?.map((hour) => {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const day = days[hour.day_of_week];
      const openTime = hour.open_time?.slice(0, 5) || '';
      const closeTime = hour.close_time?.slice(0, 5) || '';

      return {
        '@type': 'OpeningHoursSpecification' as const,
        dayOfWeek: day,
        opens: openTime,
        closes: closeTime,
      };
    }) || [];

  const parsedClinic = parseClinicData(rawClinicData);

  const hasSocialAccounts =
    parsedClinic.facebook_url || parsedClinic.instagram_url || parsedClinic.youtube_url;

  return (
    <>
      <WebsiteJsonLd />
      <BusinessJsonLd
        name={parsedClinic.name}
        url={absoluteUrl(`/place/${parsedClinic.slug}`)}
        image={absoluteUrl(`/api/og?title=${parsedClinic.name}`)}
        phone={parsedClinic.phone}
        email={parsedClinic.email}
        location={{
          address: parsedClinic.address ?? '',
          postal_code: parsedClinic.postal_code ?? '',
          area: parsedClinic.area?.name ?? '',
          state: parsedClinic.state?.name ?? '',
        }}
        coordinate={{ lat: parsedClinic.latitude ?? 0, long: parsedClinic.longitude ?? 0 }}
        rating={{ value: parsedClinic.rating || 0, count: parsedClinic.review_count || 0 }}
        memberOf={memberOf}
        openingHoursSpecification={openingHoursSpecification}
      />
      {parsedClinic.images && parsedClinic.images?.length > 0 && (
        <Wrapper
          style={{
            backgroundImage: `url('${parsedClinic.images?.[0]}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
            position: 'relative',
          }}
          className="h-56 before:absolute before:inset-0 before:bg-black/50 before:content-[''] md:h-96"></Wrapper>
      )}
      <Wrapper>
        <Container>
          <div className="lg:flex lg:items-start lg:justify-between lg:gap-x-6">
            {/* left column */}
            <div className="flex min-w-0 flex-1 flex-col gap-y-4">
              <div className="flex flex-col flex-wrap items-start justify-between gap-x-2 gap-y-2 lg:flex-row lg:items-center lg:justify-normal">
                <h1 className="mb-0 text-xl font-black leading-7 text-gray-800 sm:truncate sm:text-3xl sm:leading-9 dark:text-gray-50">
                  {parsedClinic.name}
                </h1>
                <StarRating rating={parsedClinic.rating ?? 0} />
                {/* Open/Closed Status Badge */}
                <div className="mt-2 lg:mt-0">
                  <ClinicStatus
                    hours={parsedClinic.hours ?? []}
                    specialHours={parsedClinic.special_hours ?? []}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-x-4 gap-y-2">
                <div className="flex items-center gap-x-2">
                  <MapPinIcon className="h-5 w-5 text-brand" />
                  <span className="text-sm text-gray-500 dark:text-gray-300">
                    {parsedClinic.address}, {parsedClinic.postal_code}
                    {parsedClinic.area?.name && `${', '}${parsedClinic.area?.name},`}
                    {parsedClinic.state?.name && `${' '}${parsedClinic.state?.name}`}
                  </span>
                </div>
                {parsedClinic.email && (
                  <div className="flex items-center gap-x-2">
                    <MailIcon className="h-5 w-5 text-brand" />
                    <Link href={`mailto:${parsedClinic.email}`}>
                      <span className="text-sm">{parsedClinic.email}</span>
                    </Link>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-y-2">
                <div className="flex flex-col gap-x-2 gap-y-3 sm:flex-row sm:flex-wrap"></div>
                {hasSocialAccounts && (
                  <div className="flex gap-x-2">
                    {parsedClinic.facebook_url && (
                      <Button
                        variant="outline"
                        asChild
                        className="flex-grow-0 justify-center p-3 text-[#1877f2] hover:text-[#1877f2]">
                        <a
                          href={parsedClinic.facebook_url}
                          target="_blank"
                          rel="nofollow noopener noreferrer"
                          aria-label="Visit business Facebook page">
                          <FacebookIcon className="h-5 w-5" />
                          <span className="sr-only">Visit Facebook</span>
                        </a>
                      </Button>
                    )}
                    {parsedClinic.instagram_url && (
                      <Button
                        variant="outline"
                        asChild
                        className="flex-grow-0 justify-center p-3 text-[#e1306c] hover:text-[#e1306c]">
                        <a
                          href={parsedClinic.instagram_url}
                          target="_blank"
                          rel="nofollow noopener noreferrer"
                          aria-label="Visit business Instagram page">
                          <InstagramIcon className="h-5 w-5" />
                          <span className="sr-only">Visit Instagram</span>
                        </a>
                      </Button>
                    )}
                    {parsedClinic.youtube_url && (
                      <Button
                        variant="outline"
                        asChild
                        className="flex-grow-0 justify-center p-3 text-[#ff0000] hover:text-[#ff0000]">
                        <a
                          href={parsedClinic.youtube_url}
                          target="_blank"
                          rel="nofollow noopener noreferrer"
                          aria-label="Visit business YouTube channel">
                          <YoutubeIcon className="h-5 w-5" />
                          <span className="sr-only">Visit YouTube</span>
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
            {/* right column */}
            <div className="mt-5 flex flex-col-reverse justify-between gap-x-4 gap-y-4 sm:flex-row lg:mt-0">
              {!parsedClinic.is_permanently_closed && parsedClinic.phone && (
                <Link
                  href={`tel:${parsedClinic.phone}`}
                  className={cn(
                    buttonVariants({ variant: 'primary' }),
                    'flex items-center gap-x-3',
                  )}>
                  <PhoneIcon className="h-5 w-5" /> Book Appointment
                </Link>
              )}
            </div>
          </div>
          {/* content */}
          <div className="py-8 md:gap-8 lg:grid lg:grid-cols-sidebar lg:gap-10">
            <Prose className="space-y-8">
              {parsedClinic.description && (
                <article>
                  <h2>Description</h2>
                  <div dangerouslySetInnerHTML={{ __html: parsedClinic.description }}></div>
                </article>
              )}
              {parsedClinic.services && (
                <article className="block lg:hidden">
                  <h2>Services</h2>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {parsedClinic.services.map((service, index) => (
                      <div
                        key={service.slug ?? service.name ?? String(index)}
                        tabIndex={0}
                        aria-label={service.name}
                        className="flex cursor-pointer flex-col items-center justify-center rounded-xl bg-white p-8 text-gray-900 shadow-md outline-none transition hover:shadow-lg focus:ring-2 focus:ring-red-400 dark:bg-gray-950 dark:text-gray-50"
                        role="button">
                        {getServiceIcon(service.slug ?? '')}
                        <div className="mt-4 text-center text-base">{service.name}</div>
                      </div>
                    ))}
                  </div>
                </article>
              )}
              {parsedClinic.hours && parsedClinic.hours.length > 0 && (
                <article>
                  <h2>Opening Hours</h2>
                  <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-950">
                    {renderOpeningHours(parsedClinic)}
                  </div>
                </article>
              )}
              <Map
                latitude={parsedClinic.latitude ?? 0}
                longitude={parsedClinic.longitude ?? 0}
                name={parsedClinic.name ?? ''}
              />
              {parsedClinic.reviews && parsedClinic.reviews.length > 0 && (
                <>
                  {parsedClinic.id && <AddReviewForm clinicId={parsedClinic.id} />}
                  <Reviews reviews={parsedClinic.reviews} />
                </>
              )}
            </Prose>
            <aside>
              <Prose>
                {parsedClinic.services && (
                  <div className="hidden lg:block">
                    <h2>Services</h2>
                    <div className="grid grid-cols-2 gap-4">
                      {parsedClinic.services.map((service, index) => (
                        <div
                          key={service.slug ?? service.name ?? String(index)}
                          tabIndex={0}
                          aria-label={service.name}
                          className="flex cursor-pointer flex-col items-center justify-center rounded-xl bg-white p-8 text-gray-900 shadow-md outline-none transition hover:shadow-lg focus:ring-2 focus:ring-red-400 dark:bg-gray-950 dark:text-gray-50"
                          role="button">
                          {getServiceIcon(service.slug ?? '')}
                          <div className="mt-4 text-center text-sm">{service.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Prose>
            </aside>
          </div>
        </Container>
      </Wrapper>
    </>
  );
}
