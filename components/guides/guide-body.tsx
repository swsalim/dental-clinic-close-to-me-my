import type { MarkdownBlock } from '@/lib/guides';

import Prose from '@/components/ui/prose';

import { MarkdownText } from './markdown-text';

export function GuideBody({ blocks }: { blocks: MarkdownBlock[] }) {
  return (
    <Prose>
      {blocks.map((block, index) => {
        if (block.type === 'h2') {
          return (
            <h2 key={block.id} id={block.id}>
              {block.text}
            </h2>
          );
        }

        if (block.type === 'h3') {
          return (
            <h3 key={block.id} id={block.id}>
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

        return (
          <p key={`p-${index}`}>
            <MarkdownText text={block.text} />
          </p>
        );
      })}
    </Prose>
  );
}
