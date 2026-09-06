// Existing read-only Neon role, actual adapter; exports aggregate results only.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { neon } from '@neondatabase/serverless';
import * as tree from '../src/lib/tribe-tree.ts';
import { buildTribeTree } from '../src/lib/tribe-tree-page.ts';
import { TRIBES_DB } from '../src/data/tribes.ts';
try {
  const client = neon(process.env.GENEALOGY_DATABASE_URL);
  const sql = async (strings, ...values) => (await client.transaction([client(strings, ...values)], { readOnly: true, isolationLevel: 'RepeatableRead' }))[0];
  const source = process.env.GENEALOGY_SOURCE;
  const roots = await sql`SELECT node_key, is_public, locked FROM genealogy_nodes WHERE source=${source} AND parent_key IS NULL`;
  assert.equal(roots.length, 1);
  const env = { ...process.env, GENEALOGY_ROOT_KEY: roots[0].node_key, GENEALOGY_INCLUDE_PRIVATE: '0' };
  const dependencies = { 'server-only': {}, '@neondatabase/serverless': { neon: () => sql }, '../data/tribes': { TRIBES_DB },
    './tribe-tree': tree, './tribe-tree-page': { buildTribeTree } };
  const loadedModule = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync('src/lib/genealogy-data.ts','utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(code, { AbortSignal, module: loadedModule, exports: loadedModule.exports, process: { env }, require: name => dependencies[name] });
  const api = loadedModule.exports;
  const measurements = [];
  async function measure(label, run) { const started=performance.now(); const value=await run(); measurements.push({label, ms:Math.round(performance.now()-started)}); return value; }
  const initial = await measure('initialPublicTree',()=>api.getInitialGenealogyTree('ru'));
  assert.equal(initial.source,source);
  const publicRows = await sql`SELECT node_key, external_id, name, depth FROM genealogy_nodes WHERE source=${source} AND is_public ORDER BY depth`;
  for(const row of publicRows) {
    const path = await measure('publicPath',()=>api.getPublicGenealogyPath(row.node_key));
    assert.equal(path.length, row.depth+1);
    const focused=await api.getInitialGenealogyTree('kk',String(row.external_id));
    assert.equal(focused.focusId,row.node_key);
    const found=await measure('publicSearch',()=>api.searchPublicGenealogy(source,row.name));
    assert(found.some(item=>item.id===row.node_key));
  }
  const privateRows = await sql`SELECT node_key FROM genealogy_nodes WHERE source=${source} AND NOT is_public ORDER BY depth DESC LIMIT 5`;
  const lockedRows = await sql`SELECT node_key FROM genealogy_nodes WHERE source=${source} AND locked AND NOT is_public LIMIT 5`;
  for(const row of [...privateRows,...lockedRows]) {
    assert.equal((await api.getPublicGenealogyPath(row.node_key)).length,0);
    assert.equal(await api.getPublicGenealogyChildren(row.node_key),null);
  }
  const wide=await sql`SELECT parent_key, count(*)::int width FROM genealogy_nodes WHERE source=${source} GROUP BY parent_key ORDER BY width DESC LIMIT 1`;
  const rawChildren=await measure('fullSnapshotWidestChildren',()=>sql`SELECT node_key,name,depth FROM genealogy_nodes WHERE parent_key=${wide[0].parent_key} ORDER BY sort_order,external_id`);
  const queryMatches=await measure('fullSnapshotSearchCount',()=>sql`SELECT count(*)::int matches FROM genealogy_nodes WHERE source=${source} AND lower(name) LIKE '%адай%'`);
  const role=await sql`SELECT has_any_column_privilege(current_user,'genealogy_nodes','INSERT') can_insert_columns, has_any_column_privilege(current_user,'genealogy_nodes','UPDATE') can_update_columns`;
  const mutationFunctions=await sql`SELECT proname FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND proname IN ('begin_genealogy_import','finish_genealogy_import','publish_genealogy_nodes') AND has_function_privilege(current_user,p.oid,'EXECUTE')`;
  assert.equal(role[0].can_insert_columns,false); assert.equal(role[0].can_update_columns,false); assert.equal(mutationFunctions.length,0);
  const report={checkedAt:new Date().toISOString(),source,mode:'actual Neon DB; adapter keeps public filter; aggregate raw snapshot probes only',
    roots:roots.length,rootPublic:roots[0].is_public,publicNodesChecked:publicRows.length,privateNodesDenied:privateRows.length,privateLockedNodesDenied:lockedRows.length,
    widestBranch:wide[0].width,widestRawResponseBytes:Buffer.byteLength(JSON.stringify(rawChildren)),fullSnapshotSearchMatches:queryMatches[0].matches,
    roleHasColumnWrites:false,roleHasImportOrPublishFunctionAccess:false,measurements};
  fs.writeFileSync('docs/seo/genealogy-live-check-2026-09-05.json',JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
} catch(error) {console.error('Live check failed:',error.code??error.name);process.exitCode=1;}
