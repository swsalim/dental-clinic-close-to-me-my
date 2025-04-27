import { notFound } from 'next/navigation';

import { ClinicService, ClinicServiceRelation, ClinicStateArea } from '@/types/clinic';

import { createClient } from '@/lib/supabase/server';

import { Separator } from '@/components/ui/separator';
import { SidebarNav } from '@/components/ui/sidebar-nav';

import FormEditClinic from '../../components/form-edit-clinic';

export default async function EditClinicToBeReviewedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;

  console.log('id', id);
  const { data: clinic } = await supabase.from('clinics').select().match({ id }).single();

  if (!clinic) {
    notFound();
  }

  const sidebarNavItems = [
    {
      title: 'Profile',
      href: `/dashboard/clinics/edit/${id}`,
    },
    {
      title: 'Location',
      href: `/dashboard/clinics/edit/location/${id}`,
    },
    {
      title: 'Social',
      href: `/dashboard/clinics/edit/social/${id}`,
    },
    {
      title: 'Images',
      href: `/dashboard/clinics/edit/images/${id}`,
    },
  ];

  const [
    { data: servicesData },
    { data: servicesRelationsData },
    { data: statesData },
    { data: areasData },
    { data: hoursData },
  ] = await Promise.all([
    supabase.from('clinic_services').select('*', { count: 'exact' }),
    supabase.from('clinic_service_relations').select('*', { count: 'exact' }).eq('clinic_id', id),
    supabase.from('states').select('*', { count: 'exact' }),
    supabase.from('areas').select('*', { count: 'exact' }),
    supabase.from('clinic_hours').select('*', { count: 'exact' }).eq('clinic_id', id),
  ]);

  // Ensure we have arrays even if data is null
  const services = (servicesData || []) as ClinicService[];
  const servicesRelations = (servicesRelationsData || []) as ClinicServiceRelation[];
  const states = (statesData || []) as ClinicStateArea[];
  const areas = (areasData || []) as ClinicStateArea[];
  const hours = hoursData || [];

  return (
    <div className="flex flex-row gap-6">
      <aside className="lg:w-1/5">
        <SidebarNav items={sidebarNavItems} />
      </aside>
      <div className="flex-1 lg:max-w-full">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">{clinic.name}</h3>
            <p className="text-sm text-gray-500">
              This is how others will see this listing on the site.
            </p>
          </div>
          <Separator />
          <FormEditClinic
            clinic={clinic}
            services={services}
            areas={areas}
            states={states}
            hours={hours}
            selectedServices={servicesRelations}
          />
        </div>
      </div>
    </div>
  );
}
