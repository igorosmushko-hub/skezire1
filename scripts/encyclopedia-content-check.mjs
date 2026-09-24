import assert from 'node:assert/strict';
import { TRIBES_DB } from '../src/data/tribes.ts';
import {
  ENCYCLOPEDIA_SOURCE_IDS_BY_TRIBE,
  ENCYCLOPEDIA_SOURCES,
  getEncyclopediaSources,
} from '../src/data/encyclopedia-sources.ts';

const expectedSectionIds = ['uly', 'orta', 'kishi', 'other'];
const expectedTribeIds = [
  'dulat', 'jalayir', 'shapyrashty', 'ysty', 'oshakty', 'sirgeli', 'kanly', 'alban', 'suan', 'shanishkily', 'janyis', 'katagan',
  'argyn', 'naiman', 'kerey', 'kypshak', 'uak', 'konyrat', 'tarakty', 'merkit',
  'aday', 'baybakty', 'zhappas', 'alasha', 'bersh', 'esentemir', 'maskar', 'tana', 'taz', 'sherkesh', 'ysyk', 'kyzylkurt',
  'tabyn', 'tama', 'zhagalbayly', 'kerderi', 'teleu', 'ramadan', 'tileu', 'shomekei', 'shekti', 'karakesek', 'karatay', 'kete',
  'tore', 'koja', 'tolengit',
];
const sections = TRIBES_DB.map(({ id, desc_kk, desc_ru }) => ({ id, desc_kk, desc_ru }));
const tribes = TRIBES_DB.flatMap(section => section.tribes);
const ids = tribes.map(tribe => tribe.id);

assert.deepEqual(sections.map(section => section.id), expectedSectionIds);
assert.equal(tribes.length, 47);
assert.deepEqual(ids, expectedTribeIds);
assert.equal(new Set(ids).size, 47);
assert.equal(Object.keys(ENCYCLOPEDIA_SOURCE_IDS_BY_TRIBE).length, 47);
assert.deepEqual(Object.keys(ENCYCLOPEDIA_SOURCE_IDS_BY_TRIBE).sort(), [...ids].sort());

for (const section of sections) {
  assert.ok(section.desc_kk.length > 80 && section.desc_ru.length > 80, `${section.id}: missing bilingual editorial copy`);
}
for (const tribe of tribes) {
  assert.ok(tribe.desc_kk.length > 30 && tribe.desc_ru.length > 30, `${tribe.id}: missing bilingual summary`);
  assert.ok(tribe.history_kk && tribe.history_ru, `${tribe.id}: missing bilingual history boundary`);
  assert.ok(!tribe.notable.length || ['dulat', 'janyis', 'argyn', 'naiman', 'aday'].includes(tribe.id), `${tribe.id}: biography outside accepted SEO09 scope`);
  const sources = getEncyclopediaSources(tribe.id);
  assert.ok(sources.length > 0, `${tribe.id}: no source`);
  for (const source of sources) {
    assert.equal(ENCYCLOPEDIA_SOURCES[source.id], source, `${tribe.id}: unknown source ${source.id}`);
    assert.ok(source.title && source.url.startsWith('https://') && source.locator, `${tribe.id}: incomplete source ${source.id}`);
  }
}

assert.equal(tribes.filter(tribe => tribe.subtribes?.length).length, 22);
const countBranches = (items = []) => items.reduce((count, branch) => count + 1 + countBranches(branch.children), 0);
assert.equal(tribes.reduce((count, tribe) => count + countBranches(tribe.subtribes), 0), 340);
assert.ok(['katagan', 'merkit', 'teleu', 'tileu', 'karatay', 'tolengit'].every(id => {
  const tribe = tribes.find(item => item.id === id);
  return /нұсқа|верси|ашық мәселе|тексер|профильдік|тексеріл|провер|открытым вопросом|бекітілм/i.test(`${tribe?.desc_kk} ${tribe?.desc_ru} ${tribe?.history_kk} ${tribe?.history_ru}`);
}));

console.log('PASS: 4 sections, 47 stable tribe IDs, 340 branch IDs, RU/KK editorial copy, and a source record for every page.');
