import JsonLd from './json-ld';

interface WebsiteJsonLdProps {
  company: string | undefined;
  url: string | undefined;
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
      }}
    </JsonLd>
  );
}
