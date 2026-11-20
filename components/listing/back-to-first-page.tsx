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
    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
      <Link
        href={href}
        className="font-semibold text-blue-600 no-underline hover:text-blue-700 dark:text-blue-300"
        prefetch={false}>
        Back to page 1
      </Link>
      {placeName ? <span> of dental clinics in {placeName}.</span> : null}
    </p>
  );
}
