import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { LISTING_REVALIDATE_SECONDS, parsePageParam } from '@/lib/listing/pagination';

import {
  generateStateDentistsListingMetadata,
  StateDentistsListing,
} from '@/components/listing/pages/state-dentists-listing';

export const revalidate = LISTING_REVALIDATE_SECONDS;
export const dynamicParams = true;

type StateDentistsPaginatedPageProps = {
  params: Promise<{ state: string; page: string }>;
};

export async function generateMetadata({
  params,
}: StateDentistsPaginatedPageProps): Promise<Metadata> {
  const { state, page } = await params;
  const currentPage = parsePageParam(page);
  if (currentPage <= 1) {
    notFound();
  }
  return generateStateDentistsListingMetadata(state, currentPage);
}

export default async function StateDentistsPaginatedPage({
  params,
}: StateDentistsPaginatedPageProps) {
  const { state, page } = await params;
  const currentPage = parsePageParam(page);
  if (currentPage <= 1) {
    notFound();
  }
  return <StateDentistsListing state={state} currentPage={currentPage} />;
}
