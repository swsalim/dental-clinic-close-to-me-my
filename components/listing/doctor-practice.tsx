import { cn } from '@/lib/utils';

import { getDoctorsByClinicSlug } from '@/helpers/doctors';

import { DoctorCardSimple } from '@/components/cards/doctor-card-simple';

interface DoctorPracticeProps {
  clinicSlug: string;
  className?: string;
  variant?: 'default' | 'sidebar';
}

export default async function DoctorPractice({
  clinicSlug,
  className,
  variant = 'default',
}: DoctorPracticeProps) {
  const doctors = await getDoctorsByClinicSlug(clinicSlug);

  if (doctors.length === 0) {
    return null;
  }

  if (variant === 'sidebar') {
    return (
      <section
        aria-labelledby="sidebar-doctors-heading"
        className={cn('overflow-hidden bg-white shadow-sm dark:bg-gray-950/40', className)}>
        <div className="py-4">
          <h2
            id="sidebar-doctors-heading"
            className="m-0 font-display text-lg font-bold leading-tight dark:text-gray-50">
            Our Doctors
          </h2>
        </div>
        <ul className="flex flex-col gap-3 p-4">
          {doctors.map((doctor) => (
            <li key={doctor.id} className="min-w-0">
              <DoctorCardSimple doctor={doctor} />
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <h2 className="mb-0 font-display text-xl font-semibold">Our Doctors</h2>

      <div className="flex flex-wrap gap-4">
        {doctors.map((doctor) => (
          <DoctorCardSimple key={doctor.id} doctor={doctor} />
        ))}
      </div>
    </div>
  );
}
