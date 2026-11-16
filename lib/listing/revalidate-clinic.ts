import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Refresh one clinic and the listing pages that include it.
 * Does not touch the shared `clinics` tag, which would rebuild the directory.
 * Not a Server Action: callers must already be authenticated.
 */
export function revalidateClinicPage(input: {
  slug: string;
  previousSlug?: string | null;
  stateSlug?: string | null;
  areaSlug?: string | null;
}) {
  const slugs = [...new Set([input.slug, input.previousSlug].filter(Boolean))] as string[];

  for (const slug of slugs) {
    revalidateTag(`clinic-${slug}`);
    revalidatePath(`/place/${slug}`);
  }

  if (input.stateSlug) {
    revalidatePath(`/${input.stateSlug}`);
    if (input.areaSlug) {
      revalidatePath(`/${input.stateSlug}/${input.areaSlug}`);
    }
  }
}
