import { SiteConfig } from '@/types';

import { absoluteUrl } from '@/lib/utils';

export const siteConfig: SiteConfig = {
  title: 'Find Dental Clinics Near You in Malaysia | Compare & Book Appointments Easily',
  description:
    'Explore top-rated dental clinics across Malaysia. Search by location, compare services and reviews, and book your dental appointment with ease.',
  siteName: 'Dental Clinic Close to Me',
  url: new URL(absoluteUrl()),
  openGraph: {
    image: '/images/og-default.png',
    imageAlt: 'Banner for dentalclinicclosetome.com',
    width: '1200',
    height: '630',
  },
  creator: '@swsalim',
};
