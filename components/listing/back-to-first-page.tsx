import Link from 'next/link';

/**
 * Text link from a paginated location listing back to page 1.
 * Page 1 of the same list already has its own URL (no /page/1).
 */
export function BackToFirstPage({
  href,
  placeName,
  currentPage,
}: {
  href: string;
  placeName: string;
  currentPage: number;
}) {
  if (currentPage <= 1) {
    return null;
  }

  return (
    <p className="text-base font-medium text-white">
      <Link
        href={href}
        className="text-blue-200 underline decoration-blue-200 underline-offset-4 hover:text-white"
        prefetch={false}>
        Back to page 1
      </Link>
      {placeName ? <span> of dental clinics in {placeName}.</span> : null}
    </p>
  );
}
