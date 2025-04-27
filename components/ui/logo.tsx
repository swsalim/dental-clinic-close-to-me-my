import React from 'react';

import { cn } from '@/lib/utils';

import { ImageKit } from '@/components/image/image-kit';

const Logo: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <>
      <span className="sr-only">Dental Clinics</span>
      <div
        className={cn(
          'relative flex h-8 w-8 items-center justify-center sm:h-10 sm:w-10',
          className,
        )}
        aria-hidden="true"
        {...props}>
        <ImageKit
          src="logos/dental-clinics-my.png"
          alt="Dental Clinics Malaysia"
          width={40}
          height={40}
          className="h-full w-auto object-contain"
          priority
        />
      </div>
    </>
  );
};

export default Logo;
