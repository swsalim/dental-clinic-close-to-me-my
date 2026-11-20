import { SiteConfig } from '@/types';

import { HOME_DESCRIPTION_FALLBACK, HOME_TITLE } from '@/lib/listing/home-meta';
import { absoluteUrl } from '@/lib/utils';

export const siteConfig: SiteConfig = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION_FALLBACK,
  siteName: 'Dental Clinics Malaysia',
  url: new URL(absoluteUrl()),
  openGraph: {
    image: '/images/hero-home.webp',
    imageAlt: 'Banner for dentalclinicclosetome.com',
    width: '1200',
    height: '630',
  },
  creator: '@swsalim',
};
