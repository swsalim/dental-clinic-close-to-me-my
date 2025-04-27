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

interface Clinic {
  name: string;
  url: string;
}

interface PhysicianJsonLdProps {
  name: string;
  photo: string;
  clinic: Clinic;
  specialty: string;
  url: string;
  location: Location;
  coordinate: Coordinate;
  phone: string | undefined | null;
  email: string | undefined | null;
}

export default function PhysicianJsonLd({
  name,
  photo,
  clinic,
  specialty,
  url,
  location,
  coordinate,
  phone,
  email,
}: PhysicianJsonLdProps) {
  return (
    <JsonLd id="physician-jsonld">
      {{
        '@context': 'https://schema.org',
        '@type': 'Physician',
        name,
        image: photo,
        url,
        hospitalAffiliation: {
          '@type': 'Hospital',
          name: clinic.name,
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
          url: clinic.url,
        },
        medicalSpecialty: {
          '@type': 'MedicalSpecialty',
          name: specialty,
        },
        address: {
          '@type': 'PostalAddress',
          addressLocality: location.town,
          addressCountry: location.country,
          postalCode: location.zipcode,
          streetAddress: location.address,
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: coordinate.lat,
          longitude: coordinate.long,
        },
        priceRange: '$$',
        paymentAccepted: 'Cash, Credit Cards, PayNow',
        telephone: phone,
        email,
        smokingAllowed: false,
      }}
    </JsonLd>
  );
}
