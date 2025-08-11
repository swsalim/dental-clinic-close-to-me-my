import { Hero } from '@/components/hero';
import BrowseServices from '@/components/listing/browse-services';
import { ExploreStates } from '@/components/listing/explore-states';
import { RecentClinics } from '@/components/listing/recent-clinics';
import WebsiteJsonLd from '@/components/structured-data/website-json-ld';

export default function Home() {
  return (
    <>
      <WebsiteJsonLd company="Dental Clinics Malaysia" url={process.env.NEXT_PUBLIC_BASE_URL} />
      <Hero />
      <BrowseServices />
      <RecentClinics />
      <ExploreStates />
    </>
  );
}
