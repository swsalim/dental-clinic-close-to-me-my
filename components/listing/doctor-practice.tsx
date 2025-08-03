import { cn } from '@/lib/utils';

import { getDoctorsByClinicSlug } from '@/helpers/doctors';

import { DoctorCardSimple } from '@/components/cards/doctor-card-simple';

interface DoctorPracticeProps {
  clinicSlug: string;
  className?: string;
}

export default async function DoctorPractice({ clinicSlug, className }: DoctorPracticeProps) {
  const doctors = await getDoctorsByClinicSlug(clinicSlug);

  if (doctors.length === 0) {
    return (
      <div className={cn('rounded-lg bg-gray-50 p-4 text-center', className)}>
        <p className="text-gray-600">No doctors found for this clinic.</p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <h2 className="text-xl font-semibold">Our Doctors</h2>

      <div className="flex flex-wrap gap-4">
        {doctors.map((doctor) => (
          <DoctorCardSimple key={doctor.id} doctor={doctor} />
        ))}
      </div>
    </div>
  );
}
