// Run against the local preview: node scripts/verify-reference-pilot.mjs [base URL]
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const require = createRequire(import.meta.url);
function load(source) {
  const loaded = { exports: {} };
  const { outputText } = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX,
  }});
  new Function('require', 'module', 'exports', outputText)(require, loaded, loaded.exports);
  return loaded.exports;
}
const baseline = load(execFileSync('git', ['show', 'fd29cf3:src/data/tribes.ts'], { encoding: 'utf8' })).TRIBES_DB;
const { TRIBES_DB } = load(readFileSync('src/data/tribes.ts', 'utf8'));
const enrichedIds = ['dulat', 'jalayir', 'sirgeli', 'alban', 'suan', 'shapyrashty'];
const tribes = TRIBES_DB.flatMap(section => section.tribes);
const baselineTribes = baseline.flatMap(section => section.tribes);

assert.equal(tribes.length, baselineTribes.length, 'tribe count changed');
assert.deepEqual(tribes.map(tribe => tribe.id), baselineTribes.map(tribe => tribe.id), 'tribe IDs or order changed');
for (const section of baseline) {
  const current = TRIBES_DB.find(item => item.id === section.id);
  assert.deepEqual({ ...current, tribes: [] }, { ...section, tribes: [] }, `${section.id}: section changed`);
  for (const tribe of section.tribes.filter(item => !enrichedIds.includes(item.id))) {
    assert.deepEqual(current.tribes.find(item => item.id === tribe.id), tribe, `${tribe.id}: outside release scope`);
  }
}

function branches(items = []) { return items.flatMap(item => [item, ...branches(item.children)]); }
function assertSources(sources, label) {
  assert.ok(Array.isArray(sources) && sources.length > 0, `${label}: missing sources`);
  for (const source of sources) {
    assert.ok(source.title && /^https:\/\//.test(source.url), `${label}: invalid source`);
    assert.ok(source.locator_kk && source.locator_ru, `${label}: missing bilingual locator`);
    if (source.sourceVersion !== undefined) assert.equal(typeof source.sourceVersion, 'string', `${label}: invalid sourceVersion`);
  }
}
for (const id of enrichedIds) {
  const tribe = tribes.find(item => item.id === id);
  assert.ok(tribe, `${id}: missing tribe`);
  assert.equal(tribe.updatedAt, '2026-09-06', `${id}: missing release date`);
  assertSources(tribe.sources, id);
  assert.deepEqual(tribe.notable, []);
  assert.equal(tribe.tamga, '');
  assert.equal(tribe.uran, '');
  for (const branch of branches(tribe.subtribes)) {
    assert.ok(branch.id && branch.kk && branch.ru, `${id}: incomplete branch`);
    if (branch.note) assert.ok(branch.note.kk && branch.note.ru, `${branch.id}: incomplete bilingual note`);
    if (branch.aliases) assert.ok(branch.aliases.every(alias => typeof alias === 'string' && alias), `${branch.id}: invalid aliases`);
    if (branch.sources) assertSources(branch.sources, branch.id);
  }
}

const { LinkedText } = load(readFileSync('src/components/LinkedText.tsx', 'utf8'));
const linked = renderToStaticMarkup(React.createElement(LinkedText, { text: 'салыстыру Ысты. Дулаттан Дулат — Дулат', locale: 'kk' }));
assert.equal((linked.match(/href=/g) ?? []).length, 2);
assert.ok(linked.includes('салыстыру <a') && linked.includes('>Ысты</a>'));
assert.ok(linked.includes('Дулаттан <a') && linked.endsWith('</a> — Дулат</p>'));
assert.ok(!renderToStaticMarkup(React.createElement(LinkedText, { text: 'Дулат', locale: 'ru', selfPath: '/encyclopedia/uly/dulat' })).includes('href='));

const base = process.argv[2] ?? 'http://127.0.0.1:3423';
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(base).hostname), 'Use a local preview');
const sitemapResponse = await fetch(`${base}/sitemap.xml`);
assert.equal(sitemapResponse.status, 200, 'sitemap');
const sitemap = await sitemapResponse.text();
for (const id of enrichedIds) {
  const tribe = tribes.find(item => item.id === id);
  for (const locale of ['ru', 'kk']) {
    const route = `/${locale}/encyclopedia/uly/${id}`;
    const response = await fetch(base + route);
    assert.equal(response.status, 200, route);
    const html = await response.text();
    const article = html.match(/<article\b[\s\S]*?<\/article>/)?.[0] ?? '';
    assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1, route);
    assert.ok(article.includes(locale === 'ru' ? 'Источники' : 'Дереккөздер'), `${route}: sources section`);
    assert.ok(article.includes(`view=reference&amp;highlight=tribe%3A${id}`), `${route}: map link`);
    const keywords = html.match(/<meta name="keywords" content="([^"]*)"/)?.[1];
    assert.ok(keywords && !/тамга|тамға|ұран|уран/.test(keywords));
    assert.ok(article.includes(tribe.sources[0].url.replaceAll('&', '&amp;')), `${route}: source URL`);
    for (const branch of branches(tribe.subtribes)) {
      assert.ok(article.includes(`id="branch-${branch.id}"`), `${route}: branch anchor ${branch.id}`);
    }
    assert.ok(html.includes(`<link rel="canonical" href="https://skezire.kz${route}"`), `${route}: canonical`);
    for (const lang of ['ru', 'kk']) assert.ok(html.includes(`hrefLang="${lang}" href="https://skezire.kz/${lang}/encyclopedia/uly/${id}"`), `${route}: ${lang} hreflang`);
    const schemas = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(match => JSON.parse(match[1]));
    const schema = schemas.find(item => item['@type'] === 'Article');
    assert.equal(schema.datePublished, undefined);
    assert.equal(schema.dateModified, tribe.updatedAt, `${route}: JSON-LD date`);
    assert.deepEqual(schema.citation, tribe.sources.map(source => source.url), `${route}: JSON-LD citations`);
    assert.ok(sitemap.includes(`<loc>https://skezire.kz${route}</loc>\n<lastmod>2026-09-06T00:00:00.000Z</lastmod>`), `${route}: sitemap date`);
    assert.equal((article.match(/class="tribe-subtribe-tag"/g) ?? []).length, branches(tribe.subtribes).length);
    for (const parent of [{id: `tribe:${id}`, children: tribe.subtribes}, ...branches(tribe.subtribes).filter(b => b.children?.length).map(b => ({id:`subtribe:${b.id}`, children:b.children}))]) {
      const res = await fetch(`${base}/api/genealogy/children?source=repo&locale=${locale}&node=${encodeURIComponent(parent.id)}`);
      assert.equal(res.status, 200);
      const { children } = await res.json();
      assert.deepEqual(children.map(child => child.id), parent.children.map(child => `subtribe:${child.id}`));
      for (const child of children) assert.ok(child.href.endsWith(`#branch-${child.id.slice(9)}`));
    }
  }
}
console.log('PASS: release scope, Unicode links, enriched sources, branch anchors, SSR metadata and sitemap.');

for (const locale of ['ru', 'kk']) {
  const res = await fetch(`${base}/${locale}/encyclopedia`);
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.ok(!/полная история|толық тарих|Полный справочник всех|толық анықтамалығы/.test(html), 'hub must describe bounded reference content');
  assert.ok(html.includes(locale === 'ru' ? 'карта' : 'карта'));
}
