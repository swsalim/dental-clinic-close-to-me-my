'use client';

import Link from 'next/link';

import { ClinicHours, ClinicSpecialHours } from '@/types/clinic';
import { AwardIcon, ClockIcon, MapPinIcon, PhoneIcon } from 'lucide-react';

import { ClinicStatus } from '@/components/clinic-status';
import { ImageCloudinary } from '@/components/image/image-cloudinary';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { StarRating } from '@/components/ui/star-rating';

interface ClinicCardHorizontalProps {
  slug: string;
  name: string;
  address: string | null;
  phone: string | null;
  postalCode: string | null;
  state: string | undefined;
  area: string | undefined;
  image?: string;
  isFeatured?: boolean;
  rating?: number | null;
  hours: Partial<ClinicHours>[];
  specialHours: Partial<ClinicSpecialHours>[];
  openOnPublicHolidays: boolean;
  distance?: number;
}

export function ClinicCardHorizontal({
  slug,
  name,
  address,
  phone,
  postalCode,
  state,
  area,
  image,
  isFeatured,
  rating,
  hours,
  specialHours,
  openOnPublicHolidays,
  distance,
}: ClinicCardHorizontalProps) {
  return (
    <Link
      href={`/place/${slug}`}
      className="block transition-transform hover:scale-[1.01] hover:border-none">
      <Card className="overflow-hidden rounded-xl" role="article">
        <CardContent className="p-0">
          <div className="flex h-full">
            {/* Image Section */}
            <div className="relative w-48 flex-shrink-0">
              {image ? (
                <ImageCloudinary
                  src={image}
                  alt={name}
                  width={200}
                  height={150}
                  className="h-full w-full object-cover"
                  priority={false}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <MapPinIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}

              {/* Badges overlay */}
              <div className="absolute left-2 top-2 flex flex-col gap-1">
                {isFeatured && (
                  <Badge variant="brand" className="text-xs">
                    <AwardIcon className="me-1 h-3 w-3" aria-hidden="true" />
                    Featured
                  </Badge>
                )}
                {hours.length === 7 && hours.every((hour) => hour.open_time && hour.close_time) && (
                  <Badge variant="blue" className="text-xs">
                    <ClockIcon className="me-1 h-3 w-3" aria-hidden="true" />
                    Open everyday
                  </Badge>
                )}
                {openOnPublicHolidays && (
                  <Badge variant="gray" className="text-xs">
                    Open on public holidays
                  </Badge>
                )}
              </div>

              {/* Distance badge */}
              {distance && distance > 0 && (
                <div className="absolute bottom-2 left-2">
                  <Badge variant="gray" className="text-xs">
                    {distance.toFixed(1)} km
                  </Badge>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="flex flex-1 flex-col justify-between p-4">
              <div className="space-y-2">
                {/* Title and Rating */}
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold leading-tight text-gray-900 dark:text-gray-100">
                    {name}
                  </h3>
                  <ClinicStatus hours={hours} specialHours={specialHours} />
                </div>

                {/* Rating */}
                {rating !== null && rating !== undefined && (
                  <div className="flex-shrink-0">
                    <StarRating rating={rating} />
                  </div>
                )}

                {/* Address */}
                {address && (
                  <div className="flex items-start gap-2">
                    <MapPinIcon
                      className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand"
                      aria-hidden="true"
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {address}
                      {postalCode && `, ${postalCode}`}
                      {area && `, ${area}`}
                      {state && `, ${state}`}
                    </p>
                  </div>
                )}

                {/* Phone */}
                {phone && (
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="h-4 w-4 flex-shrink-0 text-brand" aria-hidden="true" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">{phone}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
