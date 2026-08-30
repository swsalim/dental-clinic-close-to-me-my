import { Metadata } from 'next';

import {
  DentistsListing,
  generateDentistsListingMetadata,
} from '@/components/listing/pages/dentists-listing';

export const revalidate = 1_209_600;
export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  return generateDentistsListingMetadata(1);
}

export default async function DentistsPage() {
  return <DentistsListing currentPage={1} />;
}
