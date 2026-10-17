import type { ReactNode } from 'react';

import Link from 'next/link';

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)\s]+\))/g;

export function MarkdownText({ text }: { text: string }) {
  const parts = text.split(INLINE);

  return parts.map((part, index) => {
    if (!part) {
      return null;
    }

    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }

    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) {
      return (
        <GuideLink key={index} href={link[2]}>
          {link[1]}
        </GuideLink>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

function GuideLink({ href, children }: { href: string; children: ReactNode }) {
  if (href.startsWith('/')) {
    return (
      <Link href={href} prefetch={false}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}
