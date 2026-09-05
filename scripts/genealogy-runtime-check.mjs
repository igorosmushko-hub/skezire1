// Offline contract checks against the real adapter and route modules. No DB/network.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as jsxRuntime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import * as tree from '../src/lib/tribe-tree.ts';
import { buildTribeTree } from '../src/lib/tribe-tree-page.ts';
import { TRIBES_DB } from '../src/data/tribes.ts';
function load(file, dependencies, env = {}) {
  const loadedModule = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX,
  }}).outputText;
  vm.runInNewContext(code, { AbortSignal, Error, module: loadedModule, exports: loadedModule.exports, process: { env }, URL,
    require: name => { if (!(name in dependencies)) throw Error(`Unexpected import ${name}`); return dependencies[name]; } });
  return loadedModule.exports;
}
const queries = [];
let responses = [];
const sql = async (strings, ...values) => {
  queries.push({ query: strings.join('?'), values });
  if (!responses.length) throw Error('Unexpected DB call');
  const result = responses.shift();
  if (result instanceof Error) throw result;
  return result;
};
const dependencies = { 'server-only': {}, '@neondatabase/serverless': { neon: () => sql },
  '../data/tribes': { TRIBES_DB }, './tribe-tree': tree, './tribe-tree-page': { buildTribeTree } };
const adapter = env => load('src/lib/genealogy-data.ts', dependencies, env);
const config = { GENEALOGY_SOURCE: 'snapshot', GENEALOGY_ROOT_KEY: 'snapshot:1', GENEALOGY_DATABASE_URL: 'synthetic-test-only' };
for (const env of [{}, config, { ...config, GENEALOGY_SOURCE: 'repo' }]) {
  assert.equal((await adapter(env).getInitialGenealogyTree('ru')).source, 'repo');
}
await assert.rejects(adapter({ ...config, GENEALOGY_SOURCE: 'repo' }).getInitialGenealogyTree('ru', '999'), /focus_unavailable/);
await assert.rejects(adapter(config).getInitialGenealogyTree('ru', 'tribe:missing'), /focus_unavailable/);
await assert.rejects(adapter({ ...config, GENEALOGY_INCLUDE_PRIVATE: '1' }).getInitialGenealogyTree('ru', 'tribe:naiman'), /private_mode_forbidden/);
assert.equal(queries.length, 0);
assert.equal((await adapter(config).getInitialGenealogyTree('kk', 'alash')).source, 'repo');
const legacy = await adapter(config).getInitialGenealogyTree('ru', 'tribe:naiman');
assert.equal(legacy.source, 'repo');
assert.equal(tree.findTreePath(legacy.tree, legacy.focusId).at(-1).id, 'tribe:naiman');
assert.equal(queries.length, 0);
responses = [new Error('synthetic_db_failure')];
await assert.rejects(adapter(config).getInitialGenealogyTree('ru', 'snapshot:1'), /synthetic_db_failure/);
const root = { node_key: 'snapshot:1', parent_key: null, name: 'Synthetic root', depth: 0, has_children: true };
responses = [[{ ...root, node_key: 'different:root' }]];
assert.equal((await adapter(config).getPublicGenealogyPath('123')).length, 0);
responses = [[root, { node_key: 'snapshot:123', parent_key: root.node_key, name: 'Synthetic target', depth: 1 }]];
assert.equal((await adapter(config).getPublicGenealogyPath('123')).at(-1).id, 'snapshot:123');
responses = [Array.from({ length: 101 }, (_, i) => ({ node_key: `snapshot:${i + 2}`, name: `Synthetic ${i}`, depth: 1 }))];
const page = await adapter(config).getPublicGenealogyChildren(root.node_key, 0);
assert.equal(page.children.length, 100);
assert.equal(page.nextOffset, 100);
for (const { query } of queries) {
  assert.match(query, /is_public/);
  assert.doesNotMatch(query, /\blocked\b/);
  assert.match(query, /reviewed_at IS NOT NULL/);
  assert.match(query, /publication_basis/);
}
const response = { NextResponse: { json: (body, init) => ({ body, status: init?.status ?? 200 }) } };
const route = load('src/app/api/genealogy/children/route.ts', { 'next/server': response,
  '@/lib/genealogy-data': { getPublicGenealogyChildren: async () => null, getRepositoryChildren: () => null } }, config);
