'use client';

import { useEffect, useState } from 'react';

import { ClinicHours, ClinicSpecialHours } from '@/types/clinic';
import { Alarm as AlarmClockIcon, ClockCountdown as ClockAlertIcon, Hourglass as ClockFadingIcon, Clock as ClockIcon } from '@phosphor-icons/react/dist/ssr';

import { Badge } from '@/components/ui/badge';
import { getClinicAvailability, type ClinicAvailability } from '@/lib/listing/clinic-availability';

interface ClinicStatusProps {
  hours: Partial<ClinicHours>[];
  specialHours: Partial<ClinicSpecialHours>[];
}

export function ClinicStatus({ hours, specialHours }: ClinicStatusProps) {
  const [status, setStatus] = useState<ClinicAvailability | null>(null);

  useEffect(() => {
    const checkStatus = () => {
      setStatus(getClinicAvailability(hours, specialHours));
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
      text: 'Open',
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
    <>
      {status && (
        <Badge variant={statusConfig[status].variant} className="duration-150 animate-in fade-in">
          {status === 'open' && <ClockIcon weight="duotone" className="me-1 h-4 w-4" aria-hidden="true" />}
          {status === 'closed' && <ClockFadingIcon weight="duotone" className="me-1 h-4 w-4" aria-hidden="true" />}
          {status === 'opening-soon' && (
            <AlarmClockIcon weight="duotone" className="me-1 h-4 w-4" aria-hidden="true" />
          )}
          {status === 'closing-soon' && (
            <ClockAlertIcon weight="duotone" className="me-1 h-4 w-4" aria-hidden="true" />
          )}
          {statusConfig[status].text}
        </Badge>
      )}
    </>
  );
}
