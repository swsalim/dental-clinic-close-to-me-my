import JsonLd from './json-ld';

interface Location {
  area: string;
  state: string;
  postal_code: string;
  address: string;
}

interface Coordinate {
  lat: number;
  long: number;
}

interface Rating {
  value: number;
  count: number;
}

interface BusinessJsonLdProps {
  name: string | undefined;
  url: string;
  image: string;
  email: string | null | undefined;
  phone: string | null | undefined;
  location: Location;
  coordinate: Coordinate;
  rating: Rating;
  memberOf?: { '@type': string; '@id': string } | null;
  openingHoursSpecification?: {
    '@type': 'OpeningHoursSpecification';
    dayOfWeek: string;
    opens: string;
    closes: string;
  }[];
}

export default function BusinessJsonLd({
  name,
  url,
  image,
  email = 'support@dentalclinicclosetome.my',
  phone,
  location,
  coordinate = { lat: 0, long: 0 },
  rating = { value: 0, count: 0 },
  memberOf = undefined,
  openingHoursSpecification = [],
}: BusinessJsonLdProps) {
  return (
    <JsonLd id="business-jsonld">
      {{
        '@context': 'https://schema.org',
        '@type': 'Dentist',
        name,
        '@id': url,
        image,
        address: {
          '@type': 'PostalAddress',
          addressLocality: location.area,
          addressRegion: location.state,
          postalCode: location.postal_code,
          streetAddress: location.address,
          addressCountry: 'MY',
        },
        areaServed: {
          '@type': 'Place',
          name: location.area,
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: coordinate.lat,
          longitude: coordinate.long,
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: String(rating.value),
          reviewCount: String(rating.count),
        },
        telephone: phone,
        email,
        url,
        smokingAllowed: false,
        medicalSpecialty: 'Dentistry',
        ...(memberOf && { memberOf }),
        ...(openingHoursSpecification.length > 0 && { openingHoursSpecification }),
      }}
    </JsonLd>
  );
}
