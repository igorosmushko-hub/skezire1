# Genealogy protected preview: extended browser check

Checked 2026-09-05, completed at 18:38 UTC. This is a preview verification report, not production approval.

## Target and provenance

- URL: https://skezire-genealogy-preview-98zq36ie7-miks-projects-b711e469.vercel.app
- Expected and freshly confirmed deployment: `dpl_2uZChoC8npRgfrX6CYBpXB5fCcja`, `Ready`, target `preview` (`vercel inspect`).
- Project supplied by coordinator: `prj_DIQXyzeuoFAAolfKu4z4RkawMoiN`.
- Working copy: `/Users/am/.codex/worktrees/5c37/skezire`, base `81a5aec4241078a46c0495baa886759340573b76`.
- Reference, read only: `/Users/am/.codex/worktrees/151b/skezire`.
- Read prior `docs/seo/genealogy-preview-check-2026-09-05.json`, `scripts/genealogy-browser-check.mjs`, `docs/seo/genealogy-release-progress-2026-09-05.md` and `docs/seo/genealogy-preview-inputs-2026-09-05.json` in that reference copy.
- SHA-256 comparison: reference `InteractiveTree.tsx`, map `page.tsx`, `genealogy-data.ts`, `shezhire-tree.css` and `robots.ts` all match the recorded preview input manifest. All five differ from this task's base. No application files were copied or changed; testing targeted the deployed URL. This avoids testing the stale local base as if it were the preview.
- Browser: existing authorized Chrome session through supported CUA browser APIs. Temporary viewport overrides were reset; original `/ru/shezhire-tree?highlight=naiman` tab restored at width 1352.
- Authenticated HTTP: official `vercel curl`, automatic existing authorization. No cookies, authorization headers or bypass secrets were extracted or recorded.

## Result matrix

`PASS` and `FAIL` below refer to fresh observations on this exact URL unless explicitly marked historical. `NOT RUN / UNAVAILABLE` is not evidence of failure.

