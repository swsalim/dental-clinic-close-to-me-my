import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { extraListingPageParams, parsePageParam } from '@/lib/listing/pagination';

import { getAllServices } from '@/helpers/services';

import {
  generateServiceListingMetadata,
  ServiceListing,
} from '@/components/listing/pages/service-listing';

export const revalidate = 2_592_000;
export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
  const services = await getAllServices();

  return services.flatMap((service) =>
    extraListingPageParams().map((page) => ({
      serviceSlug: service.slug,
      page,
    })),
  );
}

type ServicePaginatedPageProps = {
  params: Promise<{ serviceSlug: string; page: string }>;
};

export async function generateMetadata({ params }: ServicePaginatedPageProps): Promise<Metadata> {
  const { serviceSlug, page } = await params;
  const currentPage = parsePageParam(page);
  if (currentPage <= 1) {
    notFound();
  }
  return generateServiceListingMetadata(serviceSlug, currentPage);
}

export default async function ServicePaginatedPage({ params }: ServicePaginatedPageProps) {
  const { serviceSlug, page } = await params;
  const currentPage = parsePageParam(page);
  if (currentPage <= 1) {
    notFound();
  }
  return <ServiceListing serviceSlug={serviceSlug} currentPage={currentPage} />;
}
