// Check the new release against the preserved IDs, explicit moves and source ledger.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { TRIBES_DB } from '../src/data/tribes.ts';
import { buildTribeTree } from '../src/lib/tribe-tree-page.ts';
import { findTreePath, flattenTree } from '../src/lib/tribe-tree.ts';

const audit = JSON.parse(fs.readFileSync(new URL('../docs/research/2026-09-27-reference-expansion.json', import.meta.url)));
const tribes = TRIBES_DB.flatMap(section => section.tribes);
assert.deepEqual(tribes.map(t => t.id), audit.tribes.map(t => t.id));
const edges = new Map();
function visit(items, parent) {
  for (const item of items ?? []) {
    assert.ok(!edges.has(item.id), `Repeated ID/cycle: ${item.id}`);
    assert.match(item.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(item.kk.trim() && item.ru.trim(), `${item.id}: missing name`);
    if (item.note) assert.ok(typeof item.note === 'object' && item.note.kk && item.note.ru, `${item.id}: bilingual note`);
    edges.set(item.id, { parent, item });
    visit(item.children, item.id);
  }
}
for (const tribe of tribes) visit(tribe.subtribes, tribe.id);
assert.equal(edges.size, 521);
assert.equal(tribes.filter(t => t.subtribes?.length).length, 39);
const moves = new Map(audit.tribes.flatMap(t => t.moves).map(m => [m.id, m.parentId]));
for (const old of audit.originalEdges) {
  const actual = edges.get(old.id);
  assert.ok(actual, `Removed old link: ${old.id}`);
  assert.equal(actual.parent, moves.get(old.id) ?? old.parent, `Unexpected move: ${old.id}`);
  assert.equal(actual.item.kk, old.kk, `Old Kazakh label changed: ${old.id}`);
  assert.equal(actual.item.ru, old.ru, `Old Russian label changed: ${old.id}`);
}
const additions = audit.tribes.flatMap(t => t.additions);
assert.equal(additions.length, 181);
assert.deepEqual([...edges.keys()].filter(id => !audit.originalEdges.some(e => e.id === id)).sort(), additions.map(e => e.node.id).sort());
for (const entry of audit.tribes) {
  const tribe = tribes.find(t => t.id === entry.id);
  for (const edge of entry.additions) {
    assert.equal(edges.get(edge.node.id).parent, edge.parentId);
    assert.ok(edge.sourceUrl.startsWith('https://') && edge.locator && edge.evidence);
    assert.ok(tribe.sources.some(s => s.url === edge.sourceUrl), `${edge.node.id}: article source missing`);
    assert.equal(tribe.updatedAt, audit.reviewedAt);
  }
}
for (const locale of ['ru', 'kk']) {
  const tree = buildTribeTree(locale, TRIBES_DB);
  assert.equal(flattenTree(tree).filter(n => n.kind === 'subtribe').length, edges.size);
  for (const edge of additions) {
    const path = findTreePath(tree, `subtribe:${edge.node.id}`);
    const node = path.at(-1);
    assert.ok(node, `${locale}: ${edge.node.id} unreachable`);
    assert.equal(node.name, edges.get(edge.node.id).item[locale]);
    assert.equal(path.at(-2).id.split(':').slice(1).join(':'), edge.parentId);
    assert.ok(node.href.endsWith(`#branch-${edge.node.id}`));
    assert.ok(node.summary);
  }
  const deep = findTreePath(tree, 'subtribe:jalayir-duysenbi-taimonke');
  assert.equal(deep.length, 8, 'Jalayir: five levels below tribe, no artificial intermediates');
}
console.log('PASS: 47 cards, 521 unique branches, 181 source-backed additions, 340 old links, 3 explicit moves, RU/KK paths and notes.');