| Scenario | Status | Evidence and scope |
| --- | --- | --- |
| Deployment identity | PASS | `vercel inspect` confirms the expected deployment ID, Ready and preview target. |
| Mobile 375 × 812: layout and readability | PASS | Screenshots reviewed for hero, published search/results and curated branch list. `innerWidth=375`, `documentElement.scrollWidth=375` for curated Найман, selected published Сіргелі, published root and unavailable-node screen. No horizontal document overflow or observed unreadable clipping in these states. Emulated viewport, not a physical-device keyboard/touch test. |
| Mobile published search/select/reload | PASS | Root Қазақ → search `Сіргелі` → result `Сіргелі Қазақ` → selected Сіргелі. URL becomes `highlight=tumalas-local-snapshot%3A28%3A1`; full reload retains this URL and selected node. |
| Mobile published Back | PASS | Selected Сіргелі → `Назад` → Қазақ with children Сіргелі and Ысты; URL becomes `highlight=tumalas-local-snapshot%3A1%3Aroot`. |
| Mobile published leaf | PASS | Selected Сіргелі displays `У этой ветви нет продолжения.` before and after reload. This is the available public leaf, not evidence about private descendants. |
| Mobile curated Back/reload | PASS | `highlight=naiman` → `Назад` → `zhuz:orta` → `Назад` → `alash`; reload retains Алаш and disables root Back. This tests the repository reference tree. |
| Search loading | PASS | On published root, enter `Ысты`; supported locator wait observed visible `Ищем…`, followed by actual `Ысты / Қазақ` result. No latency or server failure was injected. |
| Empty search result | PASS | `zzzz_no_match_20260905` produces `Совпадений не найдено`; current root and its children remain usable. |
| Clear search | PASS | `Очистить поиск` removes the result panel and leaves input value empty; final DOM read confirms search panel contains only its label. |
| Nonexistent node: safe fallback | PASS | `highlight=tumalas-local-snapshot%3A999999999%3Aroot` removes the explorer and shows a non-sensitive unavailable screen; the 47-item encyclopedia directory remains accessible. HTTP 200 with `x-robots-tag: noindex`. No private node was probed. |
| Nonexistent node: correct explanation/recovery | FAIL | Same URL incorrectly says the source could not be connected to. There is no contextual return-to-root/retry action in the unavailable section. See defect below. |
| Curated mobile expansion | PASS | Найман → `Показать ветви` loads eight named children: Каракерей, Тортуыл, Бура, Сарыжомарт, Ергенекты, Матай, Садыр, Баганалы. This is `repo` data, not a broad Neon branch. |
| Curated desktop expand/collapse/re-expand | PASS | At 1352 × 900, Найман `aria-expanded` transitions `true → false → true`; child button `Каракерей Қаракерей` count transitions `1 → 0 → 1`. |
| Mobile 503/retry on remote preview | NOT RUN / UNAVAILABLE | Authorized Chrome surface supports viewport and read-only DOM evaluation, but exposes no route interception or response fulfillment. No monkey-patching, cookie transfer, alternate authentication or protection changes were attempted. |
| Browser-only local search 503 → successful next request | PASS, historical only | Reference progress report, line 30, records synthetic search HTTP 503 distinct from empty results and a subsequent successful real Neon request. It does not claim a dedicated search retry button. Not rerun in this task: `127.0.0.1:3117` refuses connection, including a check outside the sandbox. |
| Branch loading skeleton / child API failure + retry | NOT RUN | Fresh loading observation above covers search only. The three-public-row remote tree has no suitable deep/wide branch; no remote child-response interception is exposed. |
| Anonymous protection | PASS | Fresh anonymous GET `/ru/shezhire-tree`: HTTP 302, `x-robots-tag: noindex`; redirects were not followed. |
| Authenticated query-page indexing guard | PASS | Official Vercel GET `/ru/shezhire-tree?highlight=naiman&qa=canonical`: HTTP 200, `x-robots-tag: noindex`. DOM meta robots is `index, follow`; preview exclusion is provided by the HTTP header, not this meta tag. |
| robots.txt | PASS, observed configuration | Authorized GET returns `Allow: /`, `Disallow: /agents/`, `Disallow: /api/` for `*` and Yandex. Host and Sitemap point to `https://skezire.kz`. robots.txt is not a blanket preview disallow. |
| Canonical/query duplicates | PASS | Curated selection and unavailable-node check use query-free RU canonical; explicit `?highlight=naiman&qa=canonical#tree-explorer-title` DOM canonical is `https://skezire.kz/ru/shezhire-tree`. Hreflang links: kk and ru clean URLs, x-default → kk. No extra query URL was exposed as canonical. This is a bounded sample, not every possible parameter combination. |
| Real deep/wide Neon branches; scale/cold start | NOT RUN / UNAVAILABLE | Prior configuration reports only three public rows; live root showed Қазақ, Сіргелі, Ысты. No full-dataset claim, performance benchmark or load test was made. |

## Defect: unavailable focus is presented as a connection failure

Reproduce on the authorized preview:

1. Open `/ru/shezhire-tree`; observe working Қазақ tree and successful search.
2. Open `/ru/shezhire-tree?highlight=tumalas-local-snapshot%3A999999999%3Aroot`.
3. Observe `Источник недоступен`, `Генеалогическая карта временно недоступна` and `Сейчас не удалось подключиться к опубликованному источнику.` The explorer/search disappear; only the encyclopedia directory remains below. Response is HTTP 200.

Observed impact: a malformed or unavailable deep link appears to be a service outage, and the error section provides no direct recovery to the working root. The generic response does not disclose whether a private record exists; preserve that property in any repair.

Source evidence in the reference copy: `src/lib/genealogy-data.ts:155` throws `genealogy_focus_unavailable` when no permitted path is found. `src/app/[locale]/shezhire-tree/page.tsx:72` catches this together with source failures; the fallback at line 166 uses the connection-failure wording for both. The root worked before the invalid-link check and again afterward. This explains the observed UI without assuming a database outage. No fix was made in this report-only task.

