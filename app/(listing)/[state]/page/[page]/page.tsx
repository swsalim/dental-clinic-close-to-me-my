import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { LISTING_REVALIDATE_SECONDS, parsePageParam } from '@/lib/listing/pagination';

import {
  generateStateListingMetadata,
  StateListing,
} from '@/components/listing/pages/state-listing';

export const revalidate = LISTING_REVALIDATE_SECONDS;
export const dynamicParams = true;

type StatePaginatedPageProps = {
  params: Promise<{ state: string; page: string }>;
};

export async function generateMetadata({ params }: StatePaginatedPageProps): Promise<Metadata> {
  const { state, page } = await params;
  const currentPage = parsePageParam(page);
  if (currentPage <= 1) {
    notFound();
  }
  return generateStateListingMetadata(state, currentPage);
}

export default async function StatePaginatedPage({ params }: StatePaginatedPageProps) {
  const { state, page } = await params;
  const currentPage = parsePageParam(page);
  if (currentPage <= 1) {
    notFound();
  }
  return <StateListing state={state} currentPage={currentPage} />;
}
