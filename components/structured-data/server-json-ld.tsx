type JsonLdData = {
  '@context': 'https://schema.org';
  '@type': string | string[];
  [key: string]: unknown;
};

/**
 * Server-rendered JSON-LD. A plain script element, so the payload is in the
 * HTML response rather than injected by next/script.
 */
export default function ServerJsonLd({ id, data }: { id: string; data: JsonLdData }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
