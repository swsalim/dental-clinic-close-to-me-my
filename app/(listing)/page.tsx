import { Metadata } from 'next';

import { siteConfig } from '@/config/site';

import { homeMetaDescription } from '@/lib/listing/home-meta';
import { absoluteUrl } from '@/lib/utils';

import { Hero } from '@/components/hero';
import BrowseServices from '@/components/listing/browse-services';
import { ExploreStates } from '@/components/listing/explore-states';
// import { FeaturedClinics } from '@/components/listing/featured-clinics';
import { HomeCtaStrip } from '@/components/listing/home-cta-strip';
import { HomeGuides } from '@/components/listing/home-guides';
import { getHomeDirectoryStats } from '@/components/listing/home-stats';
import { RecentClinics } from '@/components/listing/recent-clinics';
import { Testimonials } from '@/components/listing/testimonials';
import LogoJsonLd from '@/components/structured-data/logo-json-ld';

/* Hallmark · macrostructure: Stat-Led · genre: editorial · tone: utilitarian
 * sections: Hero · States · Recent · Services · Reviews · Guides · CTA · enrichment: none
 */

export async function generateMetadata(): Promise<Metadata> {
  const stats = await getHomeDirectoryStats();
  const description = homeMetaDescription(stats.clinicCount, stats.stateCount);

  return {
    description,
    openGraph: {
      title: siteConfig.title,
      description,
      url: siteConfig.url,
      images: [
        {
          url: siteConfig.openGraph.image,
          width: siteConfig.openGraph.width,
          height: siteConfig.openGraph.height,
          alt: siteConfig.openGraph.imageAlt,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      title: siteConfig.title,
      description,
      card: 'summary_large_image',
      creator: siteConfig.creator,
      images: [siteConfig.openGraph.image],
    },
  };
}

export default function Home() {
  return (
    <>
      <LogoJsonLd logo={absoluteUrl('/images/logo.png')} url={absoluteUrl('/')} />
      <Hero />
      {/* <FeaturedClinics /> */}
      <ExploreStates />
      <RecentClinics />
      <BrowseServices />
      <Testimonials />
      <HomeGuides />
      <HomeCtaStrip />
    </>
  );
}
