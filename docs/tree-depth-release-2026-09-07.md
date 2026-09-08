# Public map depth 8 — 2026-09-07

## Content and boundaries

The public catalogue grows from 325 to 340 branches; its 47 tribes and existing IDs remain. Maximum depth grows from 6 to 8, with Алаш counted as depth 0. This is reference group membership, not eight verified biological generations.

Fixed new path: Алаш → Орта жүз → Қоңырат → Көтенші → Жаманбай → Құрбан ата → Киікші → Бекбаулы → Қожаберген. Киікші also includes Шегір and Жартыбас. Бекбаулы has three recorded subdivisions, Шегір four. The added Құрбан siblings are Тіней, Жары, Сасық and Көтен.

Primary source: Ж. Бейсенбайұлы, «Шығармалары», III том: «Зерттеулер» (2022), printed pp. 488–489, PDF pages 489–490. The existing [National Academic Library PDF](https://nabrk.kz/FileStore/dataFiles/a3/14/1651251/content/full.pdf?isPortal=true&key=3a2a162549560fec67e4936fe4165e01&time=1758189375816#page=489) was read and the grouping on printed p. 489 visually checked. PDF SHA-256: `0ea06d48f5508cda77228a7066b5636658cd3ff13abd5d26f0790c3dfc93f8f7`.

The source lists Жартыбас with Құрбан subdivisions and then explicitly places it within Киікші by the tradition of shared inheritance. The map follows that membership and carries bilingual notes; it does not duplicate Жартыбас or assert father–son descent. Personal intermediary chains and biographical anecdotes were not imported. This release does not claim to exhaust the book's subdivisions.

The previous on-demand desktop level control and mobile branch navigation are included. Konyrat's editorial date and map sitemap date become September 7; the historical Tumalas structural-audit date remains September 6. No private records, database flags, migrations or payment changes are included.

## Validation

- Unit checks: 13 passed, including the fixed nine-node path, connector count, source note, search and article anchor.
- Content: 47 stable tribes, 340 unique branches, bilingual source-qualified copy.
- TypeScript, production build and runtime genealogy/SEO/analytics checks passed.
- ESLint: zero errors, 13 existing warnings outside the changed code.
- Local source/SSR/API validation and 170-URL sitemap/SEO checks passed.
- All 52 existing RU/KK article/map/search/source journeys passed at 1440/375px.
- Four expanded depth checks passed at both widths in both languages: depth 6 and 8, lazy requests, failed-load retry, cached branches, search/reload, sibling recovery, keyboard and no document overflow.
- Targeted ESLint on all changed code and checks passed without warnings.
- Independent read-only review: no actionable findings; the reviewer checked the source PDF, all 15 names, membership placement, dates and six-file runtime scope.

## Deployment scope

Production is the existing VPS at `/opt/skezire`, behind Caddy. Remote source includes unrelated changes absent from main. Deployment therefore replaces only these six runtime files after checking original hashes:

- `src/data/tribes.ts`
- `src/app/sitemap.ts`
- `src/app/[locale]/shezhire-tree/page.tsx`
- `src/components/tribe-tree/InteractiveTree.tsx`
- `src/lib/tribe-tree.ts`
- `src/styles/shezhire-tree.css`

The Dockerfile, compose file, environment, Caddy, payment source and other production files stay intact. A source backup and tagged previous image are retained before the new image is built. Build and smoke checks precede web-only container replacement.

## Production result

Deployed at `2026-09-07T16:30:26Z` to [skezire.kz](https://skezire.kz/ru/shezhire-tree?view=reference&highlight=subtribe:konyrat-bekbauly-qozhabergen).

- Runtime code: `2c1a02d3fb6122273156b729977661c525a7d5cc`, branch `codex/deeper-map-20260907`, pushed to origin. This includes the earlier level-navigation commit `616dd47`, rebased onto main `0088556`. No main merge was performed.
- Image: `skezire-web:map-depth8-20260907-1625`, active image ID `sha256:2dd10e6a23b3dd336c28b674c888ca99e46d7e81004640fe79faa19c93d296e7`.
- Server Docker build passed using the existing Dockerfile and production configuration. The candidate ran at loopback port 3331; its fixed-ancestry/API/SSR/sitemap checks, full reference-pilot check and four RU/KK depth browser journeys passed before activation.
- Only `web` was recreated, with `--no-deps --no-build`. Caddy remained running with its original September 4 start time.
- Public HTTPS verification passed in RU/KK: fixed depth-8 search ancestry, Киікші membership, 340-branch map HTML, canonical, source link, new article anchor/date and map/article sitemap dates.
- The same four browser journeys passed on public HTTPS at 1440/375px, including depths 6 and 8, lazy requests, keyboard/mouse, failed-load retry, sibling recovery, search/reload and no document overflow. The test's host allowlist was narrowed to `https://skezire.kz` for this run. Screenshots: `output/playwright/depth8-production/` (ignored artifacts).
- Post-deploy SHA-256 verification confirmed all six payload files and **234 unchanged source/config/environment files**. The deployed image contains the preserved production-only code, so its whole source tree is not identical to this Git branch.

## Rollback

Backup directory: `/home/ubuntu/skezire-backups/map-depth8-20260907-1625`. It contains `source-before.tgz`, before/deployed SHA-256 manifests, and previous/active image IDs. Previous image: `sha256:d1ca714c10203add101f000728cd24e67d14580f5bde461ee9e4def8ad47085c`, retained as `skezire-web:rollback-map-depth8-20260907-1625`.

To roll back this release, verify that no newer release has replaced it, retag the previous image as `skezire-web:latest`, recreate only `web` with the existing compose file and restore the six backed-up source files. The automatic activation check did not require rollback. The temporary smoke container and local SSH forward were removed after public verification.

These checks establish the deployed map behavior. They do not establish live database publication, search indexing/rank changes or a completed real payment; none of those operations were part of this release.
