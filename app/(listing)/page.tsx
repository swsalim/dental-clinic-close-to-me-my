import { absoluteUrl } from '@/lib/utils';

import { Hero } from '@/components/hero';
import BrowseServices from '@/components/listing/browse-services';
import { ExploreStates } from '@/components/listing/explore-states';
import { HomeCtaStrip } from '@/components/listing/home-cta-strip';
import { RecentClinics } from '@/components/listing/recent-clinics';
import { Testimonials } from '@/components/listing/testimonials';
import LogoJsonLd from '@/components/structured-data/logo-json-ld';

/* Hallmark · macrostructure: Stat-Led · genre: editorial · tone: utilitarian
 * sections: Hero · States · Recent · Services · Reviews · CTA · enrichment: none
 */

export default function Home() {
  return (
    <>
      <LogoJsonLd logo={absoluteUrl('/images/logo.png')} url={absoluteUrl('/')} />
      <Hero />
      <ExploreStates />
      <RecentClinics />
      <BrowseServices />
      <Testimonials />
      <HomeCtaStrip />
    </>
  );
}
