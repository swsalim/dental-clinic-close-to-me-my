'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { createClient } from '@/lib/supabase/client';

export function ClinicSubmit({
  meta,
  canSubmit,
  clinic_id,
}: {
  meta: Record<string, string>;
  canSubmit: boolean;
  clinic_id?: string;
}) {
  const [status, setStatus] = useState<'loading' | 'success' | 'approved' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canSubmit) {
      setStatus('error');
      setError('Missing required submission details.');
      return;
    }

    // Only submit once
    let submitted = false;
    if (!submitted) {
      submitted = true;
      const supabase = createClient();

      const updateData = async () => {
        // First, get the current status
        const { data: clinicData, error: fetchError } = await supabase
          .from('clinics')
          .select('status')
          .eq('id', clinic_id)
          .single();

        if (fetchError) {
          setStatus('error');
          setError(fetchError.message || 'Failed to fetch clinic data');
          return;
        }

        // Only update if status is 'pending_payment'
        if (clinicData?.status === 'pending_payment') {
          const { data: updatedClinic, error } = await supabase
            .from('clinics')
            .update({ status: 'pending' })
            .eq('id', clinic_id)
            .select()
            .single();

          if (error) {
            setStatus('error');
            setError(error.message || 'Failed to update clinic record');
            return;
          }

          // Send notification email
          const response = await fetch('/api/send-email/clinic-notification', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: meta.name,
              email: meta.email,
              clinicName: updatedClinic.name,
              clinicEmail: updatedClinic.email,
              phone: updatedClinic.phone,
              address: updatedClinic.address,
              description: updatedClinic.description,
              price: 'instant',
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to send notification email');
          }

          setStatus('success');
        } else if (clinicData?.status === 'pending') {
          setStatus('approved');
        } else {
          // Optionally handle the case when status is not 'pending_payment'
          console.log('Status update skipped: Current status is not pending_payment');
        }
      };

      updateData();
    }
  }, [canSubmit, meta, clinic_id]);

  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <h1 className="mb-4 text-3xl font-bold">Payment Successful!</h1>
        <p className="mb-4">Processing your clinic submission...</p>
      </div>
    );
  }
  if (status === 'approved') {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <h1 className="mb-4 text-3xl font-bold">Payment Successful!</h1>
        <p className="mb-4">
          We have received your submission and are processing your listing. You will be notified via
          email once your listing is live.
        </p>
        <p>
          <Link href="/">Return to Home</Link>
        </p>
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="mx-auto max-w-xl py-12 text-center text-red-600">
        <h1 className="mb-4 text-3xl font-bold">Payment Successful!</h1>
        <p className="mb-4">There was an error processing your clinic submission.</p>
        <p>{error}</p>
        <p>
          Drop us an email at{' '}
          <a href="mailto:support@dentalclinicclosetome.my">support@dentalclinicclosetome.my</a> if
          you need help.
        </p>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-xl py-12 text-center">
      <h1 className="mb-4 text-3xl font-bold">Submission Complete!</h1>
      <p className="mb-4">
        Thank you for your payment. Your clinic has been listed as an instant listing.
      </p>
      <div className="mt-6 flex flex-col gap-4 rounded-lg bg-gray-50 p-6 text-left dark:bg-gray-800">
        <h2 className="mb-2 text-lg font-semibold">Submission Details</h2>
        <ul>
          <li>
            <strong>Name:</strong> {meta.name}
          </li>
          <li>
            <strong>Email:</strong> {meta.email}
          </li>
          <li>
            <strong>Clinic Name:</strong> {meta.clinic_name}
          </li>
        </ul>
        <p>
          <Link href="/">Return to Home</Link>
        </p>
      </div>
    </div>
  );
}
