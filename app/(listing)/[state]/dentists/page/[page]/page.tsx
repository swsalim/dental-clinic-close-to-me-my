import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { extraListingPageParams, parsePageParam } from '@/lib/listing/pagination';

import { getStateListings } from '@/helpers/states';

import {
  generateStateDentistsListingMetadata,
  StateDentistsListing,
} from '@/components/listing/pages/state-dentists-listing';

export const revalidate = 2_592_000;
export const dynamic = 'force-static';
// Pages 2–3 are pre-built; later pages render on demand (noindex, follow).
export const dynamicParams = true;

export async function generateStaticParams() {
  const states = await getStateListings();

  return states.flatMap((state) =>
    extraListingPageParams().map((page) => ({
      state: state.slug,
      page,
    })),
  );
}

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
