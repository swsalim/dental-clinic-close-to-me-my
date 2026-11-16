'use server';

import { revalidateTag } from 'next/cache';

import { revalidateClinicPage } from '@/lib/listing/revalidate-clinic';
import { createServerClient } from '@/lib/supabase';

export async function revalidateEditedClinic(input: {
  slug: string;
  previousSlug?: string | null;
  stateSlug?: string | null;
  areaSlug?: string | null;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  revalidateClinicPage(input);
}

export async function revalidateAreas() {
  revalidateTag('areas');
}

export async function revalidateStates() {
  revalidateTag('states');
}

export async function revalidateDoctors() {
  revalidateTag('doctors');
}
