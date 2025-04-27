'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';

interface TruncatedTextProps {
  text: string;
  limit?: number;
}

export function TruncatedText({ text, limit = 50 }: TruncatedTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const words = text.split(' ');
  const isTextLong = words.length > limit;
  const displayText = isExpanded ? text : words.slice(0, limit).join(' ');

  if (!isTextLong) {
    return <p className="my-0">{text}</p>;
  }

  return (
    <div className="space-y-2">
      <p className="my-0">
        {displayText}
        {!isExpanded && '...'}
      </p>
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-auto px-0 text-blue-800 hover:bg-transparent hover:text-blue-600">
        {isExpanded ? 'Show less' : 'Show more'}
      </Button>
    </div>
  );
}
