/**
 * Renders one URL per indexable template and checks that its canonical
 * pathname is the page's own pathname.
 *
 * Usage: CHECK_ORIGIN=http://127.0.0.1:3000 node scripts/check-canonicals.mjs
 */
const origin = process.env.CHECK_ORIGIN ?? 'http://127.0.0.1:3000';

const templates = [
  { name: 'home', path: '/' },
  { name: 'browse', path: '/browse' },
  { name: 'guides', path: '/guides' },
  { name: 'guide', path: null, discover: { from: '/guides', pattern: /^\/guides\/[^/]+$/ } },
  { name: 'dentists', path: '/dentists' },
  { name: 'dentist', path: null, discover: { from: '/dentists', pattern: /^\/dentist\/[^/]+$/ } },
  { name: 'state', path: '/selangor' },
  { name: 'state-dentists', path: '/selangor/dentists' },
  { name: 'area', path: '/selangor/klang' },
  { name: 'service', path: '/services/invisalign' },
  {
    name: 'place',
    path: null,
    discover: { from: '/selangor/klang', pattern: /^\/place\/[^/]+$/ },
  },
  { name: 'about', path: '/about' },
  { name: 'submit', path: '/submit' },
  { name: 'advertise', path: '/advertise-with-us' },
];

function pathnameOf(value) {
  const url = new URL(value, origin);
  if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
    return url.pathname.slice(0, -1);
  }
  return url.pathname;
}

function canonicalHrefs(html) {
  const tags = html.match(/<link\b[^>]*>/gi) ?? [];
  return tags
    .filter((tag) => /rel=["']canonical["']/i.test(tag))
    .map((tag) => tag.match(/href=["']([^"']+)["']/i)?.[1])
    .filter(Boolean);
}

function firstMatch(html, pattern) {
  const hrefs = [...html.matchAll(/href=["']([^"']+)["']/gi)].map((match) => match[1]);
  for (const href of hrefs) {
    let path;
    try {
      path = pathnameOf(href);
    } catch {
      continue;
    }
    if (pattern.test(path)) {
      return path;
    }
  }
  return null;
}

async function get(path) {
  const response = await fetch(new URL(path, origin), { redirect: 'manual' });
  const body = response.status >= 300 && response.status < 400 ? '' : await response.text();
  return {
    status: response.status,
    location: response.headers.get('location'),
    body,
  };
}

const failures = [];

for (const template of templates) {
  let path = template.path;
  if (!path && template.discover) {
    const source = await get(template.discover.from);
    if (source.status !== 200) {
      failures.push(
        `${template.name}: ${template.discover.from} returned ${source.status}, cannot discover a sample`,
      );
      continue;
    }
    path = firstMatch(source.body, template.discover.pattern);
    if (!path) {
      failures.push(
        `${template.name}: no link matching ${template.discover.pattern} on ${template.discover.from}`,
      );
      continue;
    }
  }

  const page = await get(path);
  if (page.status !== 200) {
    failures.push(
      `${template.name} ${path}: expected 200, got ${page.status} ${page.location ?? ''}`,
    );
    continue;
  }

  const hrefs = canonicalHrefs(page.body);
  if (hrefs.length !== 1) {
    failures.push(`${template.name} ${path}: expected 1 canonical, found ${hrefs.length}`);
    continue;
  }

  const canonicalPath = pathnameOf(hrefs[0]);
  const expected = pathnameOf(path);
  if (canonicalPath !== expected) {
    failures.push(
      `${template.name} ${path}: canonical ${hrefs[0]} (${canonicalPath}) != ${expected}`,
    );
    continue;
  }

  console.log(`ok ${template.name} ${path} -> ${hrefs[0]}`);
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`FAIL ${failure}`);
  }
  process.exit(1);
}

console.log(`canonicals ok (${templates.length} templates) against ${origin}`);
