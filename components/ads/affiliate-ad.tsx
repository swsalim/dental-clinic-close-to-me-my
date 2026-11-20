import type { ReactNode } from 'react';

/** Visible "Ad" caption. Same scale and color as the AdSense "Advertisement" label. */
export function AffiliateAd({ children }: { children: ReactNode }) {
  return (
    <div>
      <p className="m-0 mb-1 text-center text-[10px] font-medium uppercase leading-4 text-gray-500 dark:text-gray-400">
        Ad
      </p>
      {children}
    </div>
  );
}
