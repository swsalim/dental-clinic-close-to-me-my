import Image from 'next/image';

import { GUIDE_IMAGE_HEIGHT, GUIDE_IMAGE_WIDTH, type MarkdownBlock } from '@/lib/guides';

import Prose from '@/components/ui/prose';

import { MarkdownText } from './markdown-text';

export function GuideBody({ blocks }: { blocks: MarkdownBlock[] }) {
  return (
    <Prose>
      {blocks.map((block, index) => {
        if (block.type === 'h2') {
          return (
            <h2 key={block.id} id={block.id} className="!scroll-mt-36 normal-case lg:!scroll-mt-28">
              {block.text}
            </h2>
          );
        }

        if (block.type === 'img') {
          return (
            <Image
              key={`${block.src}-${index}`}
              src={block.src}
              alt={block.alt}
              width={GUIDE_IMAGE_WIDTH}
              height={GUIDE_IMAGE_HEIGHT}
              loading="lazy"
              decoding="async"
              className="my-6 h-auto w-full rounded-lg border border-gray-200 dark:border-gray-800"
            />
          );
        }

        if (block.type === 'h3') {
          return (
            <h3 key={block.id} id={block.id} className="!scroll-mt-36 normal-case lg:!scroll-mt-28">
              {block.text}
            </h3>
          );
        }

        if (block.type === 'ul' || block.type === 'ol') {
          const List = block.type === 'ul' ? 'ul' : 'ol';
          return (
            <List key={`${block.type}-${index}`}>
              {block.items.map((item) => (
                <li key={item}>
                  <MarkdownText text={item} />
                </li>
              ))}
            </List>
          );
        }

        if (block.type === 'table') {
          return (
            <div key={`table-${index}`} className="overflow-x-auto">
              <table style={{ minWidth: '42rem' }}>
                <thead>
                  <tr>
                    {block.headers.map((header) => (
                      <th key={header}>
                        <MarkdownText text={header} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, rowIndex) => (
                    <tr key={row.join('|') || rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={`${rowIndex}-${cellIndex}`}>
                          <MarkdownText text={cell} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        return (
          <p key={`p-${index}`}>
            <MarkdownText text={block.text} />
          </p>
        );
      })}
    </Prose>
  );
}
