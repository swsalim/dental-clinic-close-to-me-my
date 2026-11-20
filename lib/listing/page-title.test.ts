import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isAdminUser } from '../auth/is-admin';
import {
  buildClinicDescription,
  buildClinicTitle,
  countedPlaceTitle,
  listingMetaTitle,
  paginatedTitle,
  serviceListingDescription,
  TITLE_MAX_LENGTH,
} from './page-title';

const base = {
  hasMap: true,
  hasReviews: true,
  hasServices: true,
};

describe('buildClinicTitle', () => {
  it('uses the clinic name, area, rating, and hours only when each exists', () => {
    const title = buildClinicTitle({
      name: 'Lay Dental Clinic',
      areaName: 'Mont Kiara',
      hasHours: true,
      rating: 5,
      reviewCount: 170,
    });

    assert.equal(title, 'Lay Dental Clinic, Mont Kiara · 5.0/5 (170 reviews) · Hours');
    assert.ok(title.length <= TITLE_MAX_LENGTH);
    assert.match(title, /Hours/);
    assert.match(title, /5\.0\/5/);
    assert.match(title, /170/);
  });

  it('omits hours, rating, and review count when the clinic has none', () => {
    const title = buildClinicTitle({
      name: 'Quiet Dental',
      areaName: 'Klang',
      hasHours: false,
      rating: null,
      reviewCount: 0,
    });

    assert.equal(title, 'Quiet Dental, Klang');
    assert.doesNotMatch(title, /Hours|review|\/5/i);
  });

  it('keeps a rating when hours would push the title past 60 characters', () => {
    const title = buildClinicTitle({
      name: 'Fong & Goh Dental Surgery',
      areaName: 'Bukit Bintang',
      hasHours: true,
      rating: 4.9,
      reviewCount: 52,
    });

    assert.equal(title, 'Fong & Goh Dental Surgery, Bukit Bintang · 4.9/5 (52)');
    assert.ok(title.length <= TITLE_MAX_LENGTH);
    assert.doesNotMatch(title, /Hours/);
  });

  it('does not repeat an area that is already in the name, and falls back to the city', () => {
    const withAreaInName = buildClinicTitle({
      name: 'SMILE 28 Dental Clinic @ Kota Damansara',
      areaName: 'Petaling Jaya',
      hasHours: true,
      rating: 4.9,
      reviewCount: 351,
    });
    assert.equal(withAreaInName, 'SMILE 28 Dental Clinic @ Kota Damansara, Petaling Jaya');
    assert.ok(withAreaInName.length <= TITLE_MAX_LENGTH);

    const cityOnly = buildClinicTitle({
      name: 'Harbour Dental',
      cityName: 'Klang',
      hasHours: false,
      rating: 4.2,
      reviewCount: 8,
    });
    assert.equal(cityOnly, 'Harbour Dental, Klang · 4.2/5 (8 reviews)');
  });

  it('mentions hours without inventing a rating', () => {
    const title = buildClinicTitle({
      name: 'Klinik Pergigian YY',
      areaName: 'Johor Bahru',
      hasHours: true,
    });

    assert.equal(title, 'Klinik Pergigian YY, Johor Bahru · Hours');
    assert.doesNotMatch(title, /\/5|review/i);
  });
});

