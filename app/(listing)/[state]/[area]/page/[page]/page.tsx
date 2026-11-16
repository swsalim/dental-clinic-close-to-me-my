import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { extraListingPageParams, parsePageParam } from '@/lib/listing/pagination';

import { getAreaListings } from '@/helpers/areas';

import { AreaListing, generateAreaListingMetadata } from '@/components/listing/pages/area-listing';

export const revalidate = 2_592_000;
export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
  const areas = await getAreaListings();

  return areas.flatMap((area) => {
    const state = area.state?.slug;
    if (!state || !area.slug) {
      return [];
    }

    return extraListingPageParams().map((page) => ({
      state,
      area: area.slug,
      page,
    }));
  });
}

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
