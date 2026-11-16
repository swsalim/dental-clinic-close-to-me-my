import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { extraListingPageParams, parsePageParam } from '@/lib/listing/pagination';

import {
  DentistsListing,
  generateDentistsListingMetadata,
} from '@/components/listing/pages/dentists-listing';

export const revalidate = 2_592_000;
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return extraListingPageParams().map((page) => ({ page }));
}

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
