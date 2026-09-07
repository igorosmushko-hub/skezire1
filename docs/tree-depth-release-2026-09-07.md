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

Deployment and browser results will be recorded below after execution.
