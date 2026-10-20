import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import type { Icon } from '@phosphor-icons/react';
import {
  ArrowRightIcon,
  CalendarIcon,
  CaretRightIcon,
  MapPinIcon,
  StarIcon,
  UsersIcon,
} from '@phosphor-icons/react/dist/ssr';

import { seo } from '@/config/next-seo.config';
import { siteConfig } from '@/config/site';

import { LISTING_FEE_LABEL } from '@/lib/listing/submission-fee';
import { absoluteUrl, cn } from '@/lib/utils';

import BreadcrumbJsonLd from '@/components/structured-data/breadcrumb-json-ld';
import WebPageJsonLd from '@/components/structured-data/web-page-json-ld';
import Breadcrumb from '@/components/ui/breadcrumb';
import { buttonVariants } from '@/components/ui/button';
import Container from '@/components/ui/container';

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

const features: { icon: Icon; label: string }[] = [
  { icon: MapPinIcon, label: 'Find clinics across Malaysia' },
  { icon: StarIcon, label: 'Compare services and reviews' },
  { icon: CalendarIcon, label: 'Book a dental appointment' },
];

const directoryLinks: { href: string; icon: Icon; label: string }[] = [
  { href: '/browse', icon: MapPinIcon, label: 'Browse clinics by state and city' },
  { href: '/dentists', icon: UsersIcon, label: 'Look up dentists' },
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

      <section className="bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/40 dark:to-gray-900">
        <Container className="pb-12 pt-6 md:pb-16 md:pt-10">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="min-w-0">
              <Breadcrumb items={[{ name: 'About' }]} />
              <h1 className="mt-4 max-w-xl text-balance font-display text-3xl font-black leading-[1.1] tracking-tight text-gray-900 sm:text-4xl lg:text-5xl dark:text-gray-50">
                About {siteConfig.siteName}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-600 md:text-lg dark:text-gray-300">
                {siteConfig.siteName} ({seo.site_name}) is a directory of dental clinics across
                Malaysia. Search by location, compare services and reviews, and book a dental
                appointment.
              </p>
            </div>

            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-blue-100 sm:aspect-[2/1] lg:aspect-[16/11] dark:bg-blue-900">
              <Image
                src="/images/hero-about.webp"
                alt="Dentist showing a dental model to a patient"
                fill
                priority
                sizes="(min-width: 1024px) 560px, 100vw"
                className="object-cover object-[78%_center]"
              />
              <div className="pointer-events-none absolute inset-0 hidden bg-gray-950/25 dark:block" />
            </div>
          </div>

          <ul className="mt-8 grid grid-cols-1 divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg shadow-blue-900/10 md:mt-10 md:grid-cols-3 md:divide-x md:divide-y-0 dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:shadow-none">
            {features.map((feature) => (
              <li key={feature.label} className="flex items-center gap-4 px-5 py-5 md:px-6">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                  <feature.icon weight="duotone" className="size-6" aria-hidden="true" />
                </span>
                <p className="min-w-0 text-sm font-semibold leading-snug text-gray-800 dark:text-gray-100">
                  {feature.label}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-white py-12 md:py-16 dark:bg-gray-900">
        <Container>
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
            <div className="overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/10">
              <Image
                src="/images/kuala-lumpur.webp"
                alt="Kuala Lumpur skyline at sunset"
                width={700}
                height={350}
                className="h-auto w-full object-cover"
              />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-300">
                Explore
              </p>
              <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-gray-900 md:text-4xl dark:text-gray-50">
                Browse the directory
              </h2>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-gray-600 dark:text-gray-300">
                Discover dental clinics and dentists across Malaysia. You can browse by state and
                city or look up dentists to find the right care for your needs.
              </p>
              <ul className="mt-6 space-y-4">
                {directoryLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex items-center gap-3 rounded-xl border-b-0 py-1 text-base font-semibold text-gray-800 hover:border-transparent hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:text-gray-100 dark:hover:text-blue-300 dark:focus-visible:ring-offset-gray-900"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                        <item.icon weight="duotone" className="size-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">{item.label}</span>
                      <CaretRightIcon
                        weight="bold"
                        className="size-4 shrink-0 text-blue-500 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5 dark:text-blue-300"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white pb-12 md:pb-16 dark:bg-gray-900">
        <Container>
          <div className="rounded-3xl bg-blue-50 px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12 dark:bg-blue-800">
            <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-200">
                  For clinic owners
                </p>
                <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-gray-900 md:text-4xl dark:text-white">
                  List or advertise a clinic
                </h2>
                <p className="mt-3 max-w-xl text-base leading-relaxed text-gray-600 dark:text-blue-100">
                  Clinic owners can <Link href="/submit">submit a listing</Link> for a one-time{' '}
                  {LISTING_FEE_LABEL} fee. Listings are reviewed within 24 hours and include a
                  dofollow link to the clinic website. Featured placement is described on{' '}
                  <Link href="/advertise-with-us">Advertise with us</Link>.
                </p>
                <Link
                  href="/advertise-with-us"
                  className={cn(
                    buttonVariants({ variant: 'primary' }),
                    'mt-6 w-full hover:border-transparent sm:w-auto',
                  )}
                >
                  Advertise with us
                  <ArrowRightIcon weight="bold" className="ms-2 size-4" aria-hidden="true" />
                </Link>
              </div>

              <div className="overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/10">
                <Image
                  src="/images/clinic-reception.webp"
                  alt="Dental clinic reception with a tooth light on the wood wall"
                  width={700}
                  height={350}
                  className="h-auto w-full object-cover"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white pb-16 md:pb-24 dark:bg-gray-900">
        <Container>
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-300">
                Get in touch
              </p>
              <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-gray-900 md:text-4xl dark:text-gray-50">
                Contact
              </h2>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-gray-600 dark:text-gray-300">
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
              <a
                href="mailto:hello@dentalclinicclosetome.my"
                className={cn(buttonVariants({ variant: 'outline' }), 'mt-6 w-full sm:w-auto')}
              >
                Send us an email
                <ArrowRightIcon weight="bold" className="ms-2 size-4" aria-hidden="true" />
              </a>
            </div>

            <div className="flex items-center justify-center rounded-3xl bg-blue-50/80 px-4 py-6 dark:bg-blue-900/50">
              <Image
                src="/images/contact-us.webp"
                alt=""
                width={700}
                height={350}
                className="h-auto w-full"
              />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
