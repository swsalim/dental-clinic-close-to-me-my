import fs from 'fs';
import path from 'path';

export type GuideFaq = {
  question: string;
  answer: string;
};

export type GuideLink = {
  href: string;
  label: string;
  description?: string;
};

export type GuideHeading = {
  id: string;
  text: string;
};

export type MarkdownBlock =
  | { type: 'h2'; id: string; text: string }
  | { type: 'h3'; id: string; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] };

export type Guide = {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  updatedAt: string;
  image: string;
  imageAlt: string;
  primaryKeyword: string;
  summary: string[];
  faq: GuideFaq[];
  relatedLinks: GuideLink[];
  relatedSlugs: string[];
  body: string;
  blocks: MarkdownBlock[];
  headings: GuideHeading[];
  wordCount: number;
  readingTimeMinutes: number;
};

const GUIDES_DIR = path.join(process.cwd(), 'content/guides');

/** Featured guide first, then the rest of the index. */
const GUIDE_ORDER = [
  'the-complete-guide-to-finding-and-comparing-a-dental-clinic',
  'how-to-find-a-nearby-dentist-clinic-that-fits-your-needs',
  'dental-clinic-open-now-common-questions-about-urgent-visits',
];

const WORDS_PER_MINUTE = 200;

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function unquote(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).replace(/\\"/g, '"');
  }
  return trimmed;
}

function splitKey(line: string): { key: string; value: string | null } {
  const index = line.indexOf(':');
  if (index === -1) {
    throw new Error(`Invalid guide frontmatter line: ${line}`);
  }
  const key = line.slice(0, index).trim();
  const rest = line.slice(index + 1).trim();
  return { key, value: rest === '' ? null : unquote(rest) };
}

function parseFrontmatter(source: string): Record<string, unknown> {
  const lines = source.split('\n');
  const data: Record<string, unknown> = {};
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }
    if (line.startsWith(' ')) {
      throw new Error(`Unexpected indent in guide frontmatter: ${line}`);
    }

    const { key, value } = splitKey(line);
    if (value !== null) {
      data[key] = value;
      index += 1;
      continue;
    }

    index += 1;
    const items: unknown[] = [];
    while (index < lines.length && lines[index].startsWith('  - ')) {
      const itemLine = lines[index].slice(4);
      const looksLikeObject =
        itemLine.includes(':') &&
        !itemLine.trim().startsWith('"') &&
        !itemLine.trim().startsWith("'");

      if (!looksLikeObject) {
        items.push(unquote(itemLine));
        index += 1;
        continue;
      }

      const obj: Record<string, string> = {};
      const first = splitKey(itemLine);
      if (first.value === null) {
        throw new Error(`Guide frontmatter object is missing a value: ${itemLine}`);
      }
      obj[first.key] = first.value;
      index += 1;

      while (index < lines.length && lines[index].startsWith('    ')) {
        const child = splitKey(lines[index].trim());
        if (child.value === null) {
          throw new Error(`Guide frontmatter object is missing a value: ${lines[index]}`);
        }
        obj[child.key] = child.value;
        index += 1;
      }
      items.push(obj);
    }

    data[key] = items;
  }

  return data;
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export function parseMarkdown(body: string): MarkdownBlock[] {
  const lines = body.replace(/\r\n/g, '\n').split('\n');
  const blocks: MarkdownBlock[] = [];
  const used = new Map<string, number>();
  let index = 0;

  const headingId = (text: string) => {
    const base = slugifyHeading(text) || 'section';
    const seen = used.get(base) ?? 0;
    used.set(base, seen + 1);
    return seen === 0 ? base : `${base}-${seen + 1}`;
  };

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.startsWith('## ')) {
      const text = line.slice(3).trim();
      blocks.push({ type: 'h2', id: headingId(text), text });
      index += 1;
      continue;
    }

    if (line.startsWith('### ')) {
      const text = line.slice(4).trim();
      blocks.push({ type: 'h3', id: headingId(text), text });
      index += 1;
      continue;
    }

    if (line.startsWith('- ')) {
      const items: string[] = [];
      while (index < lines.length && lines[index].startsWith('- ')) {
        items.push(lines[index].slice(2).trim());
        index += 1;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s/.test(lines[index])) {
        items.push(lines[index].replace(/^\d+\.\s/, '').trim());
        index += 1;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    const paragraph = [line.trim()];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].startsWith('#') &&
      !lines[index].startsWith('- ') &&
      !/^\d+\.\s/.test(lines[index])
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push({ type: 'p', text: paragraph.join(' ') });
  }

  return blocks;
}

export function countWords(markdown: string): number {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#>*_[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) {
    return 0;
  }

  return text.split(' ').filter(Boolean).length;
}

export function readingTimeMinutes(wordCount: number): number {
  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
}

export function formatGuideDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) {
    return isoDate;
  }
  const month = MONTHS[Number(match[2]) - 1];
  if (!month) {
    return isoDate;
  }
  return `${Number(match[3])} ${month} ${match[1]}`;
}

