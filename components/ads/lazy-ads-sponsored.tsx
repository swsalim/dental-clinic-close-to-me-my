
import dynamic from 'next/dynamic';

import type { AdsSponsoredProps } from './types';

// Need to type the component with its props since it accepts props unlike the other ad components
export const LazyAdsSponsored = dynamic<AdsSponsoredProps>(() => import('./ads-sponsored'));
