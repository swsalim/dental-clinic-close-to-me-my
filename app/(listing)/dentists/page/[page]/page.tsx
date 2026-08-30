import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { LISTING_REVALIDATE_SECONDS, parsePageParam } from '@/lib/listing/pagination';

import {
  DentistsListing,
  generateDentistsListingMetadata,
} from '@/components/listing/pages/dentists-listing';

export const revalidate = LISTING_REVALIDATE_SECONDS;
export const dynamicParams = true;

type DentistsPaginatedPageProps = {
  params: Promise<{ page: string }>;
};

export async function generateMetadata({
  params,
}: DentistsPaginatedPageProps): Promise<Metadata> {
  const { page } = await params;
  const currentPage = parsePageParam(page);
  if (currentPage <= 1) {
    notFound();
  }
  return generateDentistsListingMetadata(currentPage);
}

export default async function DentistsPaginatedPage({ params }: DentistsPaginatedPageProps) {
  const { page } = await params;
  const currentPage = parsePageParam(page);
  if (currentPage <= 1) {
    notFound();
  }
  return <DentistsListing currentPage={currentPage} />;
}
