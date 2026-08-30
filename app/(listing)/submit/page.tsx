import { Metadata } from 'next';

import { ClinicArea, ClinicState } from '@/types/clinic';

import { siteConfig } from '@/config/site';

import { LISTING_FEE_LABEL } from '@/lib/listing/submission-fee';
import { createClient } from '@/lib/supabase/server';

import SubmitClinicForm from '@/components/forms/submit-clinic-form';

const config = {
  title: `List Your Clinic for ${LISTING_FEE_LABEL} | Reach More Patients in Malaysia`,
  description: `List your dental clinic on DentalClinicCloseToMe.my for a one-time ${LISTING_FEE_LABEL} fee. Reviewed within 24 hours, with a dofollow link to your website.`,
  url: '/submit',
};

export const metadata: Metadata = {
  title: config.title,
  description: config.description,
  alternates: {
    canonical: config.url,
  },
  openGraph: {
    title: config.title,
    description: config.description,
    url: config.url,
    images: [
      {
        url: new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/og?title=${config.title}`),
        width: siteConfig.openGraph.width,
        height: siteConfig.openGraph.height,
        alt: config.title,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    title: config.title,
    description: config.description,
    card: 'summary_large_image',
    creator: siteConfig.creator,
    images: [
      {
        url: new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/og?title=${config.title}`),
        width: siteConfig.openGraph.width,
        height: siteConfig.openGraph.height,
        alt: config.title,
      },
    ],
  },
};

export default async function SubmitClinicPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string }>;
}) {
  const supabase = await createClient();
  const { canceled } = await searchParams;

  const [{ data: statesData }, { data: areasData }] = await Promise.all([
    supabase.from('states').select('id, name', { count: 'exact' }),
    supabase.from('areas').select('id, name, state_id', { count: 'exact' }),
  ]);

  const states = (statesData || []) as ClinicState[];
  const areas = (areasData || []) as ClinicArea[];

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
        Paid listing
      </p>
      <h1 className="font-display mb-4 text-3xl font-bold dark:text-gray-50">
        List your clinic for {LISTING_FEE_LABEL}
      </h1>
      <p className="mb-6 text-gray-700 dark:text-gray-400">
        One-time fee. We review your listing within 24 hours and include a dofollow link to your
        website.
      </p>
      {canceled === '1' && (
        <p
          className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
          role="status">
          Payment was cancelled. Your listing was not submitted. You can try again below.
        </p>
      )}
      <SubmitClinicForm states={states} areas={areas} />
    </div>
  );
}