function requireString(data: Record<string, unknown>, key: string, file: string): string {
  const value = data[key];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${file} is missing frontmatter ${key}`);
  }
  return value.trim();
}

function requireStringList(data: Record<string, unknown>, key: string, file: string): string[] {
  const value = data[key];
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error(`${file} is missing frontmatter ${key}`);
  }
  return value.map((item) => item.trim()).filter(Boolean);
}

function requireFaq(data: Record<string, unknown>, file: string): GuideFaq[] {
  const value = data.faq;
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${file} is missing frontmatter faq`);
  }
  return value.map((item) => {
    if (!item || typeof item !== 'object') {
      throw new Error(`${file} has an invalid faq item`);
    }
    const record = item as Record<string, unknown>;
    if (typeof record.question !== 'string' || typeof record.answer !== 'string') {
      throw new Error(`${file} faq items need question and answer`);
    }
    return { question: record.question.trim(), answer: record.answer.trim() };
  });
}

function requireLinks(data: Record<string, unknown>, file: string): GuideLink[] {
  const value = data.relatedLinks;
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${file} is missing frontmatter relatedLinks`);
  }
  return value.map((item) => {
    if (!item || typeof item !== 'object') {
      throw new Error(`${file} has an invalid relatedLinks item`);
    }
    const record = item as Record<string, unknown>;
    if (typeof record.href !== 'string' || typeof record.label !== 'string') {
      throw new Error(`${file} relatedLinks need href and label`);
    }
    if (!record.href.startsWith('/')) {
      throw new Error(`${file} relatedLinks href must be a site path: ${record.href}`);
    }
    return {
      href: record.href,
      label: record.label.trim(),
      description: typeof record.description === 'string' ? record.description.trim() : undefined,
    };
  });
}

function readGuideFile(filePath: string): Guide {
  const raw = fs.readFileSync(filePath, 'utf8');
  if (!raw.startsWith('---\n')) {
    throw new Error(`${filePath} must start with frontmatter`);
  }
  const end = raw.indexOf('\n---\n', 4);
  if (end === -1) {
    throw new Error(`${filePath} is missing a closing frontmatter marker`);
  }

  const data = parseFrontmatter(raw.slice(4, end));
  const body = raw.slice(end + 5).trim();
  const file = path.basename(filePath);
  const blocks = parseMarkdown(body);
  const headings = blocks
    .filter((block): block is Extract<MarkdownBlock, { type: 'h2' }> => block.type === 'h2')
    .map((block) => ({ id: block.id, text: block.text }));
  const wordCount = countWords(body);
  const slug = requireString(data, 'slug', file);

  if (slug !== file.replace(/\.mdx?$/, '')) {
    throw new Error(`${file} slug does not match the filename`);
  }

  const summary = requireStringList(data, 'summary', file);
  if (summary.length < 3 || summary.length > 5) {
    throw new Error(`${file} summary must contain 3 to 5 bullets`);
  }

  return {
    title: requireString(data, 'title', file),
    description: requireString(data, 'description', file),
    slug,
    publishedAt: requireString(data, 'publishedAt', file),
    updatedAt: requireString(data, 'updatedAt', file),
    image: requireString(data, 'image', file),
    imageAlt: requireString(data, 'imageAlt', file),
    primaryKeyword: requireString(data, 'primaryKeyword', file),
    summary,
    faq: requireFaq(data, file),
    relatedLinks: requireLinks(data, file),
    relatedSlugs: Array.isArray(data.relatedSlugs)
      ? data.relatedSlugs.filter((item): item is string => typeof item === 'string')
      : [],
    body,
    blocks,
    headings,
    wordCount,
    readingTimeMinutes: readingTimeMinutes(wordCount),
  };
}

export function getAllGuides(): Guide[] {
  const files = fs
    .readdirSync(GUIDES_DIR)
    .filter((file) => file.endsWith('.md') || file.endsWith('.mdx'));

  const guides = files.map((file) => readGuideFile(path.join(GUIDES_DIR, file)));
  guides.sort((a, b) => {
    const aIndex = GUIDE_ORDER.indexOf(a.slug);
    const bIndex = GUIDE_ORDER.indexOf(b.slug);
    return (
      (aIndex === -1 ? GUIDE_ORDER.length : aIndex) - (bIndex === -1 ? GUIDE_ORDER.length : bIndex)
    );
  });

  return guides;
}

export function getGuide(slug: string): Guide | undefined {
  return getAllGuides().find((guide) => guide.slug === slug);
}

export function getRelatedGuides(guide: Guide): Guide[] {
  const all = getAllGuides();
  const picked = guide.relatedSlugs
    .map((slug) => all.find((item) => item.slug === slug))
    .filter((item): item is Guide => Boolean(item));

  if (picked.length > 0) {
    return picked;
  }

  return all.filter((item) => item.slug !== guide.slug);
}

export function getGuidesIndexLastmod(): string {
  const dates = getAllGuides().map((guide) => guide.updatedAt);
  return dates.sort().at(-1) ?? '2026-10-17';
}
