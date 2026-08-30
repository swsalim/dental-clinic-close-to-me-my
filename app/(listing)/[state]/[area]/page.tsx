import { Metadata } from 'next';

import { getAreaListings } from '@/helpers/areas';

import { AreaListing, generateAreaListingMetadata } from '@/components/listing/pages/area-listing';

export const revalidate = 1_209_600;
export const dynamic = 'force-static';
export const dynamicParams = true;

type AreaPageProps = {
  params: Promise<{ state: string; area: string }>;
};

export async function generateStaticParams() {
  const areas = await getAreaListings();

  return areas.map((area) => ({
    state: area.state?.slug,
    area: area.slug,
  }));
}

export async function generateMetadata({ params }: AreaPageProps): Promise<Metadata> {
  const { state, area } = await params;
  return generateAreaListingMetadata(state, area, 1);
}

export default async function AreaPage({ params }: AreaPageProps) {
  const { state, area } = await params;
  return <AreaListing state={state} area={area} currentPage={1} />;
}
