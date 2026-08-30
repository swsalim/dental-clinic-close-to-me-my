import { Metadata } from 'next';

import { LISTING_REVALIDATE_SECONDS } from '@/lib/listing/pagination';

import { getStateListings } from '@/helpers/states';

import {
  generateStateListingMetadata,
  StateListing,
} from '@/components/listing/pages/state-listing';

export const revalidate = LISTING_REVALIDATE_SECONDS;
export const dynamic = 'force-static';
export const dynamicParams = true;

type StatePageProps = {
  params: Promise<{ state: string }>;
};

export async function generateStaticParams() {
  const states = await getStateListings();

  return states.map((state) => ({
    state: state.slug,
  }));
}

export async function generateMetadata({ params }: StatePageProps): Promise<Metadata> {
  const { state } = await params;
  return generateStateListingMetadata(state, 1);
}

export default async function StatePage({ params }: StatePageProps) {
  const { state } = await params;
  return <StateListing state={state} currentPage={1} />;
}
