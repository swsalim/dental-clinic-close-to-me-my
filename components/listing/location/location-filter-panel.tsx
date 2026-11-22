'use client';

import { useState } from 'react';

import {
  LOCATION_RATING_OPTIONS,
  type LocationAvailabilityCounts,
  type LocationFacets,
  type LocationFilters,
} from '@/lib/listing/location-filters';

import { RatingStars } from '@/components/listing/location/rating-stars';

const SERVICE_PREVIEW = 6;

export function LocationFilterPanel({
  idPrefix,
  facets,
  filters,
  availability,
  onChange,
  showHeading = true,
}: {
  idPrefix: string;
  facets: LocationFacets;
  filters: LocationFilters;
  availability: LocationAvailabilityCounts | null;
  onChange: (next: LocationFilters) => void;
  showHeading?: boolean;
}) {
  const [servicesOpen, setServicesOpen] = useState(false);
  const visibleServices = servicesOpen ? facets.services : facets.services.slice(0, SERVICE_PREVIEW);
  const filtersSelected =
    Boolean(filters.hours) ||
    filters.weekends ||
    Boolean(filters.rating) ||
    filters.services.length > 0 ||
    filters.sort !== 'featured';

  const update = (patch: Partial<LocationFilters>) => {
    onChange({ ...filters, ...patch, page: 1 });
  };

  const toggleService = (slug: string) => {
    const services = filters.services.includes(slug)
      ? filters.services.filter((item) => item !== slug)
      : [...filters.services, slug];
    update({ services });
  };

  return (
    <div>
      {showHeading ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-gray-900 dark:text-gray-50">
            Filter clinics
          </h2>
          {filtersSelected ? (
            <button
              type="button"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
              onClick={() =>
                onChange({
                  ...filters,
                  hours: '',
                  weekends: false,
                  rating: '',
                  services: [],
                  sort: 'featured',
                  page: 1,
                })
              }
            >
              Clear all
            </button>
          ) : null}
        </div>
      ) : filtersSelected ? (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            onClick={() =>
              onChange({
                ...filters,
                hours: '',
                weekends: false,
                rating: '',
                services: [],
                sort: 'featured',
                page: 1,
              })
            }
          >
            Clear all
          </button>
        </div>
      ) : null}

      <div className="flex flex-col gap-6">
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-50">
            Hours
          </legend>
          <div className="flex flex-col gap-2.5">
            <FilterCheck
              id={`${idPrefix}-open`}
              checked={filters.hours === 'open'}
              onChange={() => update({ hours: filters.hours === 'open' ? '' : 'open' })}
              label="Open"
              count={availability?.open ?? null}
            />
            <FilterCheck
              id={`${idPrefix}-closed`}
              checked={filters.hours === 'closed'}
              onChange={() => update({ hours: filters.hours === 'closed' ? '' : 'closed' })}
              label="Closed"
              count={availability?.closed ?? null}
            />
            <FilterCheck
              id={`${idPrefix}-weekends`}
              checked={filters.weekends}
              onChange={() => update({ weekends: !filters.weekends })}
              label="Open on weekends"
              count={facets.weekends}
            />
          </div>
        </fieldset>

        {facets.services.length > 0 ? (
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-50">
              Dental services
            </legend>
            <div className="flex flex-col gap-2.5">
              {visibleServices.map((service) => (
                <FilterCheck
                  key={service.slug}
                  id={`${idPrefix}-service-${service.slug}`}
                  checked={filters.services.includes(service.slug)}
                  onChange={() => toggleService(service.slug)}
                  label={service.name}
                  count={service.count}
                />
              ))}
            </div>
            {facets.services.length > SERVICE_PREVIEW ? (
              <button
                type="button"
                className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                aria-expanded={servicesOpen}
                onClick={() => setServicesOpen((open) => !open)}
              >
                {servicesOpen ? 'Show fewer' : 'Show more'}
              </button>
            ) : null}
          </fieldset>
        ) : null}

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-50">
            Rating
          </legend>
          <div className="flex flex-col gap-2.5">
            {LOCATION_RATING_OPTIONS.map((option) => (
              <label
                key={option.value}
                htmlFor={`${idPrefix}-rating-${option.value}`}
                className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-800 dark:text-gray-100"
              >
                <input
                  id={`${idPrefix}-rating-${option.value}`}
                  type="checkbox"
                  className="size-4 accent-blue-600"
                  checked={filters.rating === option.value}
                  onChange={() =>
                    update({ rating: filters.rating === option.value ? '' : option.value })
                  }
                />
                <RatingStars score={option.score} />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  );
}

function FilterCheck({
  id,
  checked,
  onChange,
  label,
  count,
}: {
  id: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  count: number | null;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-800 dark:text-gray-100"
    >
      <input
        id={id}
        type="checkbox"
        className="size-4 accent-blue-600"
        checked={checked}
        onChange={onChange}
      />
      <span>
        {label}
        {count == null ? null : (
          <span className="text-gray-500 dark:text-gray-400"> ({count.toLocaleString('en-MY')})</span>
        )}
      </span>
    </label>
  );
}
