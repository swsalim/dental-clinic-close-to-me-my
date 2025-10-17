import JsonLd from './json-ld';

interface WebsiteJsonLdProps {
  company?: string;
  url?: string;
}

export default function WebsiteJsonLd({
  company = 'Dental Clinics Malaysia',
  url = 'https://www.dentalclinicclosetome.my/',
}: WebsiteJsonLdProps) {
  return (
    <JsonLd id="website-jsonld">
      {{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: company,
        url,
        inLanguage: 'en-US',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${url}search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      }}
    </JsonLd>
  );
}
