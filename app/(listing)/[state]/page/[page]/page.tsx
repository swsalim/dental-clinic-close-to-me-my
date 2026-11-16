import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { extraListingPageParams, parsePageParam } from '@/lib/listing/pagination';

import { getStateListings } from '@/helpers/states';

import {
  generateStateListingMetadata,
  StateListing,
} from '@/components/listing/pages/state-listing';

export const revalidate = 2_592_000;
export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
  const states = await getStateListings();

  return states.flatMap((state) =>
    extraListingPageParams().map((page) => ({
      state: state.slug,
      page,
    })),
  );
}

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
