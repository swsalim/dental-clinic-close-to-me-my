'use client';

import { PhoneIcon } from 'lucide-react';

import { selineTrack } from '@/lib/analytics';
import { buildWhatsAppLink, cn } from '@/lib/utils';

import WhatsApp from '@/components/icons/whatsapp';
import { Button } from '@/components/ui/button';

interface BookAppointmentButtonProps {
  phone: string;
  stateSlug?: string;
  areaSlug?: string;
  clinicSlug: string;
  whatsapp?: string;
}

export function BookAppointmentButton({
  phone,
  stateSlug,
  areaSlug,
  clinicSlug,
  whatsapp,
}: BookAppointmentButtonProps) {
  return (
    <div className="flex w-full flex-row gap-4 lg:flex-col">
      <Button
        id="book-appointment-button"
        onClick={(e) => {
          e.preventDefault();
          try {
            selineTrack(`book_appointment_click_${stateSlug}_${areaSlug}_${clinicSlug}`);
            window.location.href = `tel:${phone}`;
          } catch (error) {
            console.error('Error firing analytics event:', error);
          }
        }}
        variant="primary"
        className={cn('flex w-full items-center gap-x-3')}>
        <PhoneIcon className="h-5 w-5" /> Call Now
      </Button>
      {whatsapp && (
        <Button
          id="book-appointment-whatsapp-button"
          onClick={(e) => {
            e.preventDefault();
            try {
              selineTrack(`book_appointment_whatsapp_click_${stateSlug}_${areaSlug}_${clinicSlug}`);
              window.location.href = buildWhatsAppLink(whatsapp, clinicSlug);
            } catch (error) {
              console.error('Error firing analytics event:', error);
            }
          }}
          variant="primary"
          className={cn('flex w-full items-center gap-x-3 text-white')}>
          <WhatsApp className="h-5 w-5" /> Book Now
        </Button>
      )}
    </div>
  );
}
