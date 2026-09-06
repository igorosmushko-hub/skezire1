// Local production browser checks. Use the same PLAYWRIGHT_MODULE as release-browser-check.mjs.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:3434';
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(base).hostname));
const out = process.env.QA_ARTIFACT_DIR || '/private/tmp/skezire-enriched-reference-browser';
await mkdir(out, { recursive: true });
const cases = [
  ['dulat', 'dulat-kudaykul', 'Құдайқұл', 'Кудайкул', ['Дулат', 'Ботбай']],
  ['jalayir', 'jalayir-andas', 'Андас', 'Андас', ['Жалайыр', 'Шуман']],
  ['shapyrashty', 'shapyrashty-zharimbet', 'Жәрімбет', 'Жаримбет', ['Шапырашты', 'Екей']],
  ['sirgeli', 'sirgeli-koyshyly', 'Қойшылы', 'Қойшылы', ['Сіргелі']],
  ['alban', 'alban-shybyl', 'Шыбыл', 'Шыбыл', ['Албан']],
  ['suan', 'suan-tokarystan', 'Тоқарыстан', 'Токарыстан', ['Суан']],
];
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE });
const results = [];
try {
  for (const width of [1440, 375]) for (const locale of ['ru', 'kk']) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: base });
    const page = await context.newPage();
    page.setDefaultTimeout(15_000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const [tribe, branch, kk, ru, ancestors] of cases) {
      const article = `/${locale}/encyclopedia/uly/${tribe}`;
      assert.equal((await page.goto(base + article))?.status(), 200);
      const cta = page.locator('.tribe-article-card .btn.btn-primary');
      assert.equal(await cta.textContent(), locale === 'ru' ? 'Посмотреть на карте родов' : 'Рулар картасынан көру');
      const order = await cta.evaluate(el => {
        const section = el.closest('.tribe-card-section');
        return section?.previousElementSibling !== null && section?.nextElementSibling?.querySelector('h2') !== null;
      });
      assert.ok(order, 'gold CTA precedes history');
      await cta.click();
      await page.locator('.tt-detail h3').waitFor();
      assert.equal(new URL(page.url()).searchParams.get('view'), 'reference');
      assert.equal(new URL(page.url()).searchParams.get('highlight'), `tribe:${tribe}`);
      if (tribe === 'dulat') {
        await page.getByRole('button', { name: locale === 'ru' ? 'Вступить в род' : 'Руға қосылу' }).click();
        await page.locator('.join-close').waitFor();
        assert.equal(await page.locator('.join-tamga').count(), 0);
        await page.locator('.join-close').click();
      }
      const input = page.locator('#tribe-tree-search');
      await input.fill(locale === 'kk' ? kk : ru);
      const hit = page.locator('.tt-search-results button').filter({ has: page.locator('small').filter({ hasText: ancestors[0] }) });
      await hit.first().click();
      await page.waitForFunction(id => new URL(location.href).searchParams.get('highlight') === id, `subtribe:${branch}`);
      const path = await page.locator('.tt-detail-path').textContent();
      for (const ancestor of ancestors) assert.ok(path.includes(ancestor), `${branch}: missing ancestor ${ancestor}`);
      assert.ok(await page.locator('.tt-detail-summary').textContent(), `${branch}: missing source version note`);
      await page.reload();
      assert.equal(await page.locator('.tt-detail h3').textContent(), locale === 'kk' ? kk : ru);
      await page.getByRole('button', { name: locale === 'ru' ? 'Скопировать ссылку на ветвь' : 'Тармақ сілтемесін көшіру', exact: true }).click();
      await page.getByRole('status').filter({ hasText: locale === 'ru' ? 'Ссылка скопирована' : 'Сілтеме көшірілді' }).waitFor();
      const copied = new URL(await page.evaluate(() => navigator.clipboard.readText()));
      assert.equal(copied.searchParams.get('view'), 'reference');
      assert.equal(copied.searchParams.get('highlight'), `subtribe:${branch}`);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      if (tribe === 'dulat') await page.screenshot({ path: `${out}/map-${locale}-${width}.png`, fullPage: true });
      const details = page.locator(`.tt-detail a[href="${article}#branch-${branch}"]`);
      await details.click();
      await page.waitForURL(url => url.hash === `#branch-${branch}`);
      assert.ok(await page.locator(`#branch-${branch}`).isVisible());
      await page.locator('#tribe-sources-title').scrollIntoViewIfNeeded();
      assert.ok(await page.locator('#tribe-sources-title').isVisible());
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      if (tribe === 'dulat') {
        await page.screenshot({ path: `${out}/sources-${locale}-${width}.png` });
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({ path: `${out}/article-${locale}-${width}.png` });
      }
      results.push({ locale, width, tribe, branch, status: 'PASS' });
    }
    await page.goto(`${base}/${locale}/encyclopedia`);
    for (const [tribe] of cases) {
      const card = page.locator(`a.enc-tribe-card[href="/${locale}/encyclopedia/uly/${tribe}"]`);
      assert.equal(await card.locator('.enc-tribe-card-tamga').count(), 0);
      assert.ok(await card.isVisible());
    }
    await page.screenshot({ path: `${out}/catalog-${locale}-${width}.png`, fullPage: true });
    const missing = await page.goto(`${base}/${locale}/shezhire-tree?view=reference&highlight=subtribe:alban-sary`);
    assert.equal(missing?.status(), 200);
    assert.equal(await page.locator('.tt-explorer').count(), 0);
    assert.ok((await page.locator('main, .tt-shell').first().textContent()).includes(locale === 'ru' ? 'Ветвь не найдена или недоступна' : 'Тармақ табылмады немесе қолжетімсіз'));
    assert.deepEqual(errors, []);
    await context.close();
  }
  console.log(`PASS: ${results.length} enriched card/reference/search/nested path/reload/copy/anchor/source journeys in RU/KK at 1440/375px.`);
} finally {
  await writeFile(`${out}/results.json`, JSON.stringify(results, null, 2));
  await browser.close();
}
