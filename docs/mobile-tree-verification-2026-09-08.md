# Mobile tree — local verification, 8 September 2026

## Scope and baseline

The clean task worktree was fast-forwarded from `0088556` to `8abc46c`, matching the committed tree implementation in `/Users/am/.codex/worktrees/c906/skezire`. Its three untracked historical-research files were not copied or changed. This preserves the existing lazy expansion and source-backed depth-eight branches.

Implementation changes only the tree component and its stylesheet; browser checks were added/adapted. No dependency, API, data, locale routing, migration, deployment, or publication changes.

## Design brief

- Product/audience: Skezire, readers exploring the traditional reference catalogue in RU/KK. Main decision: choose a branch, inspect its context, optionally open details.
- Trust: high; existing `TRIBES_DB`, tree node summaries, and article source locators remain authoritative. No new dates, ancestors, tamgas, or biological-descent claims.
- Character: calm, precise, rooted in the existing editorial identity. Technical Trust structure using the existing tree as the dominant material, rather than a new visual theme.
- Tokens: existing display/functional fonts, dark blue canvas, warm branch nodes, gold selection, 10px mobile gutters, existing small control and card radii. No animation dependency.
- Composition: compact page title → search → pannable graph → preview. Existing catalogue and provenance remain below the explorer on mobile. Desktop keeps its existing layout and detail article.
- Primary action: More opens a near-full-height sheet; the separately named encyclopedia link navigates to the original article and branch anchor.
- Native platform: existing Pointer Events handle pan/pinch; native `dialog.showModal()` provides modal focus and Escape. ShadcnSpace drawer search returned no blocks; no donor installed.
- Responsive: the graph stays primary. Initial mobile framing uses the selected node, its direct parent, and nearby siblings at a readable local scale. Large families remain reachable by pan; automatic fit does not shrink the entire deep graph.
- Required states: root, selected leaf/branch, compact/expanded/closed card, loading, load failure/retry, search, empty children, locale switch, keyboard focus, delayed load after manual movement.
- Product-specific proof: source-backed branch labels/topology and existing source locators. The composition cannot be replaced by a generic card grid without losing the core tree interaction. The redundant introductory hero copy is the first element removed from the mobile first screen; desktop copy is unchanged.

## Implementation and review

- Mobile enables the existing canvas and retires the list-only browser.
- Selection/search/deep links open a compact preview. More opens a 90dvh native sheet with the full existing summary, descendants, source locators, copy link, and encyclopedia link.
- Preview/sheet closing changes only overlay state; sheet scrolling stays isolated. Keyboard arrows pan the focused canvas; node focus centers the node.
- Deep links and search load the direct parent to reveal siblings, retaining the existing pagination loader.
- Independent review reproduced a late-response pan reset. `autoCenterRef` now cancels automatic centering at the RAF side effect after manual movement or sheet opening. Explicit focus restores it. A delayed-response browser regression verifies the fix.
- Independent review and separate async diagnosis found no remaining actionable issue after integration.

## Checks

- `npm run build`: PASS, including TypeScript and generation of 88 static pages.
- `npx tsc --noEmit`: PASS.
- `npm run lint`: PASS, 0 errors; 13 existing warnings outside the changed component/checks.
- Targeted ESLint and `git diff --check`: PASS.
- `node --experimental-strip-types --test src/lib/tribe-tree.test.mjs`: PASS, 13 tests.
- `scripts/mobile-tree-browser-check.mjs`: PASS against local production build on port 3442. RU/KK 390×844, 360×740 and desktop 1440×900: touch pan/pinch, unobscured parent/siblings, preview, modal focus/Escape, actual long-content scrolling, close/position preservation, search/reload, language switch, delayed response, root tap, failure/retry, desktop mouse pan/zoom, no page errors/overflow.
- `scripts/enriched-reference-browser-check.mjs`: PASS, 52 article/tree/search/reload/copy/anchor/source journeys in RU/KK at 1440/375px on local production port 3442.
- `scripts/tree-depth-browser-check.mjs`: PASS against local production build on port 3442 for RU/KK 375 and 1440 widths. Depths 6/8, siblings, search/reload, keyboard, desktop load error/retry and cached collapse/reopen.

Browser commands use `QA_BASE_URL=http://127.0.0.1:3442` and `PLAYWRIGHT_MODULE=/Users/am/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright`. Screenshots are in `output/playwright/mobile-tree/`, `output/playwright/tree-depth/` and `output/playwright/enriched-reference/`.

## Boundaries

All browser evidence concerns the local production build and the reference catalogue (`view=reference`). No deployment occurred. External database source pagination and physical iOS/Android hardware were not tested end to end; Chromium mobile emulation used real CDP touch events. The committed source data is unchanged, including its existing aliases and caveats.