Suggested acceptance criterion for a separate repair: unavailable focus gets a generic unavailable-link explanation and a safe root action, while actual source failure retains its service-unavailable state; neither branch reveals private data.

## Reproducible HTTP commands

Run in an already authorized Vercel CLI environment. These are GETs; no explicit secret is necessary. Do not add debug output or dump authorization/cookie headers.

```sh
vercel inspect https://skezire-genealogy-preview-98zq36ie7-miks-projects-b711e469.vercel.app
vercel curl /robots.txt --deployment https://skezire-genealogy-preview-98zq36ie7-miks-projects-b711e469.vercel.app -- --silent --show-error --max-time 25
vercel curl '/ru/shezhire-tree?highlight=naiman&qa=canonical' --deployment https://skezire-genealogy-preview-98zq36ie7-miks-projects-b711e469.vercel.app -- --silent --show-error --max-time 25 --output /dev/null --write-out 'HTTP=%{http_code}\nROBOTS=%header{x-robots-tag}\n'
vercel curl '/ru/shezhire-tree?highlight=tumalas-local-snapshot%3A999999999%3Aroot' --deployment https://skezire-genealogy-preview-98zq36ie7-miks-projects-b711e469.vercel.app -- --silent --show-error --max-time 25 --output /dev/null --write-out 'HTTP=%{http_code}\nROBOTS=%header{x-robots-tag}\n'
curl --silent --show-error --max-time 25 --output /dev/null --write-out 'HTTP=%{http_code}\nROBOTS=%header{x-robots-tag}\n' 'https://skezire-genealogy-preview-98zq36ie7-miks-projects-b711e469.vercel.app/ru/shezhire-tree'
```

Those four direct HTTP probes completed successfully; normal browser navigations/search requests were additional user-flow checks, not a concurrency batch. Optional batch-of-eight and load testing were not run.

## Integration and limitations

- Only this report was added. No transferred application files, dependencies, test framework or unexecuted browser script.
- No changes to application, main checkout, other worktrees, environment, SSO, publication flags, database schema or external records. No commit, push, deploy or migration.
- Existing local error-test evidence is attributed above; it must not be relabeled as a fresh remote pass. Remote browser-only fault injection requires an authorized browser tool exposing supported interception, or a separately authorized local test setup.
- Screenshots were inspected in the tool session; no new screenshot files were saved. The historical report's image paths belong to the reference worktree and are not fresh preview screenshots.
- Tool limitations encountered: sandbox DNS prevented first CLI calls; read-only external calls succeeded with approved execution. Local server 3117 is absent. A locator-scoped input read timed out after successful Clear; final read-only DOM inspection confirmed the empty value. No unexplained application crash was observed.
- Fresh final file validation: `git diff --check` and report-content assertions; application tests/build/lint not run because no application code changed.

## Coordinator follow-up in151b (local only)

The missing-focus explanation defect was reproduced by rendering the actual page and adapter with a synthetic transport. The page now distinguishes the existing `genealogy_focus_unavailable` code, displays the same generic message for missing/private/private-ancestor links and provides a clean locale-specific root link. Source/config/root errors keep the original outage state. Adapter, SQL, API and unknown-focus handling in repo mode were not changed.

The existing scripts/genealogy-runtime-check.mjs now covers RU/KK error-state rendering and recovery, byte-identical denied-path HTML, absence of private key/error details, real source failures and valid root/curated paths. It failed before the fix and passed afterward. Full lint passes with one existing img warning; build/TypeScript pass with88staticpages. Independent bug-analyzer repeated runtime/scoped lint/TypeScript/diff checks successfully. Code-reviewer found no production-code issues. Its low-priority test gap was corrected: the private-ancestor fixture now returns a visible target without a permitted root chain, unlike the empty missing/private fixtures. Runtime and scoped lint were rerun successfully.

No new deployment was made. The matrix above still describes the installed preview; its FAIL is fixed locally, not verified as fixed remotely. Remote fault injection and full permitted Neon depth/width remain unavailable.
