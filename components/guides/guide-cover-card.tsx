import Image from 'next/image';
import Link from 'next/link';

import { GUIDE_IMAGE_HEIGHT, GUIDE_IMAGE_WIDTH } from '@/lib/guides';

export function GuideCoverCard({
  href,
  image,
  imageAlt = '',
  title,
  description,
  meta,
}: {
  href: string;
  image: string;
  imageAlt?: string;
  title: string;
  description: string;
  meta: string;
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white no-underline hover:border-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-blue-700 dark:focus-visible:ring-offset-gray-900">
      <Image
        src={image}
        alt={imageAlt}
        width={GUIDE_IMAGE_WIDTH}
        height={GUIDE_IMAGE_HEIGHT}
        className="aspect-[16/9] w-full object-cover"
      />
      <span className="flex flex-1 flex-col p-4">
        <span className="font-display text-lg font-bold text-gray-900 dark:text-gray-50">{title}</span>
        <span className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          {description}
        </span>
        <span className="mt-3 text-sm font-semibold text-blue-700 dark:text-blue-300">{meta}</span>
      </span>
    </Link>
  );
}
