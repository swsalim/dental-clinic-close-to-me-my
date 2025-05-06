import { notFound } from 'next/navigation';

import { createAdminClient } from '@/lib/supabase/admin';

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
}

type ServicePageProps = {
  params: Promise<{
    serviceSlug: string;
  }>;
};

export async function generateStaticParams() {
  // Get all services for static paths
  const supabase = createAdminClient();

  // Get all services
  const { data: serviceData, error: serviceError } = (await supabase.from('clinic_services').select(
    `
      id,
      name,
      slug,
      description
    `,
  )) as { data: Service[] | null; error: Error | null };

  if (serviceError || !serviceData) return [];

  return serviceData.map((service) => ({
    serviceSlug: service.slug,
  }));
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { serviceSlug } = await params;

  const supabase = createAdminClient();

  const { data: serviceData } = (await supabase
    .from('clinic_services')
    .select(
      `
      id,
      name,
      slug,
      description
    `,
    )
    .match({ slug: serviceSlug })
    .single()) as { data: Service | null };

  if (!serviceData) {
    notFound();
  }

  return (
    <div>
      <h1>{serviceData.name}</h1>
      <p>{serviceData.description}</p>
    </div>
  );
}
