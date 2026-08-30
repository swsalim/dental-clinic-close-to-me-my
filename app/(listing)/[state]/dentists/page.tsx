import { Metadata } from 'next';

import { getStateListings } from '@/helpers/states';

import {
  generateStateDentistsListingMetadata,
  StateDentistsListing,
} from '@/components/listing/pages/state-dentists-listing';

export const revalidate = 1_209_600;
export const dynamic = 'force-static';
export const dynamicParams = true;

type DentistsByStatePageProps = {
  params: Promise<{ state: string }>;
};

export async function generateStaticParams() {
  const states = await getStateListings();

  return states.map((state) => ({
    state: state.slug,
  }));
}

export async function generateMetadata({ params }: DentistsByStatePageProps): Promise<Metadata> {
  const { state } = await params;
  return generateStateDentistsListingMetadata(state, 1);
}

export default async function DentistsByStatePage({ params }: DentistsByStatePageProps) {
  const { state } = await params;
  return <StateDentistsListing state={state} currentPage={1} />;
}
