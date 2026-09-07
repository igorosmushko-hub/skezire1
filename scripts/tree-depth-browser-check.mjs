// Local production check; uses the same Playwright runtime as enriched-reference-browser-check.mjs.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:3436';
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(base).hostname));
const out = process.env.QA_ARTIFACT_DIR || 'output/playwright/tree-depth';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const node = (page, name) => page.locator('.tt-node').filter({ has: page.locator('strong').getByText(name, { exact: true }) });
try {
  for (const locale of ['ru', 'kk']) for (const width of [1440, 375]) {
    const kk = locale === 'kk';
    const names = kk ? ['Көтенші', 'Бес ата', 'Саңғыл', 'Ағысай', 'Самай'] : ['Котенши', 'Бес ата', 'Сангыл', 'Агысай', 'Самай'];
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    const loads = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => {
      const url = new URL(request.url());
      if (url.pathname === '/api/genealogy/children') {
        assert.equal(url.searchParams.get('source'), 'repo');
        loads.push(url.searchParams.get('node'));
      }
    });
    await page.goto(`${base}/${locale}/shezhire-tree?view=reference&highlight=subtribe:konyrat-kotenshi`);
    await page.locator('.tt-detail h3').getByText(names[0], { exact: true }).waitFor();
    const mobileChild = name => page.locator('.tt-mobile-browser li button').filter({ has: page.locator('strong').getByText(name, { exact: true }) });
    await (width > 760 ? node(page, names[1]) : mobileChild(names[1])).waitFor();
    assert.deepEqual(loads, ['subtribe:konyrat-kotenshi'], 'deep link loads only its immediate children');
    if (width > 760) {
      assert.equal(await node(page, names[2]).count(), 0, 'next depth is still unloaded');
      const next = page.getByRole('button', { name: kk ? 'Келесі деңгейді ашу' : 'Раскрыть следующий уровень', exact: true });
      let fail = true;
      await page.route('**/api/genealogy/children?**', async route => {
        if (fail && new URL(route.request().url()).searchParams.get('node') === 'subtribe:konyrat-bes-ata') {
          fail = false;
          await route.fulfill({ status: 503, json: { error: 'genealogy_unavailable' } });
        } else await route.continue();
      });
      await next.focus();
      await page.keyboard.press('Enter');
      await page.locator('.tt-level-controls [role="alert"]').waitFor();
      await next.click();
      await node(page, names[2]).waitFor();
      await next.click();
      await node(page, names[3]).waitFor();
      assert.ok(await node(page, names[4]).count(), 'sibling stays present');
      await page.waitForFunction(() => document.querySelectorAll('.tt-lines path').length === document.querySelectorAll('.tt-node').length - 1);
      await page.keyboard.press('Tab');
      await node(page, names[3]).focus();
      await page.waitForFunction(() => {
        const card = document.activeElement.getBoundingClientRect();
        const viewport = document.querySelector('.tt-viewport').getBoundingClientRect();
        return card.left >= viewport.left && card.right <= viewport.right;
      });
      await page.keyboard.press('Enter');
      const before = loads.length;
      await node(page, names[2]).focus();
      await page.keyboard.press('Enter');
      await page.waitForFunction(() => ![...document.querySelectorAll('.tt-node strong')].some(el => /^(Агысай|Ағысай)$/.test(el.textContent)));
      await page.keyboard.press('Enter');
      await node(page, names[3]).waitFor();
      assert.equal(loads.length, before, 'cached branch reopens without a request');
      await page.locator('.tt-viewport').screenshot({ path: `${out}/${locale}-${width}.png` });
      await node(page, names[3]).click();
      assert.equal(await page.locator('.tt-detail h3').textContent(), names[3], 'mouse click selects without moving on pointer-down');
    } else {
      await mobileChild(names[1]).click();
      await mobileChild(names[2]).click();
      await mobileChild(names[3]).waitFor();
      assert.ok(await mobileChild(names[4]).isVisible());
      await page.locator('.tt-mobile-browser').screenshot({ path: `${out}/${locale}-${width}.png` });
      await mobileChild(names[3]).click();
      await page.locator('.tt-mobile-empty').waitFor();
      await page.locator('.tt-mobile-browser-head button').click();
      await mobileChild(names[4]).click();
      assert.equal(await page.locator('.tt-detail h3').textContent(), names[4]);
    }
    const beforeSearch = loads.length;
    await page.locator('#tribe-tree-search').fill(names[2]);
    const result = page.locator('.tt-search-results button').filter({ has: page.locator('span').getByText(names[2], { exact: true }) });
    await result.focus();
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => new URL(location.href).searchParams.get('highlight') === 'subtribe:konyrat-sangyl');
    await (width > 760 ? node(page, names[3]) : mobileChild(names[3])).waitFor();
    assert.equal(loads.length, beforeSearch, 'search reuses loaded children');
    await page.reload();
    await (width > 760 ? node(page, names[4]) : mobileChild(names[4])).waitFor();
    assert.ok((await page.locator('.tt-detail-path').textContent()).includes(names[1]));
    assert.ok(await page.locator('.tt-detail-summary').textContent());
    const deepNames = kk ? ['Киікші', 'Бекбаулы', 'Қожаберген', 'Шуақ'] : ['Киикши', 'Бекбаулы', 'Кожаберген', 'Шуак'];
    await page.goto(`${base}/${locale}/shezhire-tree?view=reference&highlight=subtribe:konyrat-qurban`);
    await (width > 760 ? node(page, deepNames[0]) : mobileChild(deepNames[0])).waitFor();
    if (width > 760) {
      const next = page.getByRole('button', { name: kk ? 'Келесі деңгейді ашу' : 'Раскрыть следующий уровень', exact: true });
      await next.click();
      await node(page, deepNames[1]).waitFor();
      await next.click();
      await node(page, deepNames[2]).waitFor();
      await page.waitForFunction(() => document.querySelectorAll('.tt-lines path').length === document.querySelectorAll('.tt-node').length - 1);
    } else {
      await mobileChild(deepNames[0]).click();
      await mobileChild(deepNames[1]).click();
      await mobileChild(deepNames[2]).waitFor();
    }
    await page.locator(width > 760 ? '.tt-viewport' : '.tt-mobile-browser').screenshot({ path: `${out}/${locale}-${width}-depth8.png` });
    await page.locator('#tribe-tree-search').fill(deepNames[2]);
    await page.locator('.tt-search-results button').filter({ has: page.locator('span').getByText(deepNames[2], { exact: true }) }).click();
    await page.waitForFunction(() => new URL(location.href).searchParams.get('highlight') === 'subtribe:konyrat-bekbauly-qozhabergen');
    await page.reload();
    await page.locator('.tt-detail h3').getByText(deepNames[2], { exact: true }).waitFor();
    assert.ok((await page.locator('.tt-detail-path').textContent()).includes(deepNames[1]));
    if (width <= 760) {
      await page.locator('.tt-mobile-browser-head button').click();
      await page.locator('.tt-mobile-browser').getByRole('button', { name: kk ? 'Тағы тармақтарды көрсету' : 'Показать ещё ветви', exact: true }).click();
    } else {
      await node(page, deepNames[1]).click();
      await page.getByRole('button', { name: kk ? 'Келесі деңгейді ашу' : 'Раскрыть следующий уровень', exact: true }).click();
    }
    await (width > 760 ? node(page, deepNames[3]) : mobileChild(deepNames[3])).waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.deepEqual(errors, []);
    console.log(`PASS: ${locale}/${width}, real depths 6 and 8, lazy requests, siblings, search/reload, keyboard, no overflow${width > 760 ? ', failed load/retry, cached collapse/reopen' : ''}`);
    await context.close();
  }
} finally {
  await browser.close();
}
