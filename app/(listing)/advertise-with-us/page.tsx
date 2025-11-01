import { PricingPlan } from '@/components/listing/pricing-plan';
import WebPageJsonLd from '@/components/structured-data/web-page-json-ld';
import WebsiteJsonLd from '@/components/structured-data/website-json-ld';
import Container from '@/components/ui/container';
import Prose from '@/components/ui/prose';

const seo = {
  title: 'Advertise with us',
  description:
    'Thanks for you visiting us and considering to advertise with us at dentalclinicclosetome.my! We welcome advertisers, sponsors and pitches.',
  url: '/advertise-with-us',
  creator: '@swsalim',
  company: 'DentalClinicCloseToMe',
};

const ogImage = `/api/og?title=${seo.title}`;

export const metadata = {
  title: seo.title,
  description: seo.description,
  openGraph: {
    title: seo.title,
    description: seo.description,
    url: seo.url,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
      },
    ],
    siteName: seo.company,
    locale: 'en-US',
    type: 'website',
  },
  twitter: {
    title: seo.title,
    description: seo.description,
    images: [ogImage],
    card: 'summary_large_image',
    creator: seo.creator,
  },
  alternates: {
    canonical: seo.url,
  },
};

export default async function AdvertisePage() {
  return (
    <>
      <WebsiteJsonLd company={seo.company} url={process.env.NEXT_PUBLIC_BASE_URL} />
      <WebPageJsonLd
        description={seo.description}
        id={seo.url}
        lastReviewed={new Date().toISOString()}
        reviewedBy={process.env.NEXT_PUBLIC_SCHEMA_REVIEWER}
      />

      <div className="my-16">
        <Container className="max-w-5xl">
          <h2 className="mb-4 mt-2 text-3xl font-bold leading-8 tracking-tight text-gray-800 sm:text-4xl sm:leading-10">
            🦷 Advertise With Us
          </h2>
          <Prose>
            <strong>Reach More Dental Patients in Malaysia</strong>
            <p>
              DentalClinicCloseToMe.my helps thousands of Malaysians find trusted dental clinics
              every month — with over <strong>7,000 visitors monthly</strong> and growing. If you’d
              like your clinic to stand out and attract more patients, our{' '}
              <strong>Featured Listing</strong> is the best way to do it.
            </p>
            <p>
              Be seen first by local patients searching for dental clinics near them. Get a
              do-follow backlink, higher visibility, and more leads — starting from just{' '}
              <strong>RM59/month</strong>.
            </p>

            <h2>Why Get Featured?</h2>
            <ul>
              <li>
                🚀 Top Placement: Your clinic appears at the top of your area page (e.g.
                /kuala-lumpur/cheras) and parent state page (/kuala-lumpur).
              </li>
              <li>🏆 Featured Badge: Stand out with a gold “Featured Clinic” tag.</li>
              <li>
                🔗 Do-Follow Backlink: Improve your website SEO — our domain has DR 23+ and growing.
              </li>
              <li>
                📰 Rich Listing Page: Show opening hours, doctors, gallery, reviews, and more.
              </li>
              <li>
                🖼️ Promotional Images: Add up to 5 marketing visuals or before/after treatment
                photos.
              </li>
              <li>📈 No Ads: Enjoy a clean, distraction-free page with no Google Ads.</li>
              <li>
                📊 Monthly Traffic: Your listing is visible to over 7,000 monthly visitors and
                increasing.
              </li>
            </ul>

            <h2>🩺 Featured Basic</h2>
            <p>
              Perfect for smaller clinics looking to gain visibility and SEO value at an affordable
              rate.
            </p>
            <p>Includes:</p>
            <ul>
              <li>🚫 Ad-free listing page (no Ads shown)</li>
              <li>🔗 Do-follow backlink to your website</li>
              <li>📍 Priority placement above free listings</li>
              <li>🖼️ 1 promotional image (below clinic details)</li>
              <li>🏅 &quot;Featured&quot; badge for extra credibility</li>
              <li>🌐 Appears on both area and state pages</li>
              <li>🏠 Eligible for homepage rotation</li>
            </ul>

            <h2>💎 Featured Premium</h2>
            <p>
              Best for clinics that want to showcase their space and services with richer visuals.
            </p>
            <p>
              <strong>Includes everything in Basic, plus:</strong>
            </p>
            <ul>
              <li>
                📸 Up to 5 promotional images (gallery-style section) for marketing and branding
              </li>
            </ul>

            <div>
              <PricingPlan />
            </div>

            <h2>📈 Why Upgrade?</h2>

            <ul>
              <li>
                <strong>Boost SEO:</strong> Gain a quality backlink from a growing domain (DR 23).
              </li>
              <li>
                <strong>More visibility:</strong> Appear at the top of your area and state pages.
              </li>
              <li>
                <strong>Build trust:</strong> Stand out with a clean, ad-free page and “Featured
                Clinic” badge.
              </li>
              <li>
                <strong>Attract patients:</strong> Add compelling visuals that convert visitors into
                leads.
              </li>
            </ul>

            <h2>💬 Get Featured Today</h2>

            <p>
              Interested in upgrading your listing? Contact us to reserve your Featured spot — we’ll
              handle everything manually for now.
            </p>
            <p>
              <strong>📧 Email:</strong>{' '}
              <a href="mailto:hello@dentalclinicclosetome.my">hello@dentalclinicclosetome.my</a>
            </p>
          </Prose>
        </Container>
      </div>
    </>
  );
}