describe('buildClinicDescription', () => {
  it('mentions opening hours only when the clinic has them', () => {
    const withHours = buildClinicDescription({
      ...base,
      name: 'Lay Dental Clinic',
      areaName: 'Mont Kiara',
      stateName: 'Federal Territory of Kuala Lumpur',
      hasHours: true,
      rating: 5,
      reviewCount: 170,
    });
    assert.match(withHours, /opening hours/);
    assert.match(withHours, /Rated 5\.0\/5 from 170 reviews/);
    assert.ok(withHours.length <= 160);

    const withoutHours = buildClinicDescription({
      ...base,
      name: 'Lay Dental Clinic',
      areaName: 'Mont Kiara',
      stateName: 'Federal Territory of Kuala Lumpur',
      hasHours: false,
      rating: 5,
      reviewCount: 170,
    });
    assert.doesNotMatch(withoutHours, /hour/i);
    assert.match(withoutHours, /Rated 5\.0\/5 from 170 reviews/);
  });

  it('keeps opening hours when a long state name would otherwise crowd them out', () => {
    const description = buildClinicDescription({
      ...base,
      name: 'Fong & Goh Dental Surgery',
      areaName: 'Bukit Bintang',
      stateName: 'Federal Territory of Kuala Lumpur',
      hasHours: true,
      rating: 4.9,
      reviewCount: 52,
    });

    assert.match(description, /opening hours/);
    assert.match(description, /Bukit Bintang/);
    assert.ok(description.length <= 160);
  });

  it('does not invent a location or a rating', () => {
    const description = buildClinicDescription({
      ...base,
      name: 'Harbour Dental',
      hasHours: false,
      hasMap: false,
      hasReviews: false,
      hasServices: false,
      rating: 0,
      reviewCount: null,
    });

    assert.equal(description, 'Harbour Dental is a dental clinic in Malaysia. See contact details.');
    assert.doesNotMatch(description, /undefined|null|Rated|opening hours/i);
  });
});

describe('service listing description', () => {
  it('compares hours and contact details without a booking claim', () => {
    assert.equal(
      serviceListingDescription('Invisalign'),
      'Compare dental clinics offering Invisalign: hours, services and contact details.',
    );
    assert.match(
      serviceListingDescription('Orthodontics', 'Braces, aligners, and bite correction.'),
      /^Compare dental clinics offering Orthodontics: braces, aligners, and bite correction\. Compare hours, services, and contact details\.$/,
    );
    assert.doesNotMatch(
      serviceListingDescription('Invisalign', 'Clear aligners.'),
      /book appointments online/i,
    );
  });
});

describe('counted place titles', () => {
  it('uses the singular when the count is 1', () => {
    assert.equal(countedPlaceTitle(1, 'Dental Clinic', 'Pendang, Kedah'), '1 Dental Clinic in Pendang, Kedah');
    assert.equal(countedPlaceTitle(101, 'Dental Clinic', 'Klang, Selangor'), '101 Dental Clinics in Klang, Selangor');
    assert.equal(countedPlaceTitle(1, 'Dentist', 'Selangor'), '1 Dentist in Selangor');
    assert.equal(countedPlaceTitle(197, 'Dentist', 'Malaysia'), '197 Dentists in Malaysia');
  });
});

describe('paginated listing titles', () => {
  it('leaves page 1 unchanged and leads page 2+ with the page number', () => {
    const baseTitle = '101 Dental Clinics in Klang, Selangor';
    assert.equal(paginatedTitle(baseTitle, 1, 6), baseTitle);

    const page3 = paginatedTitle(baseTitle, 3, 6);
    assert.equal(page3, 'Page 3 of 6: 101 Dental Clinics in Klang, Selangor');
    assert.ok(page3.length <= TITLE_MAX_LENGTH);
    assert.deepEqual(listingMetaTitle(page3, 3), { absolute: page3 });
    assert.equal(listingMetaTitle(baseTitle, 1), baseTitle);
  });

  it('shortens a long area title without dropping the page number', () => {
    const page2 = paginatedTitle('21 Dental Clinics in Telok Panglima Garang, Selangor', 2, 2);
    assert.equal(page2, 'Page 2: 21 Dental Clinics in Telok Panglima Garang, Selangor');
    assert.ok(page2.length <= TITLE_MAX_LENGTH);
  });
});

describe('isAdminUser', () => {
  it('matches the allow-list case-insensitively and fails closed', () => {
    const allow = ' Owner@Example.com, other@example.com ';
    assert.equal(isAdminUser('owner@example.com', allow), true);
    assert.equal(isAdminUser('other@example.com', allow), true);
    assert.equal(isAdminUser('stranger@example.com', allow), false);
    assert.equal(isAdminUser('owner@example.com', ''), false);
    assert.equal(isAdminUser(null, allow), false);
    assert.equal(isAdminUser(undefined, undefined), false);
  });
});
