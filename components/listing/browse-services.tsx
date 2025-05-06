import React from 'react';

import { createServerClient } from '@/lib/supabase';

import * as Icons from '@/components/icons';
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

const slugToIcon: Record<string, React.ReactNode> = {
  veneers: (
    <Icons.DentalVeneer className="mx-auto h-16 w-16 text-red-500" aria-label="Dental Veneer" />
  ),
  invisalign: (
    <Icons.Invisalign className="mx-auto h-16 w-16 text-red-500" aria-label="Invisalign" />
  ),
  'cosmetic-dentistry': (
    <Icons.CosmeticDentistry
      className="mx-auto h-16 w-16 text-red-500"
      aria-label="Cosmetic Dentistry"
    />
  ),
  periodontics: (
    <Icons.Periodontics className="mx-auto h-16 w-16 text-red-500" aria-label="Periodontics" />
  ),
  'general-dentistry': (
    <Icons.GeneralDentistry
      className="mx-auto h-16 w-16 text-red-500"
      aria-label="General Dentistry"
    />
  ),
  'emergency-dentistry': (
    <Icons.EmergencyDentistry
      className="mx-auto h-16 w-16 text-red-500"
      aria-label="Emergency Dentistry"
    />
  ),
  'root-canal': (
    <Icons.RootCanal className="mx-auto h-16 w-16 text-red-500" aria-label="Root Canal" />
  ),
  endodontics: (
    <Icons.RootCanal className="mx-auto h-16 w-16 text-red-500" aria-label="Root Canal" />
  ),
  bacteria: <Icons.Bacteria className="mx-auto h-16 w-16 text-red-500" aria-label="Bacteria" />,
  'pediatric-dentistry': (
    <Icons.PaediatricDentistry
      className="mx-auto h-16 w-16 text-red-500"
      aria-label="Paediatric Dentistry"
    />
  ),
  'dental-xrays': (
    <Icons.DentalXrays className="mx-auto h-16 w-16 text-red-500" aria-label="Dental Xrays" />
  ),
  crowning: <Icons.Crowning className="mx-auto h-16 w-16 text-red-500" aria-label="Crowning" />,
  prosthodontics: (
    <Icons.Dentures className="mx-auto h-16 w-16 text-red-500" aria-label="Dentures" />
  ),
  'tooth-extraction': (
    <Icons.ToothExtraction
      className="mx-auto h-16 w-16 text-red-500"
      aria-label="Tooth Extraction"
    />
  ),
  'wisdom-tooth-extraction': (
    <Icons.ToothExtraction
      className="mx-auto h-16 w-16 text-red-500"
      aria-label="Tooth Extraction"
    />
  ),
  'dental-implants': (
    <Icons.DentalImplant className="mx-auto h-16 w-16 text-red-500" aria-label="Dental Implant" />
  ),
  'oral-surgery': (
    <Icons.DentalImplant className="mx-auto h-16 w-16 text-red-500" aria-label="Dental Implant" />
  ),
  orthodontics: (
    <Icons.DentalBraces className="mx-auto h-16 w-16 text-red-500" aria-label="Dental Braces" />
  ),
  braces: (
    <Icons.DentalBraces className="mx-auto h-16 w-16 text-red-500" aria-label="Dental Braces" />
  ),
  'teeth-whitening': (
    <Icons.TeethWhitening className="mx-auto h-16 w-16 text-red-500" aria-label="Teeth Whitening" />
  ),
};

function getServiceIcon(slug: string): React.ReactNode {
  return (
    slugToIcon[slug] ?? (
      <Icons.Bacteria className="mx-auto h-16 w-16 text-red-500" aria-label="Service" />
    )
  );
}

async function fetchServices(): Promise<Service[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('clinic_services')
    .select('*')
    .order('modified_at', { ascending: false });

  if (error) {
    // Optionally log error
    return [];
  }
  return (data.slice(0, 6) as Service[]) ?? [];
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
