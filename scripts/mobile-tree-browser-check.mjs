import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:3436';
const out = process.env.QA_ARTIFACT_DIR || 'output/playwright/mobile-tree';
const target = 'subtribe:oshakty-bayly-suzik';
const parent = 'subtribe:oshakty-bayly';
const siblings = ['subtribe:oshakty-bayly-baysary', 'subtribe:oshakty-bayly-kaska', 'subtribe:oshakty-bayly-kabyl'];

assert.ok(['127.0.0.1', 'localhost'].includes(new URL(base).hostname), 'QA_BASE_URL must be local');
await mkdir(out, { recursive: true });

const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE });
const transform = page => page.locator('.tt-canvas').evaluate(el => el.style.transform);
const treeNode = (page, id) => page.locator(`[data-node-id="${id}"]`);
const touch = async (session, type, points) => session.send('Input.dispatchTouchEvent', { type, touchPoints: points });

async function panAndPinch(page) {
  const box = await page.locator('.tt-viewport').boundingBox();
  assert.ok(box, 'mobile viewport is visible');
  const session = await page.context().newCDPSession(page);
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const before = await transform(page);
  await touch(session, 'touchStart', [{ x, y, id: 1 }]);
  await touch(session, 'touchMove', [{ x: x + 38, y: y - 24, id: 1 }]);
  await touch(session, 'touchEnd', []);
  await page.waitForTimeout(80);
  assert.notEqual(await transform(page), before, 'one-finger pan changes the tree transform');

  assert.equal(new URL(page.url()).searchParams.get('highlight'), target, 'drag does not select a node');
  const afterPan = await transform(page);
  await touch(session, 'touchStart', [{ x: x - 34, y, id: 1 }]);
  await touch(session, 'touchStart', [{ x: x - 34, y, id: 1 }, { x: x + 34, y, id: 2 }]);
  await touch(session, 'touchMove', [{ x: x - 58, y, id: 1 }, { x: x + 58, y, id: 2 }]);
  await touch(session, 'touchEnd', []);
  await page.waitForTimeout(80);
  assert.notEqual((await transform(page)).match(/scale\(([^)]+)/)[1], afterPan.match(/scale\(([^)]+)/)[1], 'two-finger pinch changes scale');
  assert.equal(new URL(page.url()).searchParams.get('highlight'), target, 'pinch does not select a node');
  await session.detach();
}

