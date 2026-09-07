// Offline regression: node scripts/seo-runtime-check.mjs
// Executes the real TS/TSX handlers with in-memory dependencies; sends no events or payments.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const load = (file, dependencies = {}, globals = {}) => {
  const loadedModule = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX,
  }}).outputText;
  vm.runInNewContext(code, { module: loadedModule, exports: loadedModule.exports,
    require: name => name in dependencies ? dependencies[name] : name === 'react/jsx-runtime' ? require(name) : name.endsWith('.css') ? {} : (() => { throw Error(`Unmocked import: ${name}`); })(),
    ...globals,
  }, { filename: file });
  return loadedModule.exports;
};
const calls = [];
const analytics = load('src/lib/analytics.ts', {}, { window: { ym: (...args) => calls.push(args) } });
analytics.treeFormSubmit();
assert.equal(calls[0][0], 107086067);
assert.equal(calls[0][1], 'reachGoal');
assert.equal(calls[0][2], 'tree_form_submit');
load('src/lib/analytics.ts').treeDownload(); // SSR without window is safe.
const hooks = (values = []) => {
  let index = 0;
  const updates = [];
  return { updates, useState: initial => {
    const position = index++;
    return [position < values.length ? values[position] : initial, value => updates.push([position, value])];
  }, useRef: () => ({ current: null }), useCallback: fn => fn, useEffect: () => {} };
};
const elements = (node, type) => {
  if (!node || typeof node !== 'object') return [];
  if (Array.isArray(node)) return node.flatMap(item => elements(item, type));
  return [...(node.type === type ? [node] : []), ...elements(node.props?.children, type)];
};
const intl = { useTranslations: () => key => key };
// Map integration: both locales expose the existing route; language changes retain focus.
for (const locale of ['kk', 'ru']) {
  const navbar = load('src/components/Navbar.tsx', {
    'next-intl': intl, '@/i18n/routing': { Link: 'a' }, './LangSwitcher': {},
    './NavbarClient': { NavbarClient: 'nav-test' }, './NavbarAuth': {},
  });
  assert.equal(navbar.Navbar({ locale }).props.links.filter(link => link.href === '/shezhire-tree').length, 1);
  const footer = load('src/components/Footer.tsx', {
    'next-intl': { ...intl, useLocale: () => locale }, 'next/link': { default: 'a' },
  });
  assert.equal(elements(footer.Footer(), 'a').filter(link => link.props.href === `/${locale}/shezhire-tree`).length, 1);
  const navigations = [];
  const language = load('src/components/LangSwitcher.tsx', {
    '@/i18n/routing': {},
  }, { document: {}, localStorage: { setItem() {} }, window: { location: {
    pathname: `/${locale}/shezhire-tree`, search: '?highlight=tribe%3Anaiman&join=1', hash: '#tree-explorer-title',
    assign: value => navigations.push(value),
  } } });
  const buttons = elements(language.LangSwitcher({ locale }), 'button');
  buttons[locale === 'kk' ? 0 : 1].props.onClick();
  assert.equal(navigations.length, 0);
  buttons[locale === 'kk' ? 1 : 0].props.onClick();
  assert.equal(navigations[0], `/${locale === 'kk' ? 'ru' : 'kk'}/shezhire-tree?highlight=tribe%3Anaiman&join=1#tree-explorer-title`);
}
console.log('PASS: map navigation and footer in kk/ru; locale switch preserves deep-link query and fragment.');

// Open mobile menus must release the page when crossing into desktop layout.
{
  const state = hooks([true]);
  const effects = [];
  let onChange;
  const desktop = { matches: false, addEventListener: (_type, listener) => { onChange = listener; }, removeEventListener: (_type, listener) => assert.equal(listener, onChange) };
  const client = load('src/components/NavbarClient.tsx', {
    react: { ...state, useEffect: effect => effects.push(effect) }, '@/i18n/routing': { Link: 'a' },
  }, { window: { matchMedia: query => { assert.equal(query, '(min-width: 1280px)'); return desktop; } } });
  client.NavbarClient({ locale: 'ru', links: [], brand: null, auth: null, langSwitcher: null });
  const cleanup = effects[0]();
  onChange(); assert.equal(state.updates.length, 0);
  desktop.matches = true; onChange();
  assert.deepEqual(state.updates, [[0, false]]);
  cleanup();
}

