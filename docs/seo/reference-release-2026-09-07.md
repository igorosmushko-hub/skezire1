# SEO reference release — 2026-09-07

This release combines the reviewed bilingual reference catalogue from PR #2
with the SEO/performance work already merged into main. It keeps 47 tribe
article IDs and 325 branch IDs, source notes, nested article/map navigation,
canonical/hreflang/JSON-LD and sitemap dates. There is exactly one tree sitemap
entry and footer link per locale. Shared symbol components omit empty fields
where source review removed unsupported claims.

Scope is SEO/reference only. Payment handlers, widget and checkout callers,
profile and AI forms match the pre-release main (`1535072`). No new migrations,
server Docker/Caddy configuration or private genealogy datasets are included.
The genealogy source defaults to the repository catalogue; this mode makes no
DB calls and requires no migration. External/private links retain validation
and neutral unavailable states. Original broader work remains on its branches.

Validation uses the existing tree tests, content/source checker, SEO and
genealogy runtime checks, analytics URL sanitization, production build,
TypeScript and rendered reference/API checks. The browser script exercises
52 RU/KK journeys at desktop/mobile widths (1440/375px). Reference CI runs on
main and pull requests; it does not execute payment migration tests.

Merging main triggers the existing Vercel deployment. The independently running
Docker server at skezire.kz is not changed by this Git merge. Server deployment,
real payments, full private genealogy publication and live search indexation
are outside this release action; successful CI does not certify those states.
