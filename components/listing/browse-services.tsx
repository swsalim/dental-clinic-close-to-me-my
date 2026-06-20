import React from 'react';

import Link from 'next/link';

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
  return services.slice(0, 6) as Service[];
}

export async function BrowseServices() {
  const services = await fetchServices();

  return (
    <Wrapper className="border-t border-gray-200 dark:border-gray-800">
      <Container className="min-w-0">
        <div className="flex min-w-0 w-full flex-col md:flex-row md:gap-12 lg:gap-16">
          <div className="mb-8 min-w-0 md:mb-0 md:w-5/12">
            <h2 className="font-display mb-3 text-2xl font-bold text-gray-900 md:text-3xl dark:text-gray-50">
              Browse by service
            </h2>
            <p className="mb-6 text-base text-gray-600 dark:text-gray-300">
              From routine checkups to specialised care — pick a service to see clinics that offer
              it.
            </p>
            <Button asChild variant="outline" aria-label="Browse services" size="large">
              <Link href="/services/general-dentistry">
                All services
                <span className="ml-2" aria-hidden="true">
                  →
                </span>
              </Link>
            </Button>
          </div>
          <div className="grid min-w-0 w-full grid-cols-2 gap-4 sm:grid-cols-3 md:w-7/12 md:gap-5">
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
                className="flex min-h-11 cursor-pointer flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-6 text-gray-900 outline-none transition hover:border-blue-200 hover:bg-blue-50/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-50 dark:hover:border-blue-800 dark:hover:bg-blue-950/20"
                role="button"
                prefetch={false}>
                {getServiceIcon(service.slug)}
                <div className="mt-4 text-center text-lg font-semibold text-black dark:text-gray-50">
                  {service.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </Wrapper>
  );
}

export default BrowseServices;
