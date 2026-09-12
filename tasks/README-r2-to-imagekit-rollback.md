# R2 → ImageKit reverse migration (aesthetic replication)

Copy of the dental runbook deltas for **aesthetic-clinics-my**. Keep `r2_*` columns; leave R2 libs until a later cleanup pass.

## Project mapping

| | dental-clinic-close-to-me-my | aesthetic-clinics-my |
|--|--|--|
| ImageKit folder root | `dental-clinics-my` | `aesthetic-clinics-my` |
| Clinic folder | `{root}/places` | `{root}/places` |
| Doctor folder | `{root}/persons` | `{root}/persons` |
| Area/state folder | `{root}/location` | `{root}/location` |
| Env folder override | `NEXT_PUBLIC_IMAGEKIT_FOLDER_ROOT` (optional; default dental) | set to `aesthetic-clinics-my` for backfill script |
| Media CDN (R2) | `media.dentalclinicclosetome.my` | `media.aestheticclinics.my` |
| R2 bucket | `dental-clinic-media-production` | `aesthetic-clinic-media-production` |

## Scripts to copy from dental

1. `tasks/backfill-imagekit-from-r2.ts` — set `NEXT_PUBLIC_IMAGEKIT_FOLDER_ROOT=aesthetic-clinics-my` (or change default)
2. `tasks/delete-r2-assets.ts`
3. `lib/upload-imagekit-client.ts` — update folder type union / defaults to aesthetic paths
4. `lib/imagekit-url.ts`

## npm scripts

```bash
"backfill-imagekit": "tsx ./tasks/backfill-imagekit-from-r2.ts"
"backfill-imagekit:sample": "tsx ./tasks/backfill-imagekit-from-r2.ts --sample"
"delete-r2-assets": "tsx ./tasks/delete-r2-assets.ts"
```

## Safe order (same as dental)

```text
1. Confirm new ImageKit env (.env.local)
2. Spot-check one static URL with the NEW ImageKit id
3. npm run backfill-imagekit:sample → verify → npm run backfill-imagekit -- --execute
4. Flip app code: resolveMediaUrl ImageKit-first; forms → /api/upload-imagekit
5. Replace hardcoded old ImageKit ids in static URLs via imageKitUrl()
6. Smoke-test listings + dashboard upload/delete
7. npm run delete-r2-assets → then --execute
8. Later: remove unused R2 libs/routes/deps
```

## Code restore checklist (aesthetic)

- [ ] `lib/media.ts` — prefer `image_url` / `image` before `r2_url`
- [ ] `lib/clinic-images.ts` — insert `image_url` + `imagekit_file_id`
- [ ] Forms: clinic / doctor / area / state / submit → ImageKit folders under `aesthetic-clinics-my/...`
- [ ] `tasks/insert-apify-data.ts` → `/api/upload-imagekit`
- [ ] Hardcoded `ik.imagekit.io/<old-id>/...` → `imageKitUrl(...)`
- [ ] Leave `r2_*` columns and R2 API routes until after verify + delete-r2-assets

## Verify

Automated checks after dental backfill (2026-09-12):

| Table | R2 rows | ImageKit URLs | Missing file id |
|--|--|--|--|
| clinic_images | 9152 | 9152 | 0 |
| clinic_doctor_images | 197 | 197 | 0 |
| areas | 8 | 8 | 0 |
| states | 16 | 16 | 0 |

Manual UI checklist:

- [ ] Listing cards load from `ik.imagekit.io/<new-id>/...`
- [ ] Dashboard upload writes ImageKit columns
- [ ] Dashboard delete calls `/api/delete-imagekit`
- [ ] Logo / placeholders load on new account

After UI verify, run R2 cleanup:

```bash
npm run delete-r2-assets
npm run delete-r2-assets -- --execute
```
