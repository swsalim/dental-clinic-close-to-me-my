import React from 'react';

import Image from 'next/image';

import type { ListingClinic } from '@/lib/listing/location-filters';
import { MEDIA } from '@/lib/media-sizes';

import { AffiliateAd } from '@/components/ads/affiliate-ad';
import { LazyAdsArticle } from '@/components/ads/lazy-ads-article';
import { ClinicCard } from '@/components/cards/clinic-card';
import {
  getFeaturedListingCardPlaceholder,
  getFeaturedPartnerCardPlaceholder,
} from '@/components/listing/featured-clinic-spotlight';

export function ClinicResultGrid({
  clinics,
  showSampleCards = false,
  sampleState = '',
  sampleArea,
}: {
  clinics: ListingClinic[];
  showSampleCards?: boolean;
  sampleState?: string;
  sampleArea?: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      {showSampleCards ? (
        <>
          <ClinicCard
            key="featured-placeholder-partner"
            {...getFeaturedPartnerCardPlaceholder(sampleState, sampleArea)}
          />
          <ClinicCard
            key="featured-placeholder-listing"
            {...getFeaturedListingCardPlaceholder(sampleState, sampleArea)}
          />
        </>
      ) : null}
      {clinics.map((clinic, index) => (
        <React.Fragment key={clinic.slug || `${clinic.name}-${index}`}>
          {index === 5 ? (
            <div className="flex flex-col items-center justify-center gap-2 text-center">
              <AffiliateAd>
                <a
                  href="https://invl.me/clnlab2"
                  className="hover:!border-b-transparent"
                  target="_blank"
                  rel="nofollow noopener noreferrer">
                  <Image
                    src="/images/total-image-2.jpg"
                    alt="Total Image"
                    width={MEDIA.adGrid.width}
                    height={MEDIA.adGrid.height}
                    quality={85}
                    sizes={MEDIA.adGrid.sizes}
                    className="m-0 h-auto w-full object-cover"
                  />
                </a>
              </AffiliateAd>
            </div>
          ) : null}
          {index !== 5 && (index + 1) % 6 === 0 ? <LazyAdsArticle /> : null}
          <ClinicCard
            slug={clinic.slug}
            name={clinic.name}
            address={clinic.address}
            neighborhood={clinic.neighborhood}
            city={clinic.city}
            phone={clinic.phone}
            postalCode={clinic.postalCode}
            state={clinic.state}
            area={clinic.area}
            image={clinic.image}
            rating={clinic.rating}
            isFeatured={clinic.isFeatured}
            hours={clinic.hours}
            specialHours={clinic.specialHours}
            openOnPublicHolidays={clinic.openOnPublicHolidays}
          />
        </React.Fragment>
      ))}
    </div>
  );
}
