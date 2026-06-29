import type { ReactNode } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { ClinicService } from '@/types/clinic';
import { MapPinIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

import { getServiceIcon } from '@/helpers/services';

import MapWrapper from '@/components/mapbox-map/map-wrapper';

import DoctorPractice from './doctor-practice';

interface ClinicSidebarProps {
  clinicSlug: string;
  clinicName: string;
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
  latitude,
  longitude,
  services,
  className,
}: ClinicSidebarProps) {
  const hasServices = services && services.length > 0;

  return (
    <aside
      className={cn('flex min-w-0 flex-col gap-6 lg:sticky lg:top-20 lg:self-start', className)}>
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
          <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" aria-hidden="true" />
          <span className="min-w-0 break-words">{clinicName}</span>
        </p>
      </SidebarPanel>

      <DoctorPractice clinicSlug={clinicSlug} variant="sidebar" />

      <figure className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950/40">
        <figcaption className="border-b border-gray-100 px-3 py-2 text-center text-[10px] font-medium uppercase tracking-[0.14em] text-gray-400 dark:border-gray-800 dark:text-gray-500">
          Partner
        </figcaption>
        <a
          href="https://invl.me/clnlab2"
          className="block outline-none transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 active:opacity-90"
          target="_blank"
          rel="nofollow noopener noreferrer">
          <Image
            src="/images/total-image-2.jpg"
            alt="Total Image"
            width={600}
            height={600}
            priority
            quality={85}
            sizes="(max-width: 1024px) 100vw, 320px"
            className="m-0 h-auto w-full object-cover"
            style={{ objectPosition: 'center center' }}
          />
        </a>
      </figure>

      {hasServices && (
        <SidebarPanel
          id="sidebar-services"
          title={`${clinicName} Services`}
          className="hidden lg:block">
          <ul className="grid min-w-0 grid-cols-2 gap-2.5">
            {services.map((service, index) => (
              <li key={service.slug ?? service.name ?? String(index)} className="min-w-0">
                <Link
                  href={`/services/${service.slug}`}
                  aria-label={service.name}
                  className="dark:hover:bg-blue-950/40 group flex min-h-[5.5rem] min-w-0 flex-col items-center justify-center rounded-lg border border-gray-100 bg-gray-50/80 px-2 py-3 text-center text-gray-900 outline-none transition-[border-color,background-color,transform,box-shadow] duration-150 hover:border-blue-200 hover:bg-blue-50/60 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 active:scale-[0.98] dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-50 dark:hover:border-blue-800 dark:focus-visible:ring-offset-gray-900">
                  <span className="text-blue-500 transition-colors group-hover:text-blue-600 dark:text-blue-300 dark:group-hover:text-blue-200">
                    {getServiceIcon(service.slug ?? '')}
                  </span>
                  <span className="mt-2 line-clamp-2 min-w-0 text-xs font-medium leading-snug">
                    {service.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </SidebarPanel>
      )}
    </aside>
  );
}
