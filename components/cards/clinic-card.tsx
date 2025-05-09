'use client';

import Link from 'next/link';

import { MapPinIcon, PhoneIcon } from 'lucide-react';

import { ImageCloudinary } from '@/components/image/image-cloudinary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StarRating } from '@/components/ui/star-rating';

interface ClinicCardProps {
  slug: string;
  name: string;
  address: string;
  phone: string;
  image?: string;
  rating?: number | null;
}

export function ClinicCard({ slug, name, address, phone, image, rating }: ClinicCardProps) {
  return (
    <Link href={`/place/${slug}`} className="block transition-transform hover:scale-[1.02]">
      <Card className="h-full overflow-hidden rounded-2xl" role="article">
        <CardHeader className="relative h-48 overflow-hidden p-0">
          {image && (
            <ImageCloudinary
              src={image}
              alt={name}
              width={400}
              height={300}
              className="h-full w-full object-cover"
              priority={false}
            />
          )}
        </CardHeader>
        <CardContent className="p-6">
          <CardTitle className="mb-2 text-lg leading-tight">{name}</CardTitle>
          {rating !== null && rating !== undefined && (
            <div className="mb-3 flex-shrink-0">
              <StarRating rating={rating} />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <MapPinIcon className="text-brand h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <p className="line-clamp-2 text-sm text-gray-500 dark:text-gray-300">{address}</p>
            </div>
            <div className="flex items-center gap-2">
              <PhoneIcon className="text-brand h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <p className="text-sm text-gray-500 dark:text-gray-300">{phone}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
