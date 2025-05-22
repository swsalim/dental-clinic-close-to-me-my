import Link from 'next/link';

import { cn } from '@/lib/utils';

import BrowseServices from '@/components/listing/browse-services';
import { ExploreStates } from '@/components/listing/explore-states';
import WebsiteJsonLd from '@/components/structured-data/website-json-ld';
import { buttonVariants } from '@/components/ui/button';

function Hero() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 sm:p-20">
      <div className="row-start-2 flex flex-col items-start justify-center gap-24 text-start">
        <div className="flex flex-col gap-2">
          <p className="max-w-xl text-start text-base font-medium text-gray-500 dark:text-gray-300">
            Malaysia&apos;s Most Trusted Dental Clinic Directory
          </p>
          <h1 className="txt-start max-w-xl text-balance text-5xl font-black capitalize leading-tight">
            Let&apos;s find a perfect dental clinic for you
          </h1>
          <svg
            width="155"
            height="20"
            viewBox="0 0 155 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M1.77001 13.4143C2.28873 13.1363 2.59997 12.9509 3.01494 12.6729C3.42992 12.4876 3.74115 12.3022 4.15613 12.1169C4.88234 11.7462 5.71229 11.3754 6.4385 11.0047C7.99466 10.2633 9.55082 9.70728 11.0032 9.05855C14.1156 7.85376 17.2279 6.83433 20.4439 5.90757C26.7723 4.14672 33.3082 2.75658 39.7403 1.82983C46.38 0.903066 52.9158 0.34701 59.4517 0.161658C65.9876 -0.11637 72.5235 -0.0236942 79.0593 0.34701C80.7192 0.439686 82.2754 0.532362 83.9353 0.625038C85.5952 0.717714 87.1514 0.81039 88.8113 0.995741C92.0273 1.36645 95.2434 1.64447 98.4595 2.10785L103.335 2.75658L108.108 3.49799C111.324 3.96137 114.436 4.6101 117.652 5.25884C130.309 7.76109 142.758 11.0974 155 14.8971C142.551 11.6535 129.998 8.8732 117.237 7.01968C114.021 6.5563 110.909 6.09292 107.693 5.72222L102.92 5.16616L98.1482 4.79546C94.9322 4.51743 91.7161 4.33208 88.5001 4.14672C86.9439 4.05405 85.284 4.05405 83.7278 3.96137C82.1717 3.8687 80.5118 3.8687 78.9556 3.8687C66.1951 3.77602 53.3308 4.79546 40.9853 7.20503C34.7606 8.40982 28.7435 9.98531 22.8301 11.9315C19.9252 12.9509 17.0204 14.0631 14.2193 15.2678C12.8706 15.9166 11.4182 16.5653 10.1733 17.214C9.55082 17.5847 8.82461 17.8628 8.20215 18.2335C7.89091 18.4188 7.57968 18.6042 7.26845 18.7895C6.95722 18.9749 6.64598 19.1602 6.4385 19.2529C4.67485 20.4577 2.18499 20.1797 0.836317 18.6042C-0.512355 17.0287 -0.201123 14.8045 1.56253 13.5997C1.66627 13.507 1.66627 13.507 1.77001 13.4143Z"
              fill="#FF4A52"></path>
          </svg>
        </div>
        <div className="flex w-full flex-col items-start justify-center gap-4 sm:flex-row">
          <Link
            className={cn(
              buttonVariants({
                variant: 'primary',
              }),
              'w-full rounded-full',
            )}
            href="/browse">
            Search
          </Link>
          <Link
            className={cn(
              buttonVariants({
                variant: 'secondary',
              }),
              'w-full rounded-full',
            )}
            href="#">
            List your clinic for FREE
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main>
      <WebsiteJsonLd company="Dental Clinics Malaysia" url={process.env.NEXT_PUBLIC_BASE_URL} />
      <Hero />
      <BrowseServices />
      <ExploreStates />
    </main>
  );
}
