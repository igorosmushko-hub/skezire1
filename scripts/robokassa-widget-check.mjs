// NODE_PATH=<shared node_modules> node scripts/robokassa-widget-check.mjs
// Uses the official SDK but intercepts its form submission: no invoices or payments.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ts = require('typescript');
const sdkUrl = 'https://auth.robokassa.kz/Merchant/bundle/robokassa_iframe.js';
const sdk = process.env.ROBOKASSA_SDK_FILE
  ? readFileSync(process.env.ROBOKASSA_SDK_FILE, 'utf8')
  : await fetch(sdkUrl, { signal: AbortSignal.timeout(15000) }).then(r => {
    assert.ok(r.ok); return r.text();
  });
const sources = {};
for (const [id, file] of Object.entries({
  react: 'react/cjs/react.development.js',
  'react-dom': 'react-dom/cjs/react-dom.development.js',
  'react-dom/client': 'react-dom/cjs/react-dom-client.development.js',
  'react/jsx-runtime': 'react/cjs/react-jsx-runtime.development.js',
  scheduler: 'scheduler/cjs/scheduler.development.js',
})) sources[id] = readFileSync(`node_modules/${file}`, 'utf8');
sources.widget = ts.transpileModule(readFileSync('src/components/RobokassaWidget.tsx', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
}).outputText;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const cancelBeforeLoad of [false, true]) {
    const page = await browser.newPage();
    const errors = [];
    let scriptRequests = 0;
    let releaseSdk;
    const ready = new Promise(resolve => { releaseSdk = resolve; });
    await page.route('**/*', async route => {
      if (route.request().url() === sdkUrl) {
        scriptRequests++;
        await ready;
        await route.fulfill({ contentType: 'text/javascript', body: sdk });
      } else if (route.request().url() === 'http://widget.test/') {
        await route.fulfill({ contentType: 'text/html', body: '<div id="root"></div>' });
      } else await route.abort();
    });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://widget.test/');
    await page.addStyleTag({ content: readFileSync('src/styles/robokassa-widget.css', 'utf8') });
    await page.evaluate(sources => {
      const cache = { '@/styles/robokassa-widget.css': { exports: {} } };
      const load = id => {
        if (cache[id]) return cache[id].exports;
        const loaded = cache[id] = { exports: {} };
        new Function('require', 'module', 'exports', 'process', sources[id])(
          load, loaded, loaded.exports, { env: { NODE_ENV: 'development' } },
        );
        return loaded.exports;
      };
      const React = load('react');
      const ReactDOM = load('react-dom');
      const { RobokassaWidget } = load('widget');
      const root = load('react-dom/client').createRoot(document.getElementById('root'));
      const params = { MerchantLogin: 'synthetic', OutSum: '1.00', InvId: 1, Email: undefined };
      window.submissions = [];
      window.widgetClosures = [];
      HTMLFormElement.prototype.submit = function () {
        window.submissions.push(Object.fromEntries(new FormData(this)));
      };
      document.body.style.overflow = 'auto';
      document.body.style.width = '91%';
      window.renderWidget = (open, version = 1) => ReactDOM.flushSync(() => root.render(
        React.createElement(React.StrictMode, null, open ? React.createElement(RobokassaWidget, {
          params, fallbackUrl: 'http://widget.test/fallback',
          onClose: () => { window.widgetClosures.push(version); window.renderWidget(false); },
        }) : null),
      ));
      window.renderWidget(true);
    }, sources);
    await page.waitForFunction(() => document.querySelector('script[src*="robokassa_iframe.js"]'));
    await page.evaluate(cancel => window.renderWidget(!cancel, 2), cancelBeforeLoad);
    releaseSdk();
    await page.waitForFunction(() => Boolean(window.Robokassa));
    if (cancelBeforeLoad) {
      assert.equal(await page.locator('#robokassa_iframe').count(), 0);
      assert.equal(await page.evaluate(() => window.submissions.length), 0);
      await page.evaluate(() => window.renderWidget(true, 3));
    }
    await page.locator('#robokassa_iframe').waitFor({ state: 'attached' });
    assert.equal(await page.evaluate(() => window.submissions.length), 1, 'StrictMode must start once');
    const submitted = await page.evaluate(() => window.submissions[0]);
    assert.deepEqual(Object.keys(submitted).sort(), ['InvId', 'MerchantLogin', 'OutSum', 'Settings']);
    assert.equal(await page.locator('form[target="robokassa_iframe"]').count(), 0);
    await page.evaluate(() => window.renderWidget(true, 4));
    assert.equal(await page.evaluate(() => window.submissions.length), 1, 'parent rerender must not restart');
    await page.evaluate(() => {
      const source = document.querySelector('#robokassa_iframe').contentWindow;
      window.dispatchEvent(new MessageEvent('message', { origin: 'https://untrusted.test', source,
        data: { type: 'robokassa-payment', status: 'success' } }));
      window.dispatchEvent(new MessageEvent('message', { origin: location.origin, source: window,
        data: { type: 'robokassa-payment', status: 'fail' } }));
    });
    assert.equal(await page.evaluate(() => window.widgetClosures.length), 0);
    await page.getByRole('button', { name: 'Прервать оплату' }).click();
    assert.deepEqual(await page.evaluate(() => window.widgetClosures), [4]);
    assert.equal(await page.locator('#robokassa_iframe').count(), 0);
    assert.deepEqual(await page.evaluate(() => [document.body.style.overflow, document.body.style.width]), ['auto', '91%']);
    await page.evaluate(() => window.renderWidget(true, 5));
    await page.locator('#robokassa_iframe').waitFor({ state: 'attached' });
    assert.equal(await page.locator('#robokassa_iframe').count(), 1);
    await page.evaluate(() => window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://auth.robokassa.kz', data: { action: 'closeRobokassaFrame' },
    })));
    await page.waitForFunction(() => window.widgetClosures.length === 2);
    assert.equal(await page.locator('#robokassa_iframe').count(), 0);
    assert.equal(scriptRequests, 1, 'SDK must load only once across remounts');
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log('PASS official SDK: StrictMode, delayed load/cancellation, rerender, close/reopen, restored scroll, one script and rejected untrusted messages. No payment submitted.');
} finally { await browser.close(); }
