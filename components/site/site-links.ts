/* Hallmark · redesign: navbar + footer · nav: N6 Newspaper masthead · footer: Ft3 index (domain)
 * genre: editorial · tone: utilitarian · pre-emit critique: P4 H5 E5 S5 R4 V4
 */

import type { ElementType } from 'react';

import { MapPinIcon, MegaphoneIcon, PlusIcon, StethoscopeIcon } from 'lucide-react';

export type SiteNavItem = {
  name: string;
  href: string;
  description?: string;
  icon?: ElementType;
  matchPaths?: string[];
};

export type FooterLinkGroup = {
  title: string;
  links: {
    label: string;
    href: string;
    external?: boolean;
  }[];
};

export const primaryNavItems: SiteNavItem[] = [
  {
    name: 'Browse',
    href: '/browse',
    description: 'Find clinics by state and area',
    icon: MapPinIcon,
    matchPaths: ['/browse'],
  },
  {
    name: 'Dentists',
    href: '/dentists',
    description: 'Search dentists across Malaysia',
    icon: StethoscopeIcon,
    matchPaths: ['/dentists', '/dentist/'],
  },
  {
    name: 'Submit',
    href: '/submit',
    description: 'Add or update a clinic listing',
    icon: PlusIcon,
    matchPaths: ['/submit'],
  },
];

export const footerLinkGroups: FooterLinkGroup[] = [
  {
    title: 'Explore',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Browse by location', href: '/browse' },
      { label: 'All dentists', href: '/dentists' },
    ],
  },
  {
    title: 'For clinics',
    links: [
      { label: 'Submit a listing', href: '/submit' },
      { label: 'Advertise with us', href: '/advertise-with-us' },
    ],
  },
  {
    title: 'Network',
    links: [
      { label: 'Clinic Geek', href: 'https://www.clinicgeek.com/', external: true },
      {
        label: 'Aesthetic Clinics Malaysia',
        href: 'https://www.aestheticclinics.my/',
        external: true,
      },
    ],
  },
];

export const advertiseNavItem = {
  name: 'Advertise',
  href: '/advertise-with-us',
  description: 'Premium visibility for clinic owners',
  icon: MegaphoneIcon,
  matchPaths: ['/advertise-with-us'],
} satisfies SiteNavItem;

export function isNavItemActive(pathname: string | null, item: SiteNavItem): boolean {
  if (!pathname) return false;
  if (pathname === item.href) return true;
  return item.matchPaths?.some((path) => pathname.startsWith(path)) ?? false;
}
