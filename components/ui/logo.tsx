import React from 'react';

import { MEDIA } from '@/lib/media-sizes';
import { cn } from '@/lib/utils';

import { MediaImage } from '@/components/image/media-image';

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
        <MediaImage
          src="https://ik.imagekit.io/yuurrific/dental-clinics-my/logos/dental-clinics-my-v2.png"
          alt="Dental Clinics Malaysia"
          width={MEDIA.avatar.width}
          height={MEDIA.avatar.height}
          sizes={MEDIA.avatar.sizes}
          className="h-full w-auto object-contain"
          priority
        />
      </div>
    </>
  );
};

export default Logo;
