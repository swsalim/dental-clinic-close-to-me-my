import { Hero } from '@/components/hero';
import BrowseServices from '@/components/listing/browse-services';
import { ExploreStates } from '@/components/listing/explore-states';
import { RecentClinics } from '@/components/listing/recent-clinics';

export default function Home() {
  return (
    <>
      <Hero />
      <BrowseServices />
      <RecentClinics />
      <ExploreStates />
    </>
  );
}
