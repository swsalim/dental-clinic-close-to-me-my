'use client';

import Image, { type ImageProps } from 'next/image';

import { imageKitLoader, isImageKitSrc } from '@/lib/imagekit-loader';
import { getImageKitId } from '@/lib/imagekit-url';
import { MEDIA } from '@/lib/media-sizes';

interface MediaImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  alt: string;
  /** Optional path prefix under the ImageKit account (when src is not absolute). */
  directory?: string | null;
}

function resolveSrc(src: string, directory?: string | null): string {
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')) {
    return src;
  }

  const id = getImageKitId();
  const prefix = directory ? `${directory.replace(/\/$/, '')}/` : '';
  return `https://ik.imagekit.io/${id}/${prefix}${src.replace(/^\//, '')}`;
}

/**
 * Generic next/image wrapper.
 * ImageKit URLs use the ImageKit loader (`tr=`) instead of Vercel optimization.
 * Prefer presets from `@/lib/media-sizes` at call sites.
 */
export function MediaImage({
  src = 'placeholder.jpg',
  alt = 'Image',
  directory = null,
  width = MEDIA.gallery.width,
  height = MEDIA.gallery.height,
  fill,
  ...props
}: MediaImageProps) {
  const imageSrc = resolveSrc(src, directory);
  const useImageKit = isImageKitSrc(imageSrc);
  const loaderProps = useImageKit ? { loader: imageKitLoader } : {};

  if (fill) {
    return <Image src={imageSrc} alt={alt} fill {...props} {...loaderProps} />;
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      {...props}
      {...loaderProps}
    />
  );
}
