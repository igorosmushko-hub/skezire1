// Release browser regression for the repository-backed genealogy release.
// NODE_PATH=/path/to/playwright/node_modules PLAYWRIGHT_BROWSERS_PATH=/path/to/ms-playwright \
// QA_BASE_URL=http://127.0.0.1:3117 node scripts/release-browser-check.mjs
// Read-only target. QA_LOAD=1 makes eight map visits in waves of at most four.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = (process.env.QA_BASE_URL || 'http://127.0.0.1:3117').replace(/\/$/, '');
const artifacts = process.env.QA_ARTIFACT_DIR || `/private/tmp/skezire-genealogy-qa-${Date.now()}`;
const timeout = Number(process.env.QA_TIMEOUT_MS || 15_000);
const articleLimit = Number(process.env.QA_MAX_ARTICLES || 47);
const expectUnavailable = process.env.QA_EXPECT_UNAVAILABLE;
const storageState = process.env.QA_STORAGE_STATE_FILE;
const isLocal = /^https?:\/\/(127\.0\.0\.1|localhost)(:|\/|$)/.test(base);
// Agreed before measurement: repo-only traffic, eight visits in two waves, max four concurrent.
const limits = { concurrency: 4, samples: 8, warmApiP95Ms: 1500, pageP95Ms: isLocal ? 3000 : 2500, previewColdPageMs: 5000 };
const result = { base, startedAt: new Date().toISOString(), limits, checks: [], timings: {}, artifacts };
const record = (name, details = {}) => result.checks.push({ name, ...details });
const p95 = values => [...values].sort((a, b) => a - b)[Math.max(0, Math.ceil(values.length * .95) - 1)];
const millis = async run => { const started = performance.now(); await run(); return Math.round(performance.now() - started); };
const mapUrl = (locale, highlight = '') => `${base}/${locale}/shezhire-tree${highlight ? `?highlight=${encodeURIComponent(highlight)}` : ''}`;
const labels = { ru: { search: 'Найти род или ветвь', back: 'Назад', retry: 'Повторить', clear: 'Очистить поиск', unavailable: 'Ветвь не найдена или недоступна', copy: 'Скопировать ссылку на ветвь', copied: 'Ссылка скопирована' }, kk: { search: 'Руды немесе тармақты табу', back: 'Артқа', retry: 'Қайталау', clear: 'Іздеуді тазарту', unavailable: 'Тармақ табылмады немесе қолжетімсіз', copy: 'Тармақ сілтемесін көшіру', copied: 'Сілтеме көшірілді' } };
async function noOverflow(page, label) {
  const dimensions = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  assert.equal(dimensions.scrollWidth, dimensions.width, `${label}: horizontal document overflow`);
  record(`overflow:${label}`, dimensions);
}
async function mapReady(page, locale, highlight = '') {
  const response = await page.goto(mapUrl(locale, highlight), { waitUntil: 'domcontentloaded' });
  assert.equal(response?.status(), 200, `map ${locale}: HTTP status`);
  await page.locator('.tt-explorer').waitFor();
}
async function searchSelectReloadLocale(page, locale) {
  const copy = labels[locale];
  await mapReady(page, locale);
  const input = page.getByRole('textbox', { name: copy.search });
  await input.fill('Найман');
  const searchMs = await millis(() => page.locator('.tt-search-results button').first().waitFor());
  assert.ok(searchMs <= limits.warmApiP95Ms, `${locale}: search ${searchMs}ms > ${limits.warmApiP95Ms}ms`);
  await page.locator('.tt-search-results button').first().click();
  await page.waitForFunction(() => new URL(location.href).searchParams.get('highlight') === 'tribe:naiman');
  await page.locator('.tt-detail h3').filter({ hasText: /Найман/ }).waitFor();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('.tt-detail h3').filter({ hasText: /Найман/ }).waitFor();
  await noOverflow(page, `${locale}-desktop-selected`);
  record(`search-select-reload:${locale}`, { highlight: new URL(page.url()).searchParams.get('highlight'), searchMs });
  await page.getByRole('button', { name: locale === 'ru' ? 'KK' : 'RU', exact: true }).click();
  await page.waitForURL(url => url.pathname === `/${locale === 'ru' ? 'kk' : 'ru'}/shezhire-tree`);
  assert.equal(new URL(page.url()).searchParams.get('highlight'), 'tribe:naiman', `${locale}: language switch lost focus`);
  record(`language:${locale}`, { url: page.url() });
}
async function copySelectedLink(page, locale) {
  const copy = labels[locale];
  await mapReady(page, locale, 'naiman');
  await page.getByRole('button', { name: copy.copy, exact: true }).click();
  await page.getByRole('status').filter({ hasText: copy.copied }).waitFor();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  const url = new URL(copied);
  assert.equal(url.origin, new URL(base).origin, `${locale}: copied link has another origin`);
  assert.equal(url.pathname, `/${locale}/shezhire-tree`, `${locale}: copied link has another path`);
  assert.equal(url.searchParams.get('highlight'), 'tribe:naiman', `${locale}: copied link loses selection`);
  assert.equal(url.hash, '', `${locale}: copied link keeps an irrelevant hash`);
  record(`copy-link:${locale}`, { copied });
}
async function mobileBackAndRetry(page, locale) {
  const copy = labels[locale];
  await page.setViewportSize({ width: 375, height: 812 });
  await mapReady(page, locale);
  await noOverflow(page, `${locale}-mobile-root`);
  let faulted = false;
  await page.route('**/api/genealogy/children?**', async route => {
    const url = new URL(route.request().url());
    if (!faulted && url.searchParams.get('node')?.startsWith('zhuz:')) {
      faulted = true;
      await route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"synthetic"}' });
    } else await route.continue();
  });
  await page.locator('.tt-mobile-browser li button').first().click();
  await page.locator('.tt-mobile-message[role="alert"]').waitFor();
  const retryMs = await millis(async () => {
    await page.getByRole('button', { name: copy.retry, exact: true }).click();
    await page.locator('.tt-mobile-browser li button').first().waitFor();
  });
  assert.ok(retryMs <= limits.warmApiP95Ms, `${locale}: retry ${retryMs}ms > ${limits.warmApiP95Ms}ms`);
  assert.ok(faulted, `${locale}: child error route was not exercised`);
  const selected = new URL(page.url()).searchParams.get('highlight');
  await page.getByRole('button', { name: copy.back, exact: true }).click();
  await page.waitForFunction(id => new URL(location.href).searchParams.get('highlight') !== id, selected);
  await noOverflow(page, `${locale}-mobile-retry-back`);
  await page.unroute('**/api/genealogy/children?**');
  record(`children-error-retry-back:${locale}`, { selectedBeforeBack: selected, retryMs });
}
async function searchErrorAndEmpty(page, locale) {
  const copy = labels[locale];
  await page.setViewportSize({ width: 1440, height: 900 });
  await mapReady(page, locale);
  let faulted = false;
  await page.route('**/api/genealogy/search?**', async route => {
    if (!faulted) { faulted = true; await route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"synthetic"}' }); } else await route.continue();
  });
  const input = page.getByRole('textbox', { name: copy.search });
  await input.fill('Найман');
  await page.getByText(locale === 'ru' ? 'Поиск временно недоступен' : 'Іздеу уақытша қолжетімсіз', { exact: true }).waitFor();
  await input.fill(''); await input.fill('Найман');
  await page.locator('.tt-search-results button').first().waitFor();
  await input.fill('zzzz_no_match_20260905');
  await page.getByText(locale === 'ru' ? 'Совпадений не найдено' : 'Сәйкестік табылмады', { exact: true }).waitFor();
  await page.getByRole('button', { name: copy.clear, exact: true }).click();
  assert.equal(await input.inputValue(), '');
  assert.ok(faulted, `${locale}: search error route was not exercised`);
  await page.unroute('**/api/genealogy/search?**');
  record(`search-error-empty-clear:${locale}`);
}
async function expandCollapse(page, locale) {
  await mapReady(page, locale, 'naiman');
  const node = page.locator('.tt-node').filter({ hasText: /Найман/ }).first();
  await node.click();
  await page.waitForFunction(() => [...document.querySelectorAll('.tt-node')].some(node => node.getAttribute('aria-expanded') === 'false'));
  await node.click();
  await page.waitForFunction(() => [...document.querySelectorAll('.tt-node')].some(node => node.getAttribute('aria-expanded') === 'true'));
  record(`expand-collapse:${locale}`);
}
async function unavailable(page, locale) {
  await page.goto(mapUrl(locale, 'qa-unavailable-node'), { waitUntil: 'domcontentloaded' });
  const fallback = await page.getByText(labels[locale].unavailable, { exact: true }).count() > 0;
  if (expectUnavailable !== undefined) assert.equal(fallback, expectUnavailable === '1', `${locale}: unavailable-link expectation`);
  record(`unavailable-link:${locale}`, { fallback, expected: expectUnavailable ?? 'observed-only' });
}
async function articleRoundTrips(page, locale) {
  const response = await page.goto(`${base}/${locale}/encyclopedia`, { waitUntil: 'domcontentloaded' });
  assert.equal(response?.status(), 200, `${locale}: encyclopedia index`);
  const articles = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts, locale) => {
    const collection = scripts.map(script => JSON.parse(script.textContent || '{}')).find(item => item.mainEntity?.itemListElement);
    return [...new Set((collection?.mainEntity?.itemListElement || []).map(item => new URL(item.url).pathname)
      .filter(href => new RegExp(`^/${locale}/encyclopedia/[^/?#]+/[^/?#]+$`).test(href)))];
  }, locale);
  assert.equal(articles.length, 47, `${locale}: encyclopedia article count`);
  const sections = [...new Set(articles.map(href => href.split('/').slice(0, 4).join('/')))];
  assert.equal(sections.length, 4, `${locale}: encyclopedia section count`);
  for (const section of sections) assert.equal((await page.goto(`${base}${section}`, { waitUntil: 'domcontentloaded' }))?.status(), 200, `${locale}: section ${section}`);
  for (const article of articles.slice(0, articleLimit)) {
    await page.goto(`${base}${article}`, { waitUntil: 'domcontentloaded' });
    const treeLink = page.locator(`a[href^="/${locale}/shezhire-tree?highlight="]`).filter({ hasText: /Посмотреть на карте|Картадан көру/ });
    assert.equal(await treeLink.count(), 1, `${locale}: map link on ${article}`);
    const mapHref = await treeLink.getAttribute('href');
    assert.ok(mapHref, `${locale}: missing map href on ${article}`);
    await page.goto(`${base}${mapHref}`, { waitUntil: 'domcontentloaded' });
    const backLink = page.locator(`.tt-detail-link[href="${article}"]`);
    assert.equal(await backLink.count(), 1, `${locale}: map node does not return to ${article}`);
    await backLink.click();
    await page.waitForURL(url => url.pathname === article);
  }
  record(`articles-branches-articles:${locale}`, { articles: Math.min(articleLimit, articles.length), sections: sections.length });
}
async function loadProbe(context) {
  const warm = await context.newPage(); await mapReady(warm, 'ru'); await warm.close();
  const samples = [];
  for (let start = 0; start < limits.samples; start += limits.concurrency) {
    const batch = await Promise.all(Array.from({ length: Math.min(limits.concurrency, limits.samples - start) }, async () => {
      const page = await context.newPage();
      const ms = await millis(() => mapReady(page, 'ru')); await page.close(); return ms;
    }));
    samples.push(...batch);
  }
  const value = p95(samples);
  assert.ok(value <= limits.pageP95Ms, `map page p95 ${value}ms > ${limits.pageP95Ms}ms`);
  result.timings.mapPage = { samples, p95: value }; record('bounded-load', { concurrency: limits.concurrency, samples: limits.samples, p95: value });
}
await mkdir(artifacts, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...(storageState ? { storageState } : {}) });
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: base });
  const page = await context.newPage();
  page.setDefaultTimeout(timeout);
  const pageErrors = []; page.on('pageerror', error => pageErrors.push(error.message));
  for (const locale of ['ru', 'kk']) {
    await searchSelectReloadLocale(page, locale); await mobileBackAndRetry(page, locale);
    await searchErrorAndEmpty(page, locale); await expandCollapse(page, locale); await unavailable(page, locale); await copySelectedLink(page, locale);
    await articleRoundTrips(page, locale);
    await page.screenshot({ path: path.join(artifacts, `map-${locale}.png`), fullPage: true });
  }
  assert.deepEqual(pageErrors, [], `browser page errors: ${pageErrors.join('; ')}`);
  if (process.env.QA_LOAD === '1') await loadProbe(context);
  result.status = 'PASS';
} catch (error) {
  result.status = 'FAIL'; result.error = error instanceof Error ? error.message : String(error); throw error;
} finally {
  result.finishedAt = new Date().toISOString();
  await writeFile(path.join(artifacts, 'results.json'), `${JSON.stringify(result, null, 2)}\n`);
  await browser.close();
}
console.log(JSON.stringify(result, null, 2));
