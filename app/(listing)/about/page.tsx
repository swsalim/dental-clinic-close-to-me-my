import { Metadata } from 'next';
import Link from 'next/link';

import { seo } from '@/config/next-seo.config';
import { siteConfig } from '@/config/site';

import { LISTING_FEE_LABEL } from '@/lib/listing/submission-fee';
import { absoluteUrl } from '@/lib/utils';

import BreadcrumbJsonLd from '@/components/structured-data/breadcrumb-json-ld';
import WebPageJsonLd from '@/components/structured-data/web-page-json-ld';
import Breadcrumb from '@/components/ui/breadcrumb';
import Container from '@/components/ui/container';
import Prose from '@/components/ui/prose';
import { Wrapper } from '@/components/ui/wrapper';

const title = 'About';
const description = `${siteConfig.siteName} (${seo.site_name}) is a directory of dental clinics across Malaysia. Search by location, compare services and reviews, and contact the site about a listing.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title,
    description,
    url: '/about',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    title,
    description,
    card: 'summary_large_image',
    creator: siteConfig.creator,
  },
};

const JSONLDbreadcrumbs = [
  {
    item: absoluteUrl('/'),
    name: 'Home',
    position: '1',
  },
  {
    item: absoluteUrl('/about'),
    name: 'About',
    position: '2',
  },
];

export default function AboutPage() {
  return (
    <>
      <WebPageJsonLd
        description={description}
        id="/about"
        reviewedBy={process.env.NEXT_PUBLIC_SCHEMA_REVIEWER}
      />
      <BreadcrumbJsonLd itemListElements={JSONLDbreadcrumbs} />
      <Wrapper>
        <Container className="max-w-3xl">
          <div className="flex min-w-0 flex-1 flex-col gap-y-6 md:gap-y-12">
            <Breadcrumb items={[{ name: 'About' }]} />
            <Prose>
              <h1 className="text-balance font-display text-4xl font-black">
                About {siteConfig.siteName}
              </h1>
              <p>
                {siteConfig.siteName} ({seo.site_name}) is a directory of dental clinics across
                Malaysia. Search by location, compare services and reviews, and book a dental
                appointment.
              </p>
              <h2>Browse the directory</h2>
              <ul>
                <li>
                  <Link href="/browse">Browse clinics by state and city</Link>
                </li>
                <li>
                  <Link href="/dentists">Look up dentists</Link>
                </li>
              </ul>
              <h2>List or advertise a clinic</h2>
              <p>
                Clinic owners can <Link href="/submit">submit a listing</Link> for a one-time{' '}
                {LISTING_FEE_LABEL} fee. Listings are reviewed within 24 hours and include a
                dofollow link to the clinic website. Featured placement is described on{' '}
                <Link href="/advertise-with-us">Advertise with us</Link>.
              </p>
              <h2>Contact</h2>
              <p>
                Email{' '}
                <a href="mailto:hello@dentalclinicclosetome.my">hello@dentalclinicclosetome.my</a>{' '}
                about a listing or advertising. The site is built by{' '}
                <a
                  href="https://www.yuurrific.com?ref=dentalclinicclosetome.my"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Yuurrific
                </a>
                .
              </p>
            </Prose>
          </div>
        </Container>
      </Wrapper>
    </>
  );
}
