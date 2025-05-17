import { type ClassValue, clsx } from 'clsx';
import crypto from 'crypto-js';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(input = '') {
  return process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}${input}`
    : process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}${input}`
      : `${process.env.NEXT_PUBLIC_BASE_URL}${input}`;
}

export function imageKitLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  if (src[0] === '/') src = src.slice(1);
  const params = [`w-${width}`];
  if (quality) {
    params.push(`q-${quality}`);
  }
  const paramsString = params.join(',');
  let urlEndpoint = `https://ik.imagekit.io/${process.env.NEXT_PUBLIC_IMAGEKIT_ID}`;
  if (urlEndpoint[urlEndpoint.length - 1] === '/') {
    urlEndpoint = urlEndpoint.substring(0, urlEndpoint.length - 1);
  }

  return `${urlEndpoint}/${src}?tr=${paramsString}`;
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (error: unknown) {
    console.error('Invalid URL:', error);
    return false;
  }
}

export function getUrlFromString(str: string): string | null {
  if (isValidUrl(str)) return str;
  try {
    if (str.includes('.') && !str.includes(' ')) {
      return new URL(`https://${str}`).toString();
    }
  } catch (error: unknown) {
    console.error('Failed to parse URL:', error);
    return null;
  }
  return null;
}

const normalizeSrc = (src: string): string => {
  return src.startsWith('/') ? src.slice(1) : src;
};

interface CloudinaryLoaderParams {
  src: string;
  width: number;
  quality?: number;
}

export const cloudinaryLoader = ({ src, width, quality }: CloudinaryLoaderParams): string => {
  const params = ['f_auto', 'c_limit', `w_${width}`, `q_${quality || 'auto'}`];

  return `https://res.cloudinary.com/${
    process.env.NEXT_PUBLIC_CLOUDIARY_API_NAME
  }/image/upload/${params.join(',')}/${normalizeSrc(src)}`;
};

export const bypassCloudinaryLoader = ({ src, quality }: CloudinaryLoaderParams): string => {
  const publicId = getCloudinaryPublicId(src);
  const params = ['f_auto', 'c_limit', 'w_1000', `q_${quality || 'auto'}`];

  return `https://res.cloudinary.com/${
    process.env.NEXT_PUBLIC_CLOUDIARY_API_NAME
  }/image/upload/${params.join(',')}/${publicId}`;
};

export function getCloudinaryPublicId(url: string): string | null {
  try {
    // Use a regular expression to match 'dental-clinics-my/' and everything after it
    const match = url.match(/dental-clinics-my\/(.+?)(\.[a-zA-Z]+(\?.*)?)?$/);
    if (match) {
      return 'dental-clinics-my/' + match[1];
    }
  } catch (error) {
    // Handle any errors gracefully
    console.error('Error extracting info:', error);
  }
  return null;
}

export const generateSHA1 = (data: string): string => {
  const hash = crypto.SHA1(data);
  return hash.toString(crypto.enc.Hex);
};

export const generateSignature = (publicId: string, apiSecret: string): string => {
  const timestamp = new Date().getTime();
  return `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
