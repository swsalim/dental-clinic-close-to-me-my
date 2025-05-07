import React from 'react';

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
    <Wrapper className="bg-gray-50">
      <Container>
        <div className="flex w-full flex-col items-center justify-center md:flex-row">
          <div className="mb-10 w-full px-4 md:mb-0 md:w-5/12">
            <h2 className="mb-4 text-3xl font-black text-black md:text-4xl">
              Browse a Variety of Dental Services
            </h2>
            <p className="mb-8 text-gray-500">
              Whether you’re coming in for a regular checkup or need something more specialized,
              we’re here to help keep your smile bright and healthy. Take a look at the services we
              offer for kids, teens, and adults alike!
            </p>
            <Button
              className="flex items-center gap-2 rounded-full bg-red-500 px-8 py-3 font-semibold text-white hover:bg-red-600"
              aria-label="Browse Services">
              Browse Services
              <span className="ml-2" aria-hidden="true">
                →
              </span>
            </Button>
          </div>
          <div className="grid w-full grid-cols-1 gap-6 px-4 sm:grid-cols-2 md:w-7/12 lg:grid-cols-3">
            {services.length === 0 && (
              <div className="col-span-full text-center text-gray-400">No services found.</div>
            )}
            {services.map((service) => (
              <div
                key={service.id}
                tabIndex={0}
                aria-label={service.name}
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl bg-white p-8 shadow-md outline-none transition hover:shadow-lg focus:ring-2 focus:ring-red-400"
                role="button">
                {getServiceIcon(service.slug)}
                <div className="mt-4 text-center text-lg font-semibold text-black">
                  {service.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Wrapper>
  );
}

export default BrowseServices;
