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
  assert(elements(footer.Footer(), 'a').some(link => link.props.href === `/${locale}/shezhire-tree`));
  const navigations = [];
  const language = load('src/components/LangSwitcher.tsx', {
    '@/i18n/routing': { useRouter: () => ({ replace: (...args) => navigations.push(args) }), usePathname: () => '/shezhire-tree' },
  }, { document: {}, localStorage: { setItem() {} }, window: { location: { search: '?highlight=tribe%3Anaiman&join=1', hash: '#tree-explorer-title' } } });
  const buttons = elements(language.LangSwitcher({ locale }), 'button');
  buttons[locale === 'kk' ? 0 : 1].props.onClick();
  assert.equal(navigations.length, 0);
  buttons[locale === 'kk' ? 1 : 0].props.onClick();
  assert.equal(navigations[0][0], '/shezhire-tree?highlight=tribe%3Anaiman&join=1#tree-explorer-title');
  assert.equal(navigations[0][1].locale, locale === 'kk' ? 'ru' : 'kk');
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
  assert.equal(allTribeIds.length, 47);
  assert.deepEqual(Object.keys(sources.ENCYCLOPEDIA_SOURCE_IDS_BY_TRIBE).sort(), [...allTribeIds].sort());
  assert([...allTribeIds, ...allSectionIds].every(id => sources.getEncyclopediaSources(id).length > 0 && sources.getEncyclopediaSources(id).every(Boolean)));

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
    '@/components/encyclopedia/TribeDetail': { TribeDetail: () => null },
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
    assert(html.includes(`/${locale}/shezhire-tree?highlight=dulat`));
    assert(html.includes(sources.getEncyclopediaSources('dulat')[0].title));

    const zhuzHtml = renderToStaticMarkup(await zhuzPage.default({ params: Promise.resolve({ locale, zhuzId: 'uly' }) }));
    assert(zhuzHtml.includes(`/${locale}/shezhire-tree?highlight=zhuz:uly`));
    assert(zhuzHtml.includes(sources.getEncyclopediaSources('uly')[0].title));
  }

  const { TribeDetail } = load('src/components/encyclopedia/TribeDetail.tsx', {
    '@/components/LinkedText': { LinkedText: ({ text }) => React.createElement('p', null, text) },
  });
  const dulat = tribes.TRIBES_DB.find(zhuz => zhuz.id === 'uly').tribes.find(tribe => tribe.id === 'dulat');
  const emptyNotable = tribes.TRIBES_DB.find(zhuz => zhuz.id === 'uly').tribes.find(tribe => tribe.id === 'jalayir');
  const detailLabels = { tamga: 'Тамга', uran: 'Уран', region: 'Регион', subgroup: 'Подгруппа', notable: 'Известные представители' };
  const dulatDetail = renderToStaticMarkup(React.createElement(TribeDetail, { tribe: dulat, locale: 'ru', zhuzName: 'Старший жуз', zhuzId: 'uly', labels: detailLabels }));
  assert(dulatDetail.includes('Условное обозначение каталога; не историческое изображение тамги.'));
  assert(dulatDetail.includes('Названия ветвей'));
  assert(dulatDetail.includes('Четыре названия приведены в версии шежире S08.'));
  const emptyDetail = renderToStaticMarkup(React.createElement(TribeDetail, { tribe: emptyNotable, locale: 'ru', zhuzName: 'Старший жуз', zhuzId: 'uly', labels: detailLabels }));
  assert(!emptyDetail.includes('Известные представители'));

  const { TribeTabs } = load('src/components/encyclopedia/TribeTabs.tsx', {
    react: { useState: initial => [initial, () => {}] }, 'next/link': { default: 'a' },
  });
  const tabs = renderToStaticMarkup(React.createElement(TribeTabs, { tribes: [dulat], locale: 'ru', zhuzId: 'uly', labels: { ...detailLabels, moreLink: 'Подробнее' } }));
  assert(tabs.includes('Условное обозначение каталога; не историческое изображение тамги.'));

  const sitemap = load('src/app/sitemap.ts', { '@/data/tribes': tribes, '@/data/blog': { BLOG_POSTS: [] } }).default();
  const mapUrls = sitemap.filter(entry => entry.url.includes('/shezhire-tree'));
  assert.equal(mapUrls.map(entry => entry.url).sort().join(','), 'https://skezire.kz/kk/shezhire-tree,https://skezire.kz/ru/shezhire-tree');
  assert(mapUrls.every(entry => !entry.url.includes('?')));
  assert.equal(sitemap.filter(entry => /\/encyclopedia\/[^/]+\/[^/]+$/.test(entry.url)).length, 94);

  const robots = load('src/app/robots.ts').default();
  assert(robots.rules.every(rule => !rule.disallow.includes('/_next/')));
}
console.log('PASS: 47 encyclopedia pages and 4 sections have source coverage, canonical/hreflang/JSON-LD, qualified symbols/branches, tree links and a query-free sitemap.');
