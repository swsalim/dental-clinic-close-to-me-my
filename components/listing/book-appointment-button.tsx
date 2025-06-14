'use client';

import { PhoneIcon } from 'lucide-react';

import { saEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';

interface BookAppointmentButtonProps {
  phone: string;
  stateSlug?: string;
  areaSlug?: string;
  clinicSlug: string;
}

export function BookAppointmentButton({
  phone,
  stateSlug,
  areaSlug,
  clinicSlug,
}: BookAppointmentButtonProps) {
  return (
    <Button
      id="book-appointment-button"
      onClick={(e) => {
        e.preventDefault();
        // console.log('hello');
        // console.log('Button clicked, firing analytics event...');
        try {
          saEvent(`book_appointment_click_${stateSlug}_${areaSlug}_${clinicSlug}`);
          console.log('Analytics event fired successfully');
          window.location.href = `tel:${phone}`;
        } catch (error) {
          console.error('Error firing analytics event:', error);
        }
      }}
      variant="primary"
      className={cn('flex items-center gap-x-3')}>
      <PhoneIcon className="h-5 w-5" /> Book Appointment 123
    </Button>
  );
}