for (const offset of ['-1', '1.5', 'NaN', '1000001']) {
  assert.equal((await route.GET(new Request(`http://localhost/api?node=snapshot:1&source=snapshot&offset=${offset}`))).status, 400);
}
assert.equal((await route.GET(new Request('http://localhost/api?node=snapshot:1&source=snapshot'))).status, 404);
// Render the actual page with the actual adapter; only the DB transport is synthetic.
const renderPage = async (locale, highlight, env = config) => {
  const { default: Page } = load('src/app/[locale]/shezhire-tree/page.tsx', {
    'react/jsx-runtime': jsxRuntime, 'next/link': { default: 'a' },
    '@/components/tribe-tree/InteractiveTree': { InteractiveTree: () => jsxRuntime.jsx('div', { 'data-test-tree': true }) },
    '@/data/tribes': { TRIBES_DB }, '@/lib/genealogy-data': adapter(env), '@/lib/tribe-tree': tree,
    '@/styles/shezhire-tree.css': {}, '@/styles/tribe-race.css': {},
  });
  return renderToStaticMarkup(await Page({ params: Promise.resolve({ locale }), searchParams: Promise.resolve({ highlight }) }));
};
for (const locale of ['ru', 'kk']) {
  const missingText = locale === 'ru' ? 'Ветвь не найдена или недоступна' : 'Тармақ табылмады немесе қолжетімсіз';
  const outageText = locale === 'ru' ? 'Сейчас не удалось подключиться' : 'Жария дереккөзге қазір қосылу мүмкін емес';
  const deniedPages = [];
  // A visible target below a private ancestor has an incomplete filtered path.
  for (const focus of ['snapshot:missing', 'snapshot:private', 'snapshot:private-ancestor']) {
    const focusRows = focus === 'snapshot:private-ancestor'
      ? [{ node_key: focus, parent_key: 'snapshot:filtered-parent', name: 'private-path-detail', depth: 2 }]
      : [];
    responses = [[root], [], focusRows];
    const html = await renderPage(locale, focus);
    assert.match(html, new RegExp(missingText));
    assert.ok(!html.includes(outageText) && !html.includes(focus) && !html.includes('private-path-detail'));
    assert.ok(html.includes(`href="/${locale}/shezhire-tree"`));
    assert.ok(html.includes('id="tribe-directory"') && !html.includes('data-test-tree'));
    deniedPages.push(html);
    assert.equal(responses.length, 0);
  }
  assert.ok(deniedPages.every(html => html === deniedPages[0]));
  for (const failure of [[], new Error('database-private-detail')]) {
    responses = [failure];
    const html = await renderPage(locale, 'snapshot:missing');
    assert.ok(html.includes(outageText) && !html.includes(missingText));
    assert.ok(!html.includes('database-private-detail'));
    assert.equal(responses.length, 0);
  }
  assert.ok((await renderPage(locale, undefined, {})).includes('data-test-tree'));
  responses = [];
  assert.ok((await renderPage(locale)).includes('data-test-tree'));
  assert.equal(responses.length, 0);
  assert.ok((await renderPage(locale, 'naiman')).includes('data-test-tree'));
}
console.log('PASS: repo is the default without DB calls even with stale DSN; external DB errors fail closed, private bypass rejected, legacy links, rooted paths, bounded children and API validation. Synthetic data only; does not prove live SQL or full DB performance.');
console.log('PASS: RU/KK unavailable links are indistinguishable for missing/private paths, recover to root, and remain distinct from source outages.');
