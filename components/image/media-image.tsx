'use client';

import Image, { type ImageProps } from 'next/image';

import { imageKitLoader, isImageKitSrc } from '@/lib/imagekit-loader';
import { MEDIA } from '@/lib/media-sizes';
import { getR2PublicUrl } from '@/lib/r2-public';

interface MediaImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  alt: string;
  /** Optional key under the public R2 host (when src is not absolute). */
  directory?: string | null;
}

function resolveSrc(src: string, directory?: string | null): string {
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')) {
    return src;
  }

  const publicBase = getR2PublicUrl();
  const prefix = directory ? `${directory.replace(/\/$/, '')}/` : '';
  return `${publicBase}/${prefix}${src.replace(/^\//, '')}`;
}

/**
 * Generic next/image wrapper.
 * ImageKit URLs (static logo / placeholders) use the ImageKit loader.
 * Everything else (R2, local, Cloudinary) uses Vercel Image Optimization.
 * Prefer presets from `@/lib/media-sizes` at call sites.
 */
export function MediaImage({
  src = 'placeholder.jpg',
  alt = 'Image',
  directory = null,
  width = MEDIA.gallery.width,
  height = MEDIA.gallery.height,
  ...props
}: MediaImageProps) {
  const imageSrc = resolveSrc(src, directory);
  const useImageKit = isImageKitSrc(imageSrc);

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      {...props}
      {...(useImageKit ? { loader: imageKitLoader } : {})}
    />
  );
}