// A deep-linked, unloaded branch is expandable; only a real leaf gets the empty message.
{
  const { renderToStaticMarkup } = require('react-dom/server');
  const treeLib = load('src/lib/tribe-tree.ts');
  const { InteractiveTree } = load('src/components/tribe-tree/InteractiveTree.tsx', {
    react: require('react'), 'next/link': { default: 'a' }, '@/lib/tribe-tree': treeLib,
    '@/lib/analytics': { ymGoal() {} }, '@/data/tribes': { TRIBES_DB: [] }, './TribeJoinModal': { TribeJoinModal: () => null },
  });
  for (const locale of ['ru', 'kk']) {
    const empty = locale === 'ru' ? 'У этой ветви нет продолжения.' : 'Бұл тармақта жалғасы жоқ.';
    const expand = locale === 'ru' ? 'Показать ветви' : 'Тармақтарды көрсету';
    for (const hasChildren of [true, false]) {
      const html = renderToStaticMarkup(require('react').createElement(InteractiveTree, {
        locale, source: 'repo', tree: { id: 'root', name: 'Root', kind: 'root', hasChildren },
      }));
      assert.equal(html.includes(expand), hasChildren);
      assert.equal(html.includes(empty), !hasChildren);
      assert(html.includes('ym-hide-content'));
      assert(html.includes('ym-disable-keys'));
    }
  }
}
console.log('PASS: desktop transition closes mobile menu; unloaded branches remain accessible in kk/ru.');

