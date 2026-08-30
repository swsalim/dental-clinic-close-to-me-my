import { Metadata } from 'next';

import { getAllServices } from '@/helpers/services';

import {
  generateServiceListingMetadata,
  ServiceListing,
} from '@/components/listing/pages/service-listing';

export const revalidate = 1_209_600;
export const dynamic = 'force-static';
export const dynamicParams = true;

type ServicePageProps = {
  params: Promise<{ serviceSlug: string }>;
};

export async function generateStaticParams() {
  const services = await getAllServices();

  return services.map((service) => ({
    serviceSlug: service.slug,
  }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { serviceSlug } = await params;
  return generateServiceListingMetadata(serviceSlug, 1);
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { serviceSlug } = await params;
  return <ServiceListing serviceSlug={serviceSlug} currentPage={1} />;
}
