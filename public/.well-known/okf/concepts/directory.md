---
type: Concept
title: How the directory is organised
description: Clinic, dentist, location and service pages on dentalclinicclosetome.my and what each one shows.
resource: https://www.dentalclinicclosetome.my/browse
tags: [directory, structure]
timestamp: 2026-10-20T02:00:00Z
---

# How the directory is organised

The site has these page types:

- **Clinic pages** at `/place/{slug}`: one page per listed dental clinic, with address, opening hours, contact details, services and ratings. The sitemap lists 1,829 clinic pages (20 October 2026).
- **Dentist pages** at `/dentist/{slug}`: individual dentists. The sitemap lists 197 (20 October 2026).
- **State and city pages** at `/{state}` and `/{state}/{area}`: clinics in that location. See [locations](locations.md).
- **Service pages** at `/services/{service}`: clinics offering a treatment. See [dental services](dental-services.md).
- **Guides** at `/guides`: practical articles on comparing and choosing a clinic.

Clinic data is imported from Google Maps listings and reviewed before going live. Ratings shown are the clinic's public rating; the site does not assess clinical quality.

Every public listing page also has a Markdown version for AI agents: append `.md` to the URL (homepage: `/index.md`). An index of these is at `/llms.txt`.

Related: [overview](../index.md), [clinic listings](clinic-listings.md).
