# SEO Roast Roadmap: dentalclinicclosetome.my (2026-11-22)

Verdict: Google can crawl the directory. The service pages are the same clinic list with different titles, and state pages open with two invented clinics.

Checked live: `https://www.dentalclinicclosetome.my`. Money pages are state and area listings (`/selangor`, `/selangor/petaling-jaya`) and clinic profiles (`/place/{slug}`). The conversion is a call or WhatsApp, plus the RM249 listing fee at `/submit`.

| # | Tier | Issue | Revenue impact | Fix | Owner | Status |
|---|---|---|---|---|---|---|
| 1 | REVENUE | Service pages are near-duplicates. Live counts: general dentistry 1,800, implants 1,788, orthodontics 1,786, braces 1,781. On `/selangor` the filter says 893 of 906 clinics offer implants. | "Dental implants near me" and "braces near me" cannot rank as different pages, so those searches never become calls. | Retag clinics so a service page lists clinics that actually offer that treatment. Do not put the inflated count in the title until the tags are real. | founder | next |
| 2 | REVENUE | Page 1 of every state listing renders Pearl Dental Studio and Bright Smile Dental in the HTML, with street addresses and phone numbers, marked Sample. At 1366×768 the first real clinic starts below the fold (card top 794px). | Google and a visitor both meet a fake clinic before a real one. | Remove the two placeholders from the server-rendered grid. You asked to keep them as the featured-card example, so this was not deleted in the roast. | founder | waiting on you |
| 3 | REVENUE | `robots.txt` disallowed `/_next` build manifests (`_buildManifest.js`, `_middlewareManifest.js`, `_ssgManifest.js`). | Google renders the page with those files. Blocking them can make the listing look empty. | Dropped those three rules in `next-sitemap.config.js` and `public/robots.txt`. Private paths stay blocked. | agent | shipped in the working tree; live after the next production build |
| 4 | REVENUE | Areas with fewer than 3 clinics are `noindex, follow` but still in `server-sitemap.xml`. Banting (1 clinic) is the example. | Crawl budget keeps hitting pages you already told Google not to index. | `getEmptyLocationPaths` now excludes areas under `MIN_INDEXABLE_AREA_CLINICS` (3), the same cutoff as the page. | agent | shipped in the working tree; live after the next sitemap build |
| 5 | COMPOUNDING | No Ahrefs or Search Console pull in this roast, so the link gap versus clinic directories is unknown. | Cannot tell whether rankings are stuck on links or on rows 1–2. | Pull DR, organic keywords, and clean referring domains for this site and three clinic directories. | founder | next |
| 6 | COMPOUNDING | Every location FAQ repeated "Sunday is day 6 in clinic hours (Monday is 0)." The hero says "Open on weekends" (Selangor 887) while the FAQ still answers Sunday (594). The clinic total matches: title, FAQ, and `/selangor.md` all say 906. | The day-index sentence was identical on every location page. | Removed that sentence. The FAQ still states the Sunday count for that place. | agent | shipped in the working tree |

## What passed

- `robots.txt` is default-allow. It blocks `/dashboard`, `/api`, `/login`, and `/submit/success`. Sitemap URLs return XML. Bingbot is not locked out.
- No locale tree.
- `/no-such-page-xyz` returns 404. State, area, clinic, dentist, and guide routes set `dynamicParams = false`.
- Location pages 4+ are `noindex`. Filtered URLs such as `?hours=open` canonicalize to the clean path and are not in the sitemap.
- `/submit` and `/advertise-with-us` show RM249, RM149, RM89, and RM59 in the HTML. `/llms.txt` includes RM249. GPTBot can read them.
- Homepage links into states. State pages link into areas. Clinic name, address, and phone are text, not icon-only.

## Fluff (ignore until the rows above ship)

- Location H1 says "Dental Clinics in Selangor" while the title includes the count.
- Page 4+ on a state canonicalizes to itself; service page 4+ canonicalizes to page 1.
- Guide and clinic image alt text was not audited.
