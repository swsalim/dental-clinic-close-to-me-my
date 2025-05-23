import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import Stripe from 'stripe';

import { siteConfig } from '@/config/site';

import { ClinicSubmit } from '@/components/clinic-submit';

const config = {
  title: 'Thank you for your submission!',
  description:
    'We have received your submission and are processing your listing. You will be notified via email once your listing is live.',
  url: '/submit/success',
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
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SubmitSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; clinic_id?: string }>;
}) {
  const { session_id, clinic_id } = await searchParams;
  if (!session_id) {
    redirect('/submit');
  }

  // Fetch the Stripe session
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  let session: Stripe.Checkout.Session | null = null;
  try {
    session = await stripe.checkout.sessions.retrieve(session_id);
  } catch {
    return <div className="mx-auto max-w-xl py-12 text-center">Invalid session.</div>;
  }

  // Extract metadata
  const meta = session?.metadata || {};

  // Only submit if required metadata is present
  const canSubmit = Boolean(meta && meta.clinic_name && meta.name && meta.email);

  // Use a client-side effect to POST to /api/clinics
  // (Next.js server components can't POST on the server)
  // Show loading and success states
  return <ClinicSubmit meta={meta} canSubmit={canSubmit} clinic_id={clinic_id} />;
}
