# Server and reference integration — 2026-09-07

## Candidate

- Base: `origin/main` at `1535072ee34875a35038fe1ff326ce6dc9c385b6`.
- Reference release: `e8e9ed11a977f5920b91072c8ee802250b2f97b1` (PR #2).
- Server source: `/opt/skezire`, read-only snapshot over SSH; no Git metadata.
  Of 235 selected source/config/public files, 224 match historical commit
  `2954e243a95025c4fa786b542c3093693f5f3603`. No source/public files from that
  baseline are missing. Environment files were not copied.
- Merge resolves the overlapping genealogy implementation in favor of the
  reviewed public-only reference release, retaining main's SEO/performance work.
  Duplicate tree sitemap entries and footer links are removed; runtime checks
  require exactly one per locale.
- Import the server's Robokassa SDK integration and Docker/Caddy configuration.
  The mobile login selector fix is already covered by the reference release's
  direct-child selectors at the 1279px navigation breakpoint.
- Omit three unreferenced server copies: `src/components/PricingPageClient.tsx`,
  `src/components/OrderCanvasClient.tsx`, `src/components/robokassa-widget.css`.
  Active route components and the imported stylesheet retain the actual changes.
- Local draft content is included in the fuller reference release; retain its
  later nested branches and qualifications. Private-preview bypass code and
  unrelated local research/output files remain outside this integration.

## SDK correction

The official Kazakhstan iframe SDK takes payment parameters, not callback
functions. Load the script once; cancel late initialization after unmount;
accept the documented provider close event; validate app notifier origin/source;
close/remove the owned iframe and restore scrolling on unmount. The independent
close button is a body portal placed after the SDK iframe at the same z-index.
A browser test uses the actual SDK while intercepting form submission, including
React development StrictMode, delayed load, cancellation, parent rerender,
repeated open/close, body restoration and rejection of untrusted messages.

## Validation

- `npm ci --no-audit --no-fund`.
- ESLint: zero errors; existing anonymous-export and analytics-image warnings.
- Production build and TypeScript.
- All 11 tree tests; 47 tribe IDs and 325 branch IDs; content/source checks.
- SEO, genealogy API/privacy, analytics sanitization and importer checks.
- Profile account-isolation browser regression using the shared Playwright runtime.
- 12 isolated PostgreSQL payment regression groups; no production writes.
- Rendered reference/API checks and 52 RU/KK browser journeys at 1440/375px.
- SDK lifecycle browser check; no real invoices or payments submitted.

Use `NODE_PATH=<shared node_modules> node scripts/profile-runtime-check.mjs`
and `NODE_PATH=<shared node_modules> node scripts/robokassa-widget-check.mjs`
for the standalone browser regressions. The latter fetches the official SDK;
`ROBOKASSA_SDK_FILE=<local JS>` selects an already downloaded copy.

## Merge/release gate

The candidate includes the inherited atomic package-payment handler and migration
`20260905183201_atomic_package_payment.sql`. Read-only checks against the payment
DB configured on the running server returned HTTP 200 for `payments.id` but
HTTP 400 / PostgreSQL `42703` for `payments.credited_generations`: the required
receipt column is absent. Do not deploy the new handler to this DB before its
coordinated migration; signed callbacks would fail instead of crediting accounts.

GitHub main also triggers a Vercel Production deployment (verified for `1535072`).
The Vercel production team's environment is not accessible with the current local
Vercel login, so its DB cannot be assumed to match or differ from the server DB.
The primary server runs Docker independently, without a Git checkout or an
automatic GitHub deployment found in its app directory.

Before merging the full candidate, resolve the payment rollout described in
`first-release-runbook.md` and `payment-retry-fix-2026-09-05.md`, including the
backup/restore and callback gates. Alternatively, agree to defer the backend
payment handler and its dependent migration/tests to a separate release.
Do not apply the entire migrations directory: genealogy and payment migrations
have different target databases. No migrations, service restarts, server file
changes, real Robokassa sandbox flow or production deployment were performed.
