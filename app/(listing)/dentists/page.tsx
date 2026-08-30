import { Metadata } from 'next';

import { LISTING_REVALIDATE_SECONDS } from '@/lib/listing/pagination';

import {
  DentistsListing,
  generateDentistsListingMetadata,
} from '@/components/listing/pages/dentists-listing';

export const revalidate = LISTING_REVALIDATE_SECONDS;
export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  return generateDentistsListingMetadata(1);
}

export default async function DentistsPage() {
  return <DentistsListing currentPage={1} />;
}
