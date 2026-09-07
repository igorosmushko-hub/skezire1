// Run with Node; playwright must be available (e.g. via NODE_PATH to the shared runtime).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ts = require('typescript');
const componentPath = process.env.PROFILE_SOURCE || 'src/app/[locale]/profile/ProfilePageClient.tsx';
const sources = {};
for (const [id, file] of Object.entries({
  react: 'react/cjs/react.production.js',
  'react-dom': 'react-dom/cjs/react-dom.production.js',
  'react-dom/client': 'react-dom/cjs/react-dom-client.production.js',
  'react/jsx-runtime': 'react/cjs/react-jsx-runtime.production.js',
  scheduler: 'scheduler/cjs/scheduler.production.js',
})) sources[id] = readFileSync(`node_modules/${file}`, 'utf8');
sources.profile = ts.transpileModule(readFileSync(componentPath, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 },
}).outputText;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setContent('<div id="root"></div>');
  await page.evaluate(sources => {
    const cache = {};
    const load = id => {
      if (cache[id]) return cache[id].exports;
      const loaded = cache[id] = { exports: {} };
      new Function('require', 'module', 'exports', sources[id])(load, loaded, loaded.exports);
      return loaded.exports;
    };
    const React = load('react');
    const ReactDOM = load('react-dom');
    window.auth = { user: null, loading: true, logout() {} };
    window.redirects = [];
    const router = { replace: path => window.redirects.push(path) };
    Object.assign(cache, {
      'next-intl': { exports: { useTranslations: () => key => key } },
      'next/link': { exports: { default: props => React.createElement('a', props) } },
      'next/navigation': { exports: { useRouter: () => router } },
      '@/components/AuthProvider': { exports: { useAuth: () => window.auth } },
      '@/components/LoginModal': { exports: { LoginModal: () => null } },
      '@/data/tribes': { exports: { TRIBES_DB: [] } },
      '@/styles/profile.css': { exports: {} },
      '@/styles/order.css': { exports: {} },
    });
    window.requests = [];
    window.fetch = (url, options = {}) => new Promise((resolve, reject) => {
      // Deliberately resolve even aborted requests to verify stale-response guards.
      window.requests.push({ url, signal: options.signal, resolve, reject });
    });
    window.finish = (index, data, ok = true) => window.requests[index].resolve({ ok, json: async () => data });
    const root = load('react-dom/client').createRoot(document.getElementById('root'));
    const { ProfilePageClient } = load('profile');
    window.renderUser = id => {
      window.auth = { ...window.auth, user: id ? { id, phone: id } : null, loading: false };
      ReactDOM.flushSync(() => root.render(React.createElement(ProfilePageClient, { locale: 'ru' })));
      return document.body.textContent;
    };
  }, sources);
  const settle = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const requests = () => page.evaluate(() => window.requests.map(r => ({ url: r.url, aborted: r.signal?.aborted ?? false })));
  const waitRequests = count => page.waitForFunction(count => window.requests.length === count, count);
  const finishProfile = (offset, id) => page.evaluate(({ offset, id }) => {
    window.finish(offset, { profile: { id, phone: `phone-${id}`, firstName: id, lastName: '', createdAt: '2026-01-01', remaining: 1 } });
    window.finish(offset + 1, { generations: [] });
    window.finish(offset + 2, { orders: [] });
  }, { offset, id });
  await page.evaluate(() => window.renderUser('A'));
  await waitRequests(3);
  assert.ok((await requests()).every(r => r.url !== '/api/payments/my'));
  await finishProfile(0, 'A');
  await page.getByText('phone-A', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'tabPayments', exact: true }).click();
  await waitRequests(4);
  await page.evaluate(() => window.finish(3, { payments: [{ id: 'p-A', status: 'paid', amount_kzt: 111, created_at: '2026-01-01', packages: { name_ru: 'package-A', generations: 1 } }] }));
  await page.getByText('package-A', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'tabProfile', exact: true }).click();
  const immediate = await page.evaluate(() => window.renderUser('B'));
  assert.ok(!immediate.includes('phone-A'), 'A data must disappear in the first B render');
  await waitRequests(7);
  await page.getByRole('button', { name: 'tabPayments', exact: true }).click();
  await waitRequests(8);
  assert.ok(!(await page.textContent('body')).includes('package-A'));
  // B requests remain pending when C replaces it, including payments.
  await page.evaluate(() => window.renderUser('C'));
  await waitRequests(11);
  assert.ok((await requests()).slice(4, 8).every(r => r.aborted), 'B reads must be aborted');
  await finishProfile(8, 'C');
  await page.getByText('phone-C', { exact: true }).waitFor();
  await finishProfile(4, 'B');
  await page.evaluate(() => window.finish(7, { payments: [{ id: 'p-B', status: 'paid', amount_kzt: 222, created_at: '2026-01-01', packages: { name_ru: 'package-B', generations: 1 } }] }));
  await settle();
  assert.ok(!(await page.textContent('body')).includes('phone-B'));
  const nameField = page.locator('input').nth(1);
  await nameField.fill('unsaved-C');
  await page.evaluate(() => window.renderUser('C'));
  await settle();
  assert.equal(await nameField.inputValue(), 'unsaved-C');
  assert.equal((await requests()).length, 11, 'Same user refresh preserves edits and does not reload');
  await page.getByRole('button', { name: 'tabPayments', exact: true }).click();
  await waitRequests(12);
  await page.getByRole('button', { name: 'tabProfile', exact: true }).click();
  assert.ok((await requests())[11].aborted, 'Leaving payments aborts an unfinished read');
  await page.getByRole('button', { name: 'tabPayments', exact: true }).click();
  await waitRequests(13);
  await page.evaluate(() => window.finish(12, { payments: [] }));
  await page.getByText('noPayments', { exact: true }).waitFor();
  await page.evaluate(() => window.finish(11, { payments: [{ id: 'stale', status: 'paid', amount_kzt: 999, created_at: '2026-01-01', packages: { name_ru: 'stale-payment', generations: 1 } }] }));
  await settle();
  assert.ok(!(await page.textContent('body')).includes('stale-payment'));
  await page.getByRole('button', { name: 'tabProfile', exact: true }).click();
  await page.getByRole('button', { name: 'tabPayments', exact: true }).click();
  assert.equal((await requests()).length, 13, 'Loaded empty payments are cached');
  await page.evaluate(() => window.renderUser('D'));
  await waitRequests(16);
  await page.evaluate(() => {
    window.finish(13, { profile: { phone: 'invalid-response' } }, false);
    window.requests[14].reject(new Error('offline'));
    window.finish(15, { orders: [] });
  });
  await settle();
  assert.ok(!(await page.textContent('body')).includes('invalid-response'));
  assert.equal(await page.locator('.profile-empty').count(), 0, 'Initial failures stop the loading state');
  await page.getByRole('button', { name: 'tabPayments', exact: true }).click();
  await waitRequests(17);
  await page.evaluate(() => window.finish(16, { payments: [] }, false));
  await settle();
  assert.equal(await page.getByText('noPayments', { exact: true }).count(), 0, 'HTTP errors are not cached as empty payments');
  await page.getByRole('button', { name: 'tabProfile', exact: true }).click();
  await page.getByRole('button', { name: 'tabPayments', exact: true }).click();
  await waitRequests(18);
  const loggedOut = await page.evaluate(() => window.renderUser(null));
  assert.ok(!loggedOut.includes('phone-C') && !loggedOut.includes('noPayments'));
  await page.waitForFunction(() => window.redirects.includes('/ru'));
  assert.ok((await requests())[17].aborted, 'Logout aborts pending payments');
  await page.evaluate(() => window.renderUser('E'));
  await waitRequests(21);
  await finishProfile(18, 'E');
  await page.getByText('phone-E', { exact: true }).waitFor();
  await page.locator('input').nth(1).fill('edited-E');
  await page.getByRole('button', { name: 'save', exact: true }).click();
  await waitRequests(22);
  await page.evaluate(() => window.renderUser('F'));
  await waitRequests(25);
  await finishProfile(22, 'F');
  await page.getByText('phone-F', { exact: true }).waitFor();
  await page.locator('input').nth(1).fill('draft-F');
  await page.evaluate(() => window.finish(21, {}));
  await settle();
  assert.equal(await page.locator('input').nth(1).inputValue(), 'draft-F');
  assert.ok(await page.getByRole('button', { name: 'save', exact: true }).isEnabled(), 'An old save cannot change the new form state');
  assert.deepEqual(errors, []);
  console.log('PASS: lazy/cached payments, first-render user isolation, abort/stale responses, tab retry, same-user edits, HTTP/network failures, logout, pending save isolation');
} finally {
  await browser.close();
}