try {
  for (const locale of ['ru', 'kk']) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    page.setDefaultTimeout(15_000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${base}/${locale}/shezhire-tree?view=reference&highlight=${target}`);
    await page.locator('.tt-preview h3').waitFor();
    assert.equal(await page.locator('.tt-preview h3').textContent(), locale === 'kk' ? 'Сүзік' : 'Сузик');
    await Promise.all([treeNode(page, parent).waitFor(), ...siblings.map(id => treeNode(page, id).waitFor())]);
    assert.ok(await page.locator('.tt-viewport').isVisible(), 'mobile keeps the tree visible');
    await page.waitForFunction(ids => ids.every(id => {
      const node = document.querySelector(`[data-node-id="${id}"]`).getBoundingClientRect();
      const viewport = document.querySelector('.tt-viewport').getBoundingClientRect();
      const preview = document.querySelector('.tt-preview').getBoundingClientRect();
      return node.left >= viewport.left && node.right <= viewport.right && node.top >= viewport.top + 64 && node.bottom <= preview.top;
    }), [target, parent, ...siblings]);
    await page.screenshot({ path: `${out}/${locale}-mobile-page.png` });
    await page.locator('.tt-stage').screenshot({ path: `${out}/${locale}-mobile-compact.png` });

    await panAndPinch(page);
    const changed = await transform(page);
    await page.locator('.tt-preview-more').click();
    const sheet = page.locator('.tt-sheet[open]');
    await sheet.waitFor();
    const returnToTree = sheet.getByRole('button', { name: locale === 'kk' ? 'Ағашқа оралу' : 'Вернуться к дереву', exact: true });
    await returnToTree.focus();
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.querySelector('.tt-sheet[open]')?.contains(document.activeElement)), true, 'native dialog keeps keyboard focus inside the sheet');
    assert.equal(await sheet.evaluate(el => {
      const style = getComputedStyle(el);
      return style.overscrollBehaviorY === 'contain' && style.touchAction === 'pan-y';
    }), true, 'sheet scroll stays isolated');
    await page.mouse.move(180, 600);
    await page.mouse.wheel(0, 480);
    if (await sheet.evaluate(el => el.scrollHeight > el.clientHeight)) {
      await page.waitForFunction(() => document.querySelector('.tt-sheet').scrollTop > 0);
    }
    assert.equal(await transform(page), changed, 'scrolling actual detail content does not move the tree');
    await sheet.evaluate(el => { el.scrollTop = 0; });
    await sheet.screenshot({ path: `${out}/${locale}-mobile-expanded.png` });
    await page.keyboard.press('Escape');
    await page.locator('.tt-sheet[open]').waitFor({ state: 'detached' });
    assert.equal(await transform(page), changed, 'closing the sheet preserves the tree transform');
    assert.ok(await page.locator('.tt-preview').isVisible(), 'Escape restores the compact preview');
    assert.equal(await page.locator('.tt-preview-more').evaluate(el => el === document.activeElement), true, 'focus returns to More');
    await page.locator('.tt-preview-more').click();
    await returnToTree.click();
    assert.equal(await transform(page), changed, 'close button preserves transform');
    await page.locator('.tt-preview-close').click();
    assert.equal(await page.locator('.tt-preview').count(), 0);
    assert.equal(await transform(page), changed, 'closing preview preserves transform');

    await treeNode(page, siblings[0]).focus();
    await page.keyboard.press('Enter');
    await page.waitForFunction(id => new URL(location.href).searchParams.get('highlight') === id, siblings[0]);
    await page.locator('.tt-preview h3').waitFor();
    assert.equal(await page.locator('.tt-preview h3').textContent(), 'Байсары');
    await page.locator('#tribe-tree-search').fill('Сузик');
    const hit = page.locator('.tt-search-results button').filter({ has: page.locator('span').getByText(locale === 'kk' ? 'Сүзік' : 'Сузик', { exact: true }) });
    await hit.focus();
    await page.keyboard.press('Enter');
    await page.waitForFunction(id => new URL(location.href).searchParams.get('highlight') === id, target);
    await page.reload();
    await page.locator('.tt-preview h3').getByText(locale === 'kk' ? 'Сүзік' : 'Сузик', { exact: true }).waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'mobile document has no horizontal overflow');
    await page.locator('.tt-context button').click();
    await page.locator('.tt-preview-more').click();
    await sheet.waitFor();
    const beforeScroll = await transform(page);
    await page.mouse.move(180, 600);
    await page.mouse.wheel(0, 600);
    await page.waitForFunction(() => document.querySelector('.tt-sheet').scrollTop > 0);
    assert.equal(await transform(page), beforeScroll, 'long branch sheet scroll preserves transform');
    await page.keyboard.press('Escape');
    const otherLocale = locale === 'ru' ? 'kk' : 'ru';
    await page.locator('.lang-switcher').getByRole('button', { name: otherLocale.toUpperCase(), exact: true }).click();
    await page.waitForURL(url => url.pathname.startsWith(`/${otherLocale}/`));
    await page.locator('.tt-preview h3').getByText('Байлы', { exact: true }).waitFor();
    assert.equal(new URL(page.url()).searchParams.get('highlight'), parent, 'language switch retains selected branch');
    assert.deepEqual(errors, [], 'mobile page has no browser errors');
    console.log(`PASS: ${locale}/390x844 deep link, context siblings, touch pan/pinch, preview/sheet, search/reload, overflow.`);
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    let release;
    const delayed = new Promise(resolve => { release = resolve; });
    await page.route('**/api/genealogy/children?**', async route => { await delayed; await route.continue(); });
    await page.goto(`${base}/ru/shezhire-tree?view=reference&highlight=${target}`);
    await page.locator('.tt-load-status[role="status"]').waitFor();
    await panAndPinch(page);
    const manualView = await transform(page);
    release();
    await treeNode(page, siblings[0]).waitFor();
    await page.waitForTimeout(150);
    assert.equal(await transform(page), manualView, 'late children response must not undo manual pan or zoom');
    console.log('PASS: delayed neighbour load preserves manual pan and zoom.');
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    let fail = true;
    await page.route('**/api/genealogy/children?**', async route => {
      if (new URL(route.request().url()).searchParams.get('node') === parent && fail) {
        fail = false;
        await route.fulfill({ status: 503, json: { error: 'genealogy_unavailable' } });
      } else await route.continue();
    });
    await page.goto(`${base}/ru/shezhire-tree?view=reference&highlight=${target}`);
    await page.locator('.tt-load-status[role="alert"]').waitFor();
    await page.locator('.tt-load-status button').click();
    await treeNode(page, siblings[0]).waitFor();
    assert.equal(await page.locator('.tt-load-status[role="alert"]').count(), 0, 'parent retry recovers siblings');
    await page.goto(`${base}/ru/shezhire-tree?view=reference`);
    await treeNode(page, 'alash').waitFor();
    assert.equal(await page.locator('.tt-preview').count(), 0, 'root starts with tree only');
    await treeNode(page, 'zhuz:uly').tap();
    await page.locator('.tt-preview h3').getByText('Старший жуз', { exact: true }).waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    console.log('PASS: 360x740 root tap, parent load failure and retry.');
    await context.close();
  }

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(`${base}/ru/shezhire-tree?view=reference&highlight=${target}`);
  await treeNode(page, target).waitFor();
  assert.ok(await page.locator('.tt-desktop-detail .tt-detail h3').getByText('Сузик', { exact: true }).isVisible());
  await page.locator('.tt-stage').screenshot({ path: `${out}/ru-desktop-tree.png` });
  const box = await page.locator('.tt-viewport').boundingBox();
  const desktopView = await transform(page);
  await page.mouse.move(box.x + box.width / 2, box.y + 140);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 70, box.y + 190, { steps: 5 });
  await page.mouse.up();
  assert.notEqual(await transform(page), desktopView, 'desktop mouse drag pans');
  const pannedDesktop = await transform(page);
  await page.getByRole('button', { name: 'Приблизить', exact: true }).click();
  assert.notEqual(await transform(page), pannedDesktop, 'desktop zoom control changes scale');
  await page.screenshot({ path: `${out}/ru-desktop-page.png` });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'desktop document has no horizontal overflow');
  console.log('PASS: ru/1440x900 desktop deep link and screenshots.');
  await context.close();
} finally {
  await browser.close();
}
