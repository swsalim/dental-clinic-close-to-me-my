import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildLocationFacets,
  filterLocationClinics,
  hasActiveLocationFilters,
  locationFilterHref,
  paginateClinics,
  parseLocationFilters,
  type IndexClinic,
} from './location-filters';

function clinic(overrides: Partial<IndexClinic> = {}): IndexClinic {
  return {
    slug: 'clinic',
    name: 'Clinic',
    address: '1 Jalan Test',
    neighborhood: '',
    city: 'Kepong',
    phone: '03',
    postalCode: '52100',
    state: 'Selangor',
    area: 'Kepong',
    image: null,
    rating: 4.2,
    isFeatured: false,
    hours: [],
    specialHours: [],
    openOnPublicHolidays: false,
    hasSundayHours: false,
    hasWhatsapp: false,
    serviceSlugs: [],
    modifiedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('location filter query', () => {
  it('round-trips the filters that change the listing', () => {
    const parsed = parseLocationFilters(
      new URLSearchParams(
        'q=smile&sunday=1&whatsapp=1&rating=4.5&service=braces&service=implants&sort=rating&page=2',
      ),
    );

    assert.equal(hasActiveLocationFilters(parsed), true);
    assert.equal(locationFilterHref('/selangor', parsed),
      '/selangor?q=smile&sunday=1&whatsapp=1&rating=4.5&service=braces&service=implants&sort=rating&page=2',
    );
  });

  it('drops the page param when no filter is selected', () => {
    const filters = parseLocationFilters(new URLSearchParams('page=3'));
    assert.equal(hasActiveLocationFilters(filters), false);
    assert.equal(locationFilterHref('/selangor', filters), '/selangor');
  });
});

describe('location clinic filtering', () => {
  const clinics = [
    clinic({
      slug: 'sunday-whatsapp',
      name: 'Sunday Smile',
      rating: 4.6,
      hasSundayHours: true,
      hasWhatsapp: true,
      serviceSlugs: ['braces'],
      isFeatured: true,
      modifiedAt: '2026-02-01T00:00:00.000Z',
    }),
    clinic({
      slug: 'implants',
      name: 'Implant Care',
      rating: 3.4,
      serviceSlugs: ['dental-implants'],
      modifiedAt: '2026-03-01T00:00:00.000Z',
    }),
    clinic({
      slug: 'both',
      name: 'Kepong Family',
      city: 'Kuala Lumpur',
      rating: 4.1,
      hasWhatsapp: true,
      serviceSlugs: ['braces', 'dental-implants'],
      modifiedAt: '2026-01-15T00:00:00.000Z',
    }),
  ];

  it('matches a clinic that offers any selected service', () => {
    const matched = filterLocationClinics(clinics, {
      ...parseLocationFilters(new URLSearchParams()),
      services: ['braces', 'dental-implants'],
    });

      assert.deepEqual(
        matched.map((item) => item.slug),
        ['sunday-whatsapp', 'implants', 'both'],
      );
  });

  it('applies Sunday hours, WhatsApp, rating, and name search together', () => {
    const matched = filterLocationClinics(clinics, {
      ...parseLocationFilters(
        new URLSearchParams('sunday=1&whatsapp=1&rating=4.5&q=smile&sort=rating'),
      ),
    });

    assert.deepEqual(
      matched.map((item) => item.slug),
      ['sunday-whatsapp'],
    );
  });

  it('sorts by rating with unrated clinics last', () => {
    const clinicsToSort = [
      clinic({ slug: 'none', name: 'A', rating: null }),
      clinic({ slug: 'low', name: 'B', rating: 3 }),
      clinic({ slug: 'high', name: 'C', rating: 4.9 }),
    ];

    const highToLow = filterLocationClinics(clinicsToSort, {
      ...parseLocationFilters(new URLSearchParams('sort=rating')),
    });
    const lowToHigh = filterLocationClinics(clinicsToSort, {
      ...parseLocationFilters(new URLSearchParams('sort=rating-asc')),
    });

    assert.deepEqual(
      highToLow.map((item) => item.slug),
      ['high', 'low', 'none'],
    );
    assert.deepEqual(
      lowToHigh.map((item) => item.slug),
      ['low', 'high', 'none'],
    );
  });

  it('sorts names from Z to A', () => {
    const matched = filterLocationClinics(
      [
        clinic({ slug: 'a', name: 'Alpha' }),
        clinic({ slug: 'c', name: 'Cedar' }),
        clinic({ slug: 'b', name: 'Birch' }),
      ],
      { ...parseLocationFilters(new URLSearchParams('sort=name-desc')) },
    );

    assert.deepEqual(
      matched.map((item) => item.slug),
      ['c', 'b', 'a'],
    );
  });

  it('counts facets from the full location, then paginates the filtered set', () => {
    const facets = buildLocationFacets(
      clinics,
      new Map([
        ['braces', 'Braces'],
        ['dental-implants', 'Dental implants'],
      ]),
    );

    assert.equal(facets.total, 3);
    assert.equal(facets.sunday, 1);
    assert.equal(facets.whatsapp, 2);
    assert.equal(facets.ratings['4.5'], 1);
    assert.equal(facets.ratings['4'], 2);
    assert.equal(facets.averageRating, 4);
    assert.deepEqual(
      facets.services.map((service) => service.slug),
      ['braces', 'dental-implants'],
    );

    const page = paginateClinics(clinics, 2, 2);
    assert.equal(page.page, 2);
    assert.equal(page.totalPages, 2);
    assert.equal(page.clinics.length, 1);
  });
});
