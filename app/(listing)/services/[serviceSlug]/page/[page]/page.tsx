import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { parsePageParam } from '@/lib/listing/pagination';

import {
  generateServiceListingMetadata,
  ServiceListing,
} from '@/components/listing/pages/service-listing';

export const revalidate = 1_209_600;
export const dynamicParams = true;

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
