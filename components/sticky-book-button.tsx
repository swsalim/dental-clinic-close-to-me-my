'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { PhoneIcon } from 'lucide-react';

import { useMediaQuery } from '@/lib/hooks/use-media-query';
import { cn } from '@/lib/utils';

import { buttonVariants } from '@/components/ui/button';
import Container from '@/components/ui/container';

export function StickyBookButton({ phone }: { phone: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const { isMobile } = useMediaQuery();

  useEffect(() => {
    if (!isMobile) return; // Only observe on mobile

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(!entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: '0px 0px 0px 0px', // Only trigger when button is actually out of view
      },
    );

    const target = document.querySelector('#book-appointment-button');
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [isMobile]); // Re-run when isMobile changes

  if (!isMobile) return null; // Don't render on desktop

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 transform border-t border-gray-200 bg-white p-4 shadow-2xl transition-transform duration-300 dark:border-gray-800 dark:bg-gray-950',
        isVisible ? 'translate-y-0' : 'translate-y-full',
      )}>
      <Container>
        <Link
          href={`tel:${phone}`}
          className={cn(
            buttonVariants({ variant: 'primary' }),
            'flex w-full items-center justify-center gap-x-3',
          )}>
          <PhoneIcon className="h-5 w-5" /> Book Appointment
        </Link>
      </Container>
    </div>
  );
}