// Encyclopedia SEO: real page handlers emit stable metadata, crawlable map links and source links.
{
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const tribes = load('src/data/tribes.ts');
  const sources = load('src/data/encyclopedia-sources.ts');
  const allTribeIds = tribes.TRIBES_DB.flatMap(zhuz => zhuz.tribes.map(tribe => tribe.id));
  const allSectionIds = tribes.TRIBES_DB.map(zhuz => zhuz.id);
  const enrichedIds = new Set(['dulat', 'jalayir', 'sirgeli', 'shapyrashty', 'alban', 'suan']);
  const enriched = Object.fromEntries(allTribeIds
    .filter(id => enrichedIds.has(id))
    .map(id => [id, tribes.TRIBES_DB.flatMap(zhuz => zhuz.tribes).find(tribe => tribe.id === id)]));
  const dulat = enriched.dulat;
  const branchCount = branches => branches.reduce((count, branch) => count + 1 + branchCount(branch.children ?? []), 0);
  assert.equal(allTribeIds.length, 47);
  assert(allSectionIds.every(id => sources.getEncyclopediaSources(id).length > 0));
  for (const id of allTribeIds) {
    const tribe = enriched[id];
    if (tribe) {
      assert.equal(tribe.updatedAt, '2026-09-06', `${id}: release date`);
      assert(tribe.sources?.length && tribe.sources.every(source => source.title && /^https:\/\//.test(source.url) && source.locator_kk && source.locator_ru), `${id}: direct sources`);
    } else {
      assert(sources.getEncyclopediaSources(id).length > 0, `${id}: legacy source`);
    }
  }
  assert.deepEqual(
    Object.fromEntries(Object.entries(enriched).map(([id, tribe]) => [id, { top: tribe.subtribes?.length ?? 0, total: branchCount(tribe.subtribes ?? []) }])),
    { dulat: { top: 4, total: 8 }, jalayir: { top: 3, total: 17 }, sirgeli: { top: 12, total: 12 }, shapyrashty: { top: 6, total: 11 }, alban: { top: 1, total: 1 }, suan: { top: 3, total: 3 } },
  );

  const tracked = [];
  const { TreeMapLink } = load('src/components/encyclopedia/TreeMapLink.tsx', {
    'next/link': { default: 'a' }, '@/lib/analytics': { ymGoal: (...args) => tracked.push(args) },
  });
  TreeMapLink({ href: '/ru/shezhire-tree?highlight=dulat', locale: 'ru', targetKind: 'tribe' }).props.onClick();
  assert.equal(tracked[0][0], 'public_article_tree');
  assert.equal(tracked[0][1].locale, 'ru');
  assert.equal(tracked[0][1].target_kind, 'tribe');

  const pageDependencies = {
    'next-intl/server': { getTranslations: async () => key => key },
    'next/navigation': { notFound: () => { throw new Error('not found'); } },
    'next/link': { default: 'a' },
    '@/data/tribes': tribes,
    '@/data/encyclopedia-sources': sources,
    '@/components/encyclopedia/Breadcrumb': { Breadcrumb: () => null },
    '@/components/encyclopedia/TribeDetail': load('src/components/encyclopedia/TribeDetail.tsx', {
      './TreeMapLink': { TreeMapLink: ({ locale, targetKind, ...props }) => React.createElement('a', props) },
      'next/link': { default: 'a' }, '@/components/LinkedText': { LinkedText: ({ text, selfPath, ...props }) => React.createElement('p', props, text) },
    }),
    '@/components/encyclopedia/ZhuzSection': { ZhuzSection: () => null },
    '@/components/encyclopedia/Pager': { Pager: () => null },
    '@/components/encyclopedia/TreeMapLink': { TreeMapLink: ({ locale, targetKind, ...props }) => React.createElement('a', props) },
    '@/components/AiPromoBanner': { AiPromoBanner: () => null },
    '@/components/AiInlineHint': { AiInlineHint: () => null },
  };
  const tribePage = load('src/app/[locale]/encyclopedia/[zhuzId]/[tribeId]/page.tsx', pageDependencies);
  const zhuzPage = load('src/app/[locale]/encyclopedia/[zhuzId]/page.tsx', pageDependencies);
  for (const locale of ['kk', 'ru']) {
    const metadata = await tribePage.generateMetadata({ params: Promise.resolve({ locale, zhuzId: 'uly', tribeId: 'dulat' }) });
    const canonical = `https://skezire.kz/${locale}/encyclopedia/uly/dulat`;
    assert.equal(metadata.alternates.canonical, canonical);
    assert.equal(metadata.alternates.languages.kk, 'https://skezire.kz/kk/encyclopedia/uly/dulat');
    assert.equal(metadata.alternates.languages.ru, 'https://skezire.kz/ru/encyclopedia/uly/dulat');
    const html = renderToStaticMarkup(await tribePage.default({ params: Promise.resolve({ locale, zhuzId: 'uly', tribeId: 'dulat' }) }));
    assert(html.includes('application/ld+json'));
    assert(!html.includes('memberOf'));
    assert(html.includes(`/${locale}/shezhire-tree?view=reference&amp;highlight=tribe%3Adulat`));
    assert(html.includes(dulat.sources[0].title));
    assert(html.includes('id="branch-dulat-botbay"'));

    const zhuzHtml = renderToStaticMarkup(await zhuzPage.default({ params: Promise.resolve({ locale, zhuzId: 'uly' }) }));
    assert(zhuzHtml.includes(`/${locale}/shezhire-tree?highlight=zhuz:uly`));
    assert(zhuzHtml.includes(sources.getEncyclopediaSources('uly')[0].title));
  }

  const { TribeDetail } = load('src/components/encyclopedia/TribeDetail.tsx', {
    './TreeMapLink': { TreeMapLink: ({ locale, targetKind, ...props }) => React.createElement('a', props) },
    'next/link': { default: 'a' },
    '@/components/LinkedText': { LinkedText: ({ text }) => React.createElement('p', null, text) },
  });
  const cardDependencies = { react: React, 'next/link': { default: 'a' }, 'next-intl': { useTranslations: () => key => key } };
  for (const [file, component, props] of [
    ['TribeCardEnc', 'TribeCardEnc', { tribe: dulat, moreLabel: 'More' }],
    ['TribeTabs', 'TribeTabs', { tribes: [dulat], labels: {} }],
    ['EncTabs', 'EncTabs', { zhuzes: [{ ...tribes.TRIBES_DB[0], tribes: [dulat] }], moreLabel: 'More' }],
  ]) {
    const Component = load(`src/components/encyclopedia/${file}.tsx`, cardDependencies)[component];
    const markup = renderToStaticMarkup(React.createElement(Component, { ...props, locale: 'ru', zhuzId: 'uly' }));
    assert(!/class="[^"]*tamga/.test(markup), `${file}: empty symbol tile`);
    assert(markup.includes('Дулат'), `${file}: tribe name retained`);
  }
  const emptyNotable = tribes.TRIBES_DB.find(zhuz => zhuz.id === 'uly').tribes.find(tribe => tribe.id === 'jalayir');
  const detailLabels = { tamga: 'Тамга', uran: 'Уран', region: 'Регион', subgroup: 'Подгруппа', notable: 'Известные представители' };
  const dulatDetail = renderToStaticMarkup(React.createElement(TribeDetail, { tribe: dulat, locale: 'ru', zhuzName: 'Старший жуз', zhuzId: 'uly', labels: detailLabels }));
  assert(dulatDetail.includes('Названия ветвей'));
  assert(dulatDetail.includes('id="branch-dulat-botbay"'));
  assert(dulatDetail.includes(dulat.sources[0].title));
  const emptyDetail = renderToStaticMarkup(React.createElement(TribeDetail, { tribe: emptyNotable, locale: 'ru', zhuzName: 'Старший жуз', zhuzId: 'uly', labels: detailLabels }));
  assert(!emptyDetail.includes('Известные представители'));

  const sitemap = load('src/app/sitemap.ts', { '@/data/tribes': tribes, '@/data/blog': { BLOG_POSTS: [] } }).default();
  const mapUrls = sitemap.filter(entry => entry.url.includes('/shezhire-tree'));
  assert.equal(mapUrls.map(entry => entry.url).sort().join(','), 'https://skezire.kz/kk/shezhire-tree,https://skezire.kz/ru/shezhire-tree');
  assert(mapUrls.every(entry => !entry.url.includes('?')));
  assert.equal(sitemap.filter(entry => /\/encyclopedia\/[^/]+\/[^/]+$/.test(entry.url)).length, 94);

  const robots = load('src/app/robots.ts').default();
  assert(robots.rules.every(rule => !rule.disallow.includes('/_next/')));
}
console.log('PASS: 47 encyclopedia pages and 4 sections have source coverage, canonical/hreflang/JSON-LD, qualified symbols/branches, tree links and a query-free sitemap.');
