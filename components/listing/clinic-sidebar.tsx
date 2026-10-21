import type { ReactNode } from 'react';

// import Image from 'next/image';
import Image from 'next/image';

import { ClinicService } from '@/types/clinic';
import {
  Envelope,
  FacebookLogo,
  Globe,
  InstagramLogo,
  MapPin as MapPinIcon,
  Phone,
  TiktokLogo,
  YoutubeLogo,
} from '@phosphor-icons/react/dist/ssr';

import { MEDIA } from '@/lib/media-sizes';
// import { MEDIA } from '@/lib/media-sizes';
import { cn } from '@/lib/utils';

import { getServiceIcon } from '@/helpers/services';

import MapWrapper from '@/components/mapbox-map/map-wrapper';
import { buttonVariants } from '@/components/ui/button';

import DoctorPractice from './doctor-practice';
import { GetDirectionButton } from './get-direction-button';

interface ClinicSidebarProps {
  clinicSlug: string;
  clinicName: string;
  address?: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  youtubeUrl?: string | null;
  tiktokUrl?: string | null;
  latitude: number;
  longitude: number;
  services?: Partial<ClinicService>[] | null;
  className?: string;
}

function SidebarPanel({
  id,
  title,
  children,
  className,
}: {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-labelledby={id}
      className={cn('overflow-hidden bg-white shadow-sm dark:bg-gray-950/40', className)}>
      <div className="py-4">
        <h2 id={id} className="m-0 font-display text-lg font-bold leading-tight dark:text-gray-50">
          {title}
        </h2>
      </div>
      <div className="">{children}</div>
    </section>
  );
}

export function ClinicSidebar({
  clinicSlug,
  clinicName,
  address,
  phone,
  email,
  website,
  facebookUrl,
  instagramUrl,
  youtubeUrl,
  tiktokUrl,
  latitude,
  longitude,
  className,
}: ClinicSidebarProps) {
  const socials = [
    {
      href: facebookUrl,
      label: 'Facebook',
      icon: FacebookLogo,
      className:
        '"flex-grow-0 justify-center p-3 text-[#1877f2] hover:text-[#1877f2] dark:text-[#1877f2] dark:hover:text-[#1877f2]"',
    },
    {
      href: instagramUrl,
      label: 'Instagram',
      icon: InstagramLogo,
      className:
        'flex-grow-0 justify-center p-3 text-[#e1306c] hover:text-[#e1306c] dark:text-[#e1306c] dark:hover:text-[#e1306c]',
    },
    {
      href: youtubeUrl,
      label: 'YouTube',
      icon: YoutubeLogo,
      className:
        'flex-grow-0 justify-center p-3 text-[#ff0000] hover:text-[#ff0000] dark:text-[#ff0000] dark:hover:text-[#ff0000]',
    },
    {
      href: tiktokUrl,
      label: 'TikTok',
      icon: TiktokLogo,
      className:
        'flex-grow-0 justify-center p-3 text-black hover:text-black dark:text-black dark:hover:text-black',
    },
  ].filter((item): item is typeof item & { href: string } => Boolean(item.href));
  const hasContact = Boolean(phone || email || website || socials.length > 0);

  return (
    <aside
      className={cn(
        'flex min-w-0 flex-col gap-6 lg:sticky lg:top-20 lg:self-start lg:overflow-y-auto',
        className,
      )}>
      <SidebarPanel id="sidebar-location" title="Location" className="hidden lg:block">
        <div className="overflow-hidden rounded-lg">
          <MapWrapper
            locations={[
              {
                lat: latitude,
                long: longitude,
                name: clinicName,
              },
            ]}
          />
        </div>
        <p className="mt-3 flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
          <MapPinIcon
            weight="duotone"
            className="mt-0.5 h-4 w-4 shrink-0 text-blue-400"
            aria-hidden="true"
          />
          <span className="min-w-0 break-words">{address || clinicName}</span>
        </p>
        <GetDirectionButton
          clinicSlug={clinicSlug}
          name={address || clinicName}
          variant="primary"
          className="mt-3 w-full text-white hover:text-white"
        />
      </SidebarPanel>

      {hasContact && (
        <SidebarPanel id="sidebar-contact" title="Contact" className="hidden lg:block">
          <ul className="flex flex-col gap-3">
            {phone && (
              <li className="flex items-center gap-2 text-sm text-gray-700 no-underline hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-300">
                <Phone
                  weight="duotone"
                  className="mt-0.5 h-4 w-4 shrink-0 text-blue-400"
                  aria-hidden="true"
                />
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="">
                  <span className="min-w-0 break-words">{phone}</span>
                </a>
              </li>
            )}
            {email && (
              <li className="flex items-center gap-2 text-sm text-gray-700 no-underline hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-300">
                <Envelope
                  weight="duotone"
                  className="mt-0.5 h-4 w-4 shrink-0 text-blue-400"
                  aria-hidden="true"
                />
                <a href={`mailto:${email}`} className="">
                  <span className="min-w-0 break-all">{email}</span>
                </a>
              </li>
            )}
            {website && (
              <li className="flex items-center gap-2 text-sm text-gray-700 no-underline hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-300">
                <Globe
                  weight="duotone"
                  className="mt-0.5 h-4 w-4 shrink-0 text-blue-400"
                  aria-hidden="true"
                />
                <a
                  href={`${website}?utm_source=dentalclinicclosetome.my`}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="">
                  <span className="min-w-0 break-all">{website}</span>
                </a>
              </li>
            )}
          </ul>
          {socials.length > 0 && (
            <div className="mt-4 flex gap-2">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  aria-label={`Visit ${clinicName} on ${social.label}`}
                  className={cn(buttonVariants({ variant: 'outline' }), social.className)}>
                  <social.icon weight="duotone" className="size-6" aria-hidden="true" />
                </a>
              ))}
            </div>
          )}
        </SidebarPanel>
      )}

      <DoctorPractice clinicSlug={clinicSlug} variant="sidebar" />

      <a
        href="https://invl.me/clo4xmy"
        className="hover:!border-b-transparent"
        target="_blank"
        rel="nofollow noopener noreferrer">
        <Image
          src="/images/product-curaprox.webp"
          alt="Curaprox Orthodontic Kits"
          width={MEDIA.card.width}
          height={MEDIA.card.height}
          sizes={MEDIA.card.sizes}
          className="m-0 h-auto w-full object-contain"
        />
      </a>
    </aside>
  );
}
