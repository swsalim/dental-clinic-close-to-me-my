'use client';

import { CarIcon } from 'lucide-react';

import { selineTrack } from '@/lib/analytics';

import { Button } from '../ui/button';

export function GetDirectionButton({ clinicSlug, name }: { clinicSlug: string; name: string }) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      selineTrack(`get_directions_click_${clinicSlug}`);
      window.location.href = `https://www.google.com/maps/search/?api=1&query=${name}`;
    } catch (error) {
      console.error('Error firing analytics event:', error);
    }
  };

  return (
    <Button
      variant="outline"
      className="flex flex-grow-0 items-center justify-center gap-x-2 p-3 text-blue-500 hover:text-blue-400 dark:text-blue-300 dark:hover:text-blue-400"
      onClick={handleClick}>
      <CarIcon className="h-5 w-5" /> Get Directions
    </Button>
  );
}
