'use client';

import Image, { ImageProps } from 'next/image';

import { imageKitLoader } from '@/lib/utils';

interface ImageKitProps extends ImageProps {
  src: string;
  alt: string;
  directory?: string;
  fullBleed?: boolean;
}

export function ImageKit({
  src = 'default-image.jpg',
  alt = 'Default image',
  directory = 'dental-clinics-my',
  width = 400,
  height = 400,
  ...props
}: ImageKitProps) {
  const imageSrc = directory ? `${directory}/${src}` : src;
  return (
    <Image
      loader={imageKitLoader}
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      {...props}
    />
  );
}
