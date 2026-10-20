import React from 'react';

import Link from 'next/link';

import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr';

import { getAllServices, getServiceIcon } from '@/helpers/services';

import { Button } from '@/components/ui/button';
import Container from '@/components/ui/container';
import { Wrapper } from '@/components/ui/wrapper';

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string | null;
  modified_at: string | null;
}

async function fetchServices(): Promise<Service[]> {
  const services = await getAllServices();
  return services.slice(0, 8) as Service[];
}

export async function BrowseServices() {
  const services = await fetchServices();

  return (
    <Wrapper className="border-t border-gray-200 dark:border-gray-800">
      <Container className="min-w-0">
        <div className="mb-8 flex min-w-0 flex-col gap-3 md:mb-10 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 max-w-2xl">
            <h2 className="text-balance font-display text-2xl font-bold text-gray-900 md:text-3xl dark:text-gray-50">
              Browse by service
            </h2>
            <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
              Find dental clinics by the dental serivce you need
            </p>
          </div>
          <Link
            href="/browse"
            prefetch={false}
            className="inline-flex shrink-0 items-center gap-1.5 self-start text-sm font-semibold text-blue-600 no-underline transition hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 md:self-auto dark:text-blue-400 dark:hover:text-blue-300 dark:focus-visible:outline-blue-400">
            View all service
            <ArrowRightIcon weight="duotone" className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid w-full min-w-0 grid-cols-2 gap-4 md:grid-cols-4 md:gap-4 lg:grid-cols-8">
          {services.length === 0 && (
            <div className="col-span-full text-center text-gray-400 dark:text-gray-500">
              No services found.
            </div>
          )}
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/services/${service.slug}`}
              tabIndex={0}
              aria-label={service.name}
              className="dark:hover:bg-blue-950/20 flex min-h-11 cursor-pointer flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-6 text-gray-900 outline-none transition hover:border-blue-200 hover:bg-blue-50/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-50 dark:hover:border-blue-800"
              role="button"
              prefetch={false}>
              {getServiceIcon(service.slug)}
              <div className="mt-4 text-center text-sm font-medium text-black dark:text-gray-50">
                {service.name}
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </Wrapper>
  );
}

export default BrowseServices;
