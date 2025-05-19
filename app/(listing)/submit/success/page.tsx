import { redirect } from 'next/navigation';

import Stripe from 'stripe';

import { ClinicSubmit } from '@/components/clinic-submit';

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

  console.log('meta');
  console.log(meta);

  // Only submit if required metadata is present
  const canSubmit = Boolean(meta && meta.clinic_name && meta.name && meta.email);

  // Use a client-side effect to POST to /api/clinics
  // (Next.js server components can't POST on the server)
  // Show loading and success states
  return <ClinicSubmit meta={meta} canSubmit={canSubmit} clinic_id={clinic_id} />;
}
