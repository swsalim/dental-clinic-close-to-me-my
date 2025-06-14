import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { formatDistanceToNow } from 'date-fns';

import { siteConfig } from '@/config/site';

import { absoluteUrl } from '@/lib/utils';

import { getClinicBySlug, getClinicMetadataBySlug } from '@/helpers/clinics';

import Breadcrumb from '@/components/ui/breadcrumb';
import { Card, CardContent } from '@/components/ui/card';
import Container from '@/components/ui/container';
import { Separator } from '@/components/ui/separator';
import { StarRating } from '@/components/ui/star-rating';

type ReviewsPageProps = {
  params: Promise<{
    clinicSlug: string;
  }>;
};

export async function generateMetadata({ params }: ReviewsPageProps): Promise<Metadata> {
  const { clinicSlug } = await params;

  const clinic = await getClinicMetadataBySlug(clinicSlug);

  if (!clinic) {
    notFound();
  }

  const title = `Reviews for ${clinic.name}`;
  const description = `Read reviews and ratings for ${clinic.name}, a dental clinic located in ${clinic.area.name}, ${clinic.state.name}.`;

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(`/place/${clinicSlug}/reviews`),
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/place/${clinicSlug}/reviews`),
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

export default async function ReviewsPage({ params }: ReviewsPageProps) {
  const { clinicSlug } = await params;

  const clinic = await getClinicBySlug(clinicSlug);

  if (!clinic) {
    notFound();
  }

  const breadcrumbItems = [
    { name: clinic.state?.name, url: `/${clinic.state?.slug}` },
    {
      name: clinic.area?.name,
      url: `/${clinic.state?.slug}/${clinic.area?.slug}`,
    },
    { name: clinic.name, url: `/place/${clinicSlug}` },
    { name: 'Reviews' },
  ];

  return (
    <Container>
      <div className="py-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="mt-8">
          <h1 className="text-3xl font-bold">Reviews for {clinic.name}</h1>
          <p className="text-muted-foreground mt-2">
            {clinic.review_count} reviews • {clinic.rating?.toFixed(1)} average rating
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {clinic.reviews?.map((review) => (
            <Card key={`${review.author_name}-${review.review_time}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col">
                      <span className="font-medium">{review.author_name}</span>
                      <span className="text-muted-foreground text-sm">
                        {review.review_time &&
                          formatDistanceToNow(new Date(review.review_time), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <StarRating rating={review.rating || 0} />
                </div>
                {review.text && (
                  <>
                    <Separator className="my-4" />
                    <p className="text-muted-foreground">{review.text}</p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Container>
  );
}
