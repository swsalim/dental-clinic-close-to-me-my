import React from 'react';

type JsonLdData = {
  '@context': string;
  '@type': string | string[];
  [key: string]: unknown;
};

interface JsonLdProps {
  id: string;
  children: JsonLdData;
}

const JsonLd = ({ id, children }: JsonLdProps): React.ReactElement => {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(children).replace(/</g, '\\u003c'),
      }}
    />
  );
};

export default JsonLd;
