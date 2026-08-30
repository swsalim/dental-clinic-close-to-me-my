import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { parsePageParam } from '@/lib/listing/pagination';

import { AreaListing, generateAreaListingMetadata } from '@/components/listing/pages/area-listing';

export const revalidate = 1_209_600;
export const dynamicParams = true;

type AreaPaginatedPageProps = {
  params: Promise<{ state: string; area: string; page: string }>;
};

export async function generateMetadata({ params }: AreaPaginatedPageProps): Promise<Metadata> {
  const { state, area, page } = await params;
  const currentPage = parsePageParam(page);
  if (currentPage <= 1) {
    notFound();
  }
  return generateAreaListingMetadata(state, area, currentPage);
}

export default async function AreaPaginatedPage({ params }: AreaPaginatedPageProps) {
  const { state, area, page } = await params;
  const currentPage = parsePageParam(page);
  if (currentPage <= 1) {
    notFound();
  }
  return <AreaListing state={state} area={area} currentPage={currentPage} />;
}
