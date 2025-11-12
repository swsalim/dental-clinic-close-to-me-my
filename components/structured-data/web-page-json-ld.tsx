import JsonLd from './json-ld';

interface WebPageJsonLdProps {
  id: string;
  description: string;
  lastReviewed?: string;
  reviewedBy: string | undefined;
}

export default function WebPageJsonLd({
  id,
  description,
  lastReviewed,
  reviewedBy = 'Dental Clinics Malaysia',
}: WebPageJsonLdProps) {
  return (
    <JsonLd id="webpage-jsonld">
      {{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': id,
        description,
        ...(lastReviewed && { lastReviewed }),
        reviewedBy: {
          '@type': 'Person',
          name: reviewedBy,
        },
      }}
    </JsonLd>
  );
}
