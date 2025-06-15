import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ArrowRightIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { absoluteUrl } from '@/lib/utils';

import { getClinicByServiceId } from '@/helpers/clinics';
import { getAllServices, getServiceBySlug } from '@/helpers/services';

import { ClinicCard } from '@/components/cards/clinic-card';
import { ImageCloudinary } from '@/components/image/image-cloudinary';
import { buttonVariants } from '@/components/ui/button';
import Container from '@/components/ui/container';
import { Wrapper } from '@/components/ui/wrapper';

type ServicePageProps = {
  params: Promise<{
    serviceSlug: string;
  }>;
};

export async function generateStaticParams() {
  // Get all services
  const services = await getAllServices();

  return services.map((service) => ({
    serviceSlug: service.slug,
  }));
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { serviceSlug } = await params;

  const services = await getAllServices();
  const serviceData = await getServiceBySlug(serviceSlug);
  console.log(serviceData);

  if (!serviceData) {
    notFound();
  }

  const clinics = await getClinicByServiceId(serviceData.id);

  return (
    <>
      <Wrapper>
        <Container>
          <h1 className="mb-0 text-xl font-black leading-7 text-gray-800 sm:truncate sm:text-3xl sm:leading-9 dark:text-gray-50">
            {serviceData.name}
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">{serviceData.description}</p>
        </Container>
      </Wrapper>

      <Wrapper className="py-0 md:py-0">
        <Container>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {services.map((service) => (
              <Link
                href={absoluteUrl(`/services/${service.slug}`)}
                className="text-balance py-1 text-base font-medium hover:border-transparent md:text-lg"
                key={service.slug}>
                {service.name}
              </Link>
            ))}
          </div>
        </Container>
      </Wrapper>

      <Wrapper>
        <Container>
          <h2 className="mb-6 text-balance text-xl font-bold md:text-2xl">
            All Dental Clinics that provides {serviceData.name}
          </h2>
          {clinics.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
              {clinics
                ?.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0))
                .map((clinic) => (
                  <ClinicCard
                    key={clinic.slug}
                    slug={clinic.slug ?? ''}
                    name={clinic.name ?? ''}
                    address={clinic.address ?? ''}
                    phone={clinic.phone ?? ''}
                    postalCode={clinic.postal_code ?? ''}
                    state={clinic.state?.name ?? ''}
                    area={clinic.area?.name ?? ''}
                    image={clinic.images?.[0]}
                    rating={clinic.rating}
                    isFeatured={clinic.is_featured ?? false}
                    hours={clinic.hours ?? []}
                    specialHours={clinic.special_hours ?? []}
                    openOnPublicHolidays={clinic.open_on_public_holidays ?? false}
                  />
                ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-y-4">
              <div className="flex flex-col items-center justify-center">
                <div className="relative size-64 md:size-96">
                  <ImageCloudinary
                    src="lost-boy.png"
                    alt="No dental clinics found"
                    width={500}
                    height={500}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <h2 className="text-balance text-2xl font-bold md:text-4xl">Oops!</h2>
              <p className="text-balance text-lg">No dental clinics provides {serviceData.name}.</p>
              <div className="flex flex-col gap-y-2 md:flex-row md:gap-x-3">
                <Link
                  href="/submit"
                  className={cn(buttonVariants({ variant: 'primary' }), 'flex flex-row gap-x-2')}>
                  Add a clinic
                  <ArrowRightIcon className="size-4" />
                </Link>
                <Link
                  href="/"
                  className={cn(buttonVariants({ variant: 'ghost' }), 'flex flex-row gap-x-2')}>
                  Get back to homepage
                  <ArrowRightIcon className="size-4" />
                </Link>
              </div>
            </div>
          )}
        </Container>
      </Wrapper>
    </>
  );
}
