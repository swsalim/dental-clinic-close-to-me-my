import JsonLd from './json-ld';

interface Location {
  town: string;
  country: string;
  zipcode: string;
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
  name: string;
  category: string;
  url: string;
  image: string;
  email: string | null;
  phone: string | null | undefined;
  location: Location;
  coordinate: Coordinate;
  rating: Rating;
  memberOf?: { '@type': string; '@id': string } | null;
}

type BusinessType = 'MedicalClinic' | 'LocalBusiness' | 'EmergencyService';
type MedicalSpecialty =
  | 'Dentistry'
  | 'PrimaryCare'
  | 'Pediatric'
  | 'Dermatology'
  | 'TraditionalMedicine'
  | 'Emergency'
  | 'FamilyMedicine';

export default function BusinessJsonLd({
  name,
  category,
  url,
  image,
  email,
  phone,
  location,
  coordinate,
  rating,
  memberOf,
}: BusinessJsonLdProps) {
  const businessType = getBusinessType(category);
  const medicalSpecialty = getMedicalSpecialty(category);

  return (
    <JsonLd id="business-jsonld">
      {{
        '@context': 'https://schema.org',
        '@type': businessType,
        name,
        '@id': url,
        image,
        address: {
          '@type': 'PostalAddress',
          addressLocality: location.town,
          addressCountry: location.country,
          postalCode: location.zipcode,
          streetAddress: location.address,
        },
        areaServed: {
          '@type': 'Place',
          name: location.town,
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
        priceRange: '$$',
        paymentAccepted: 'Cash, Credit Cards, PayNow',
        telephone: phone,
        email,
        url,
        smokingAllowed: false,
        medicalSpecialty,
        ...(memberOf && { memberOf }),
      }}
    </JsonLd>
  );
}

function getBusinessType(categoryName: string): BusinessType[] {
  switch (categoryName) {
    case '24-hour Clinic':
    case 'Accident & Emergency':
      return ['MedicalClinic', 'LocalBusiness', 'EmergencyService'];
    default:
      return ['MedicalClinic', 'LocalBusiness'];
  }
}

function getMedicalSpecialty(categoryName: string): MedicalSpecialty | MedicalSpecialty[] {
  switch (categoryName) {
    case 'Dental':
      return 'Dentistry';
    case 'General Practitioner':
    case 'Hospital':
      return 'PrimaryCare';
    case 'Paediatric':
      return ['PrimaryCare', 'Pediatric'];
    case 'Aesthetic':
      return 'Dermatology';
    case 'Chinese Physician':
      return 'TraditionalMedicine';
    case '24-hour Clinic':
      return ['PrimaryCare', 'Emergency', 'FamilyMedicine'];
    default:
      return 'PrimaryCare';
  }
}
