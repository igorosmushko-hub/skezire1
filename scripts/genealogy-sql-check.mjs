// Real PostgreSQL queries on disposable synthetic data only. Start a local cluster
// with its socket at /private/tmp/skezire-151b-pg, port 55441, then run this file.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import ts from 'typescript';
import * as tree from '../src/lib/tribe-tree.ts';
import { buildTribeTree } from '../src/lib/tribe-tree-page.ts';
import { TRIBES_DB } from '../src/data/tribes.ts';
const database = `skezire_check_${process.pid}`;
const connection = ['-h', process.env.PGHOST ?? '/private/tmp/skezire-151b-pg', '-p', process.env.PGPORT ?? '55441'];
assert(connection[1].startsWith('/private/tmp/'), 'synthetic checks require a local disposable socket');
const psql = query => execFileSync('psql', [...connection, '-d', database, '-XAt', '-v', 'ON_ERROR_STOP=1'], { input: query, encoding: 'utf8' }).trim();
const psqlFile = file => execFileSync('psql', [...connection, '-d', database, '-X', '-v', 'ON_ERROR_STOP=1', '-f', file], { encoding: 'utf8' });
const fails = query => assert.throws(() => psql(query));
execFileSync('createdb', [...connection, database]);
try {
  psql(`CREATE TABLE genealogy_nodes (
    node_key text PRIMARY KEY, parent_key text, source text, external_id bigint, name text,
    depth smallint, is_public boolean DEFAULT false, locked boolean DEFAULT false,
    reviewed_at timestamptz, publication_basis text, sort_order integer DEFAULT 0
  );
  INSERT INTO genealogy_nodes SELECT 'test:' || n, CASE WHEN n=0 THEN NULL ELSE 'test:' || (n-1) END,
    'test', n, 'Synthetic depth ' || n, n, true, false, now(), 'synthetic test', 0 FROM generate_series(0,31) n;
  INSERT INTO genealogy_nodes SELECT 'test:wide' || n, 'test:0', 'test', 1000+n,
    'Synthetic wide ' || n, 1, true, false, now(), 'synthetic test', n FROM generate_series(1,205) n;
  INSERT INTO genealogy_nodes VALUES
    ('test:private','test:0','test',2000,'Private sentinel',1,false,false,NULL,NULL,0),
    ('test:locked','test:0','test',2001,'Locked sentinel',1,true,true,now(),'test',0),
    ('test:unreviewed','test:0','test',2002,'Unreviewed sentinel',1,true,false,NULL,'test',0),
    ('test:no-basis','test:0','test',2003,'Basis sentinel',1,true,false,now(),' ',0),
    ('test:orphan','test:private','test',2004,'Orphan sentinel',2,true,false,now(),'test',0),
    ('test:cycle','test:cycle','test',2005,'Cycle sentinel',2,true,false,now(),'test',0),
    ('test:ambiguous1','test:0','test',9999,'Ambiguous one',1,true,false,now(),'test',0),
    ('test:ambiguous2','test:0','test',9999,'Ambiguous two',1,true,false,now(),'test',0);`);
  const literal = value => value == null ? 'NULL' : typeof value === 'number' ? String(value) : `'${String(value).replaceAll("'", "''")}'`;
  const sql = async (strings, ...values) => {
    const query = strings.reduce((result, part, index) => result + part + (index < values.length ? literal(values[index]) : ''), '');
    return JSON.parse(psql(`SELECT coalesce(json_agg(result), '[]'::json) FROM (${query}) result;`));
  };
  const loadedModule = { exports: {} };
  const dependencies = { 'server-only': {}, '@neondatabase/serverless': { neon: () => sql }, '../data/tribes': { TRIBES_DB },
    './tribe-tree': tree, './tribe-tree-page': { buildTribeTree } };
  const code = ts.transpileModule(fs.readFileSync('src/lib/genealogy-data.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(code, { AbortSignal, module: loadedModule, exports: loadedModule.exports, require: name => dependencies[name],
    process: { env: { GENEALOGY_DATABASE_URL: 'synthetic', GENEALOGY_SOURCE: 'test', GENEALOGY_ROOT_KEY: 'test:0' } } });
  const api = loadedModule.exports;
  const path = await api.getPublicGenealogyPath('31');
  assert.equal(path.length, 32);
  assert.equal(path.at(-1).id, 'test:31');
  for (const id of ['private','unreviewed','no-basis','orphan','cycle','missing']) {
    assert.equal((await api.getPublicGenealogyPath(`test:${id}`)).length, 0, id);
    assert.equal(await api.getPublicGenealogyChildren(`test:${id}`), null, id);
  }
  assert.equal((await api.getPublicGenealogyPath('test:locked')).at(-1).id, 'test:locked');
  psql("UPDATE genealogy_nodes SET locked=true WHERE node_key IN ('test:0','test:1')");
  assert.equal((await api.getPublicGenealogyPath('31')).length, 32);
  assert.equal((await api.getPublicGenealogyChildren('test:0')).children.find(node => node.id === 'test:1').hasChildren, true);
  assert.equal((await api.searchPublicGenealogy('test', 'Locked sentinel'))[0].id, 'test:locked');
  assert.equal((await api.getPublicGenealogyPath('9999')).length, 0);
  const sentinels = await api.searchPublicGenealogy('test', 'sentinel');
  assert.equal(sentinels.length, 1);
  assert.equal(sentinels[0].id, 'test:locked');
  const loaded = [];
  let offset = 0;
  do {
    const page = await api.getPublicGenealogyChildren('test:0', offset);
    assert(page.children.length <= 100);
    loaded.push(...page.children);
    offset = page.nextOffset;
  } while (offset !== null);
  assert.equal(loaded.length, 209);
  assert.equal(new Set(loaded.map(node => node.id)).size, 209);
  psql("UPDATE genealogy_nodes SET name='needle prefix' WHERE node_key='test:wide9'; UPDATE genealogy_nodes SET name='weak needle' WHERE node_key='test:wide1'");
  assert.equal((await api.searchPublicGenealogy('test', 'needle'))[0].id, 'test:wide9');
  psql("UPDATE genealogy_nodes SET name='Synthetic-hyphen' WHERE node_key='test:31'");
  assert.equal((await api.searchPublicGenealogy('test', 'Synthetic-hyphen'))[0].id, 'test:31');
  assert.equal((await api.searchPublicGenealogy('test', '%%%')).length, 0);
  const initial = await api.getInitialGenealogyTree('ru', '31');
  assert.equal(initial.focusId, 'test:31');
  assert.equal(tree.findTreePath(initial.tree, initial.focusId).length, 32);
  psql("UPDATE genealogy_nodes SET is_public=false WHERE node_key='test:1'");
  assert.equal((await api.getPublicGenealogyPath('31')).length, 0);
  assert.equal(await api.getPublicGenealogyChildren('test:30'), null);
  assert.equal((await api.searchPublicGenealogy('test', 'Synthetic-hyphen')).length, 0);
  await assert.rejects(() => api.getInitialGenealogyTree('ru', '31'));
  // Exercise the real migration chain separately from the lightweight reader fixture above.
  psql('DROP TABLE genealogy_nodes CASCADE;');
  psql(`DO $$ BEGIN
    CREATE ROLE anon NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    CREATE ROLE authenticated NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    CREATE ROLE service_role NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;`);
  psqlFile('supabase/migrations/004_genealogy_nodes.sql');
  psql(`INSERT INTO genealogy_nodes
    (node_key, parent_key, source, external_id, name, depth, locked, is_public, reviewed_at, publication_basis)
    VALUES
      ('legacy:root', NULL, 'legacy', 1, 'Legacy root', 0, false, true, now(), 'legacy basis'),
      ('legacy:child', 'legacy:root', 'legacy', 2, 'Legacy child', 1, false, true, now(), 'legacy basis'),
      ('legacy:locked', NULL, 'legacy', 3, 'Legacy locked', 0, true, false, NULL, NULL);`);
  assert.equal(psql('SELECT count(*) FROM genealogy_nodes WHERE is_public'), '2');
  psqlFile('supabase/migrations/20260905151729_genealogy_source_lock.sql');
  assert.equal(psql('SELECT count(*) FROM genealogy_nodes WHERE is_public'), '2');
  assert.equal(psql("SELECT source_locked IS NULL AND locked FROM genealogy_nodes WHERE node_key='legacy:locked'"), 't');
  fails("INSERT INTO genealogy_nodes (node_key, source, external_id, name, depth, source_locked) VALUES ('bad:negative','bad',1,'Bad',0,-1)");
  fails("INSERT INTO genealogy_nodes (node_key, source, external_id, name, depth, locked, source_locked) VALUES ('bad:mismatch','bad',2,'Bad',0,false,1)");

  psql(`INSERT INTO genealogy_nodes (node_key, parent_key, source, external_id, name, depth, locked, source_locked)
    VALUES ('lock:root', NULL, 'lock', 10, 'Locked root', 0, true, 7),
      ('lock:child', 'lock:root', 'lock', 11, 'Locked child', 1, true, 2),
      ('lock:grandchild', 'lock:child', 'lock', 12, 'Locked grandchild', 2, true, 1);`);
  fails("SELECT publish_genealogy_nodes(ARRAY['lock:child'], 'basis')");
  fails("SELECT publish_genealogy_nodes(ARRAY['lock:root'], ' ')");
  assert.equal(psql("SELECT publish_genealogy_nodes(ARRAY['lock:root'], 'basis')"), '1');
  assert.equal(psql("SELECT publish_genealogy_nodes(ARRAY['lock:child'], 'basis')"), '1');
  assert.equal(psql("SELECT publish_genealogy_nodes(ARRAY['lock:grandchild'], 'basis')"), '1');
  assert.equal(psql("SELECT has_children FROM get_public_genealogy_children('lock:root') WHERE node_key='lock:child'"), 't');
  assert.equal(psql("SELECT has_children FROM search_public_genealogy('lock', 'Locked root', 8)"), 't');
  assert.equal(psql("SELECT count(*) FROM search_public_genealogy('lock', 'Locked child', 8)"), '1');
  psql("UPDATE genealogy_nodes SET is_public=false WHERE node_key='lock:root'");
  assert.equal(psql("SELECT is_public FROM genealogy_nodes WHERE node_key='lock:grandchild'"), 't');
  assert.equal(psql("SELECT count(*) FROM get_public_genealogy_children('lock:child')"), '0');
  assert.equal(psql("SELECT count(*) FROM search_public_genealogy('lock', 'Locked grandchild', 8)"), '0');
  psql("SELECT publish_genealogy_nodes(ARRAY['lock:root'], 'basis')");
  assert.equal(psql("WITH updated AS (UPDATE genealogy_nodes SET locked=false, source_locked=0 WHERE node_key='lock:child' RETURNING is_public) SELECT is_public FROM updated"), 't');
  assert.equal(psql("SELECT locked = false AND source_locked = 0 FROM genealogy_nodes WHERE node_key='lock:child'"), 't');
  fails("UPDATE genealogy_nodes SET name='Changed without import' WHERE node_key='lock:child'");
  fails("SELECT begin_genealogy_import('lock', false)");
  assert.equal(psql("SELECT is_public AND reviewed_at IS NOT NULL AND publication_basis='basis' FROM genealogy_nodes WHERE node_key='lock:child'"), 't');
  fails("INSERT INTO genealogy_nodes (node_key,parent_key,source,external_id,name,depth,is_public,reviewed_at,publication_basis) VALUES ('foreign:child','lock:root','foreign',1,'Foreign',1,true,now(),'basis')");
  // Explicit fixture withdrawal, not automatic behavior of the importer.
  psql("UPDATE genealogy_nodes SET is_public=false, reviewed_at=NULL, publication_basis=NULL WHERE source='lock'");
  psql("SELECT begin_genealogy_import('lock', false); UPDATE genealogy_nodes SET name='Changed in import' WHERE node_key='lock:child'; SELECT finish_genealogy_import('lock');");
  assert.equal(psql("SELECT is_public FROM genealogy_nodes WHERE node_key='lock:child'"), 'f');

  psql("UPDATE genealogy_nodes SET is_public=false, reviewed_at=NULL, publication_basis=NULL WHERE node_key='lock:root'");
  assert.equal(psql("SELECT count(*) FROM get_public_genealogy_children('lock:child')"), '0');
  assert.equal(psql("SELECT count(*) FROM search_public_genealogy('lock', 'Changed in import', 8)"), '0');
  psql("INSERT INTO genealogy_nodes (node_key, source, external_id, name, depth, locked, source_locked) VALUES ('rollback:locked', 'rollback', 20, 'Rollback locked', 0, true, 1)");
  assert.equal(psql("SELECT publish_genealogy_nodes(ARRAY['rollback:locked'], 'basis')"), '1');
  assert.equal(psql("SELECT count(*) FROM genealogy_nodes WHERE is_public AND locked"), '1');
  assert.throws(() => psqlFile('docs/seo/genealogy-source-lock-rollback.sql'));
  psql("UPDATE genealogy_nodes SET locked=false, source_locked=0 WHERE locked");
  psqlFile('docs/seo/genealogy-source-lock-rollback.sql');
  fails("INSERT INTO genealogy_nodes (node_key,parent_key,source,external_id,name,depth,is_public,reviewed_at,publication_basis) VALUES ('foreign:rollback','legacy:root','foreign',2,'Foreign rollback',1,true,now(),'basis')");
  assert.equal(psql("SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='genealogy_nodes' AND column_name='source_locked')"), 't');
  psql("SELECT begin_genealogy_import('lock', false); UPDATE genealogy_nodes SET locked=true WHERE node_key='lock:child'; SELECT finish_genealogy_import('lock')");
  assert.equal(psql("SELECT locked AND source_locked IS NULL FROM genealogy_nodes WHERE node_key='lock:child'"), 't');
  console.log('PASS: application readers: locked published path/search/children + 209 children. Real 004/source-lock migration: checks, import guard, locked publish order, revoked RPC path, and guarded rollback.');
} finally {
  execFileSync('dropdb', [...connection, database]);
}
