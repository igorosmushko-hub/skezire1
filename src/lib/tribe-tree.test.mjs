import assert from 'node:assert/strict';
import test from 'node:test';
import { TRIBES_DB } from '../data/tribes.ts';
import {
  findTreePath,
  flattenTree,
  getExpandedPathIdsForSearchResult,
  layoutTree,
  mergeTreeChildren,
  mergeTreePath,
  normalizeTreeSearch,
  pruneTree,
  searchTree,
  stringifyJsonLd,
  computeViewportFitScale,
} from './tribe-tree.ts';
import { buildTribeTree } from './tribe-tree-page.ts';

const tree = {
  id: 'alash',
  name: 'Алаш',
  kind: 'root',
  children: [{
    id: 'kishi',
    name: 'Кіші жүз',
    secondaryName: 'Младший жуз',
    kind: 'zhuz',
    children: [{ id: 'aday', name: 'Адай', kind: 'tribe' }],
  }],
};

test('normalizes, searches and resolves an ancestor path', () => {
  assert.equal(normalizeTreeSearch('  Кіші-жүз '), 'кіші жүз');
  assert.equal(searchTree(tree, 'младший')[0]?.id, 'kishi');
  assert.deepEqual(findTreePath(tree, 'aday').map((node) => node.id), ['alash', 'kishi', 'aday']);
});

test('renders only expanded levels and connects every visible child', () => {
  const collapsed = layoutTree(tree, new Set());
  assert.deepEqual(collapsed.nodes.map((node) => node.id), ['alash']);

  const expanded = layoutTree(tree, new Set(['alash', 'kishi']));
  assert.deepEqual(expanded.nodes.map((node) => node.id), ['alash', 'kishi', 'aday']);
  assert.equal(expanded.edges.length, 2);
  assert.ok(expanded.width > 500);
  assert.ok(expanded.height >= 420);
});

test('builds expanded path ids for search result, including target when expandable', () => {
  const withNested = {
    id: 'root',
    name: 'Root',
    kind: 'root',
    children: [
      {
        id: 'parent',
        name: 'Parent',
        kind: 'zhuz',
        children: [
          { id: 'child', name: 'Child', kind: 'tribe' },
          { id: 'sibling', name: 'Sibling', kind: 'tribe' },
        ],
      },
      { id: 'leaf', name: 'Leaf', kind: 'tribe' },
    ],
  };

  assert.deepEqual(
    getExpandedPathIdsForSearchResult(withNested, 'parent'),
    ['root', 'parent'],
  );
  assert.deepEqual(
    getExpandedPathIdsForSearchResult(withNested, 'child'),
    ['root', 'parent'],
  );
});

test('computes responsive fit scale with hard min/max bounds', () => {
  assert.equal(computeViewportFitScale(2000, 360, 24, 0.55, 2.2), 0.55);
  assert.equal(computeViewportFitScale(200, 1200, 24, 0.55, 2.2), 2.2);
  assert.equal(Number(computeViewportFitScale(400, 480, 24, 0.55, 2.2).toFixed(4)), 1.14);
});

test('keeps unloaded branches expandable and merges lazy API data', () => {
  const initial = pruneTree(tree, 1);
  assert.equal(initial.children[0].children, undefined);
  assert.equal(initial.children[0].hasChildren, true);

  const merged = mergeTreeChildren(initial, 'kishi', [
    { id: 'aday', name: 'Адай', kind: 'tribe', hasChildren: false },
  ]);
  assert.equal(findTreePath(merged, 'aday').at(-1)?.name, 'Адай');
  assert.deepEqual(
    layoutTree(merged, new Set(['alash', 'kishi'])).nodes.map((node) => node.id),
    ['alash', 'kishi', 'aday'],
  );
});

test('merges a server search path without discarding loaded siblings', () => {
  const initial = {
    ...tree,
    children: [
      {
        ...tree.children[0],
        children: [{ id: 'aday', name: 'Адай', kind: 'tribe', children: [
          { id: 'zhemeney', name: 'Жеменей', kind: 'subtribe' },
        ] }],
      },
      { id: 'other', name: 'Вне жузов', kind: 'zhuz' },
    ],
  };
  const merged = mergeTreePath(initial, [
    { id: 'alash', name: 'Алаш', kind: 'root', hasChildren: true },
    { id: 'kishi', name: 'Кіші жүз', kind: 'zhuz', hasChildren: true },
    { id: 'aday', name: 'Адай', kind: 'tribe', hasChildren: false },
  ]);
  assert.deepEqual(findTreePath(merged, 'aday').map((node) => node.id), ['alash', 'kishi', 'aday']);
  assert.equal(findTreePath(merged, 'zhemeney').at(-1)?.name, 'Жеменей');
  assert.deepEqual(merged.children.map((node) => node.id), ['kishi', 'other']);
});

test('keeps the public tribe directory and subtribe IDs source-backed and stable', () => {
  const tribes = TRIBES_DB.flatMap((zhuz) => zhuz.tribes);
  const subtribes = tribes.flatMap((tribe) => tribe.subtribes ?? []);

  assert.equal(tribes.length, 47);
  assert.equal(new Set(tribes.map((tribe) => tribe.id)).size, tribes.length);
  assert.ok(subtribes.length > 0);
  assert.ok(subtribes.every((subtribe) => subtribe.id.length > 0));
  assert.equal(new Set(subtribes.map((subtribe) => subtribe.id)).size, subtribes.length);

  const links = TRIBES_DB.flatMap((zhuz) => zhuz.tribes.map(
    (tribe) => `/ru/encyclopedia/${zhuz.id}/${tribe.id}`,
  ));
  assert.equal(new Set(links).size, 47);
  assert.ok(links.every((href) => href.startsWith('/ru/encyclopedia/')));

  const treeNodes = flattenTree(buildTribeTree('ru', TRIBES_DB));
  const tribeNodes = treeNodes.filter((node) => node.kind === 'tribe');
  assert.equal(tribeNodes.length, 47);
  assert.deepEqual(
    tribeNodes.map((node) => node.href).sort(),
    links.sort(),
  );
});

test('escapes JSON-LD closing-script characters', () => {
  assert.equal(stringifyJsonLd({ description: '</script>' }), '{"description":"\\u003c/script>"}');
});
