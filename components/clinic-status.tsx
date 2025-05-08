'use client';

import { useEffect, useState } from 'react';

import { ClinicHours, ClinicSpecialHours } from '@/types/clinic';

import { Badge } from '@/components/ui/badge';

type ClinicStatus = 'open' | 'closed' | 'opening-soon' | 'closing-soon';

function getClinicStatus(
  regularHours: Partial<ClinicHours>[],
  specialHours: Partial<ClinicSpecialHours>[],
  date: Date = new Date(),
): ClinicStatus {
  const dayOfWeek = date.getDay() - 1;
  const currentTime = date.toTimeString().slice(0, 5); // HH:mm format

  // Helper function to check if current time is within 30 minutes of a target time
  const isWithin30Minutes = (targetTime: string): boolean => {
    const currentMinutes =
      parseInt(currentTime.split(':')[0]) * 60 + parseInt(currentTime.split(':')[1]);
    const targetMinutes =
      parseInt(targetTime.split(':')[0]) * 60 + parseInt(targetTime.split(':')[1]);
    const diff = Math.abs(currentMinutes - targetMinutes);
    return diff <= 30;
  };

  // Check special hours first
  const specialHoursForDate = specialHours.find(
    (sh) => sh.date === date.toISOString().split('T')[0],
  );

  if (specialHoursForDate) {
    if (specialHoursForDate.is_closed) return 'closed';
    if (!specialHoursForDate.open_time || !specialHoursForDate.close_time) return 'closed';

    // Check if closing soon
    if (isWithin30Minutes(specialHoursForDate.close_time)) return 'closing-soon';

    // Check if opening soon
    if (isWithin30Minutes(specialHoursForDate.open_time)) return 'opening-soon';

    return currentTime >= specialHoursForDate.open_time &&
      currentTime <= specialHoursForDate.close_time
      ? 'open'
      : 'closed';
  }

  // Check regular hours
  const regularHoursForDay = regularHours.find((h) => h.day_of_week === dayOfWeek);
  if (!regularHoursForDay) return 'closed';
  if (!regularHoursForDay.open_time || !regularHoursForDay.close_time) return 'closed';

  // Check if closing soon
  if (isWithin30Minutes(regularHoursForDay.close_time)) return 'closing-soon';

  // Check if opening soon
  if (isWithin30Minutes(regularHoursForDay.open_time)) return 'opening-soon';

  return currentTime >= regularHoursForDay.open_time && currentTime <= regularHoursForDay.close_time
    ? 'open'
    : 'closed';
}

interface ClinicStatusProps {
  hours: Partial<ClinicHours>[];
  specialHours: Partial<ClinicSpecialHours>[];
}

export function ClinicStatus({ hours, specialHours }: ClinicStatusProps) {
  const [status, setStatus] = useState<ClinicStatus>('closed');

  useEffect(() => {
    const checkStatus = () => {
      setStatus(getClinicStatus(hours, specialHours));
    };

    // Check immediately
    checkStatus();

    // Check every minute
    const interval = setInterval(checkStatus, 60000);

    return () => clearInterval(interval);
  }, [hours, specialHours]);

  const statusConfig = {
    open: {
      variant: 'green' as const,
      text: 'Open Now',
    },
    closed: {
      variant: 'red' as const,
      text: 'Closed',
    },
    'opening-soon': {
      variant: 'yellow' as const,
      text: 'Opening Soon',
    },
    'closing-soon': {
      variant: 'yellow' as const,
      text: 'Closing Soon',
    },
  };

  return (
    <Badge variant={statusConfig[status].variant} className="capitalize">
      {statusConfig[status].text}
    </Badge>
  );
}
