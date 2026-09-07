# Public map depth — local verification, 2026-09-07

Base: `f6becbc`. No commit, merge, push or deployment was performed.

## Change

- Desktop: “Раскрыть следующий уровень” / “Келесі деңгейді ашу” opens the next unresolved level inside the selected reference branch. Other branches keep their state.
- Search and deep links now expand the selected node and fetch its immediate children. Previously the canvas kept the target collapsed, including after loading children.
- Reference links now send only the root, sections and selected path initially; child levels use the existing API. No API or database contract changed.
- “Show more” expands the node as well as loading it. Search reuses loaded children and does not rewind a cached pagination cursor. Switching data sources remounts the explorer.
- Keyboard focus brings a card into view; mouse focus does not move it before the click. Mobile retains the existing per-branch list and Back action.

## Evidence

Real, pre-existing public path: Алаш → Средний жуз → Конырат → Котенши → Бес ата → Сангыл → Агысай (depth 6, counting Алаш as 0). Samay and the other Sangyl children remain present. The catalog remains 47 tribes and 325 branches; this change adds no genealogy records or new claimed generations.

Passed locally:

- `node --experimental-strip-types --test src/lib/tribe-tree.test.mjs`: 12 tests, including one-level loading along the fixed real path, sibling preservation and paginated path merging.
- `npx tsc --noEmit`, `npm run build`.
- `npm run lint`: zero errors, 13 existing warnings outside the changed files. Focused ESLint on changed code and the new browser script: zero warnings/errors.
- `node scripts/encyclopedia-content-check.mjs`.
- `node scripts/genealogy-runtime-check.mjs`, `node scripts/seo-runtime-check.mjs`, `node scripts/analytics-runtime-check.mjs`.
- `node scripts/verify-reference-pilot.mjs http://127.0.0.1:3436` and `node scripts/verify-seo.mjs http://127.0.0.1:3436`: source links, aliases, anchors, SSR metadata and all 170 sitemap URLs retained.
- `scripts/tree-depth-browser-check.mjs`: RU/KK at 1440×900 and 375×900. Deep link loads only its immediate children, next levels reach depth 6, neighboring branches remain, failed loading can retry, cached reopening/search avoids another request, search/reload retain the deep path, keyboard and mouse work, and the page has no horizontal overflow.
- `scripts/enriched-reference-browser-check.mjs`: all 52 existing RU/KK article/map/search/reload/copy/source journeys passed against the final local build at 1440/375px.
- Additional browser check on the default root URL: next-level expansion sends four section requests, shows tribes, and leaves subtribes unloaded.
- Independent read-only code review: no actionable findings in the final code.

Run the new browser check against a local production server with `GENEALOGY_SOURCE=repo GENEALOGY_INCLUDE_PRIVATE=0`, setting `QA_BASE_URL` and `PLAYWRIGHT_MODULE` to the existing Playwright runtime. Screenshots are saved in `output/playwright/tree-depth/` (ignored verification artifacts).

## Limits

- Bulk next-level expansion is limited to the curated repository source. External-source children retain explicit pagination. External SQL/publication access was tested with the existing synthetic runtime checks and reviewed statically; no live database was queried.
- Provenance caveats, source links and the public data boundary remain unchanged. No private snapshot, payments, migrations or publication flags were changed.
- The original reference screenshot was unavailable in this task. Existing project cards, connectors and colors were reused. Mobile remains a branch list rather than a small draggable canvas.
- Accessibility verification covers native keyboard operation, focus visibility, expanded state and the existing reduced-motion mode. No screen-reader session or full WCAG audit was performed.
- Build reports the existing middleware deprecation and edge-runtime static-generation warnings.
