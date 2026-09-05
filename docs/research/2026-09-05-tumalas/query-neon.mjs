// Run from repository root: node docs/research/2026-09-05-tumalas/query-neon.mjs <queries.json> <output.json> [reader.env]
// Credentials are read locally, never included in the output. Every query runs in one read-only snapshot.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { parseEnv } from 'node:util';
import assert from 'node:assert/strict';
import { neon } from '@neondatabase/serverless';
const [input, output, envFile] = process.argv.slice(2);
assert(input && output, 'Expected query manifest and output path');
const env = envFile ? parseEnv(readFileSync(envFile, 'utf8')) : process.env;
assert(env.GENEALOGY_DATABASE_URL, 'GENEALOGY_DATABASE_URL is required');
const source = env.GENEALOGY_SOURCE;
assert(source, 'GENEALOGY_SOURCE is required');
const bytes = readFileSync(input, 'utf8');
const queries = JSON.parse(bytes);
assert.equal(new Set(queries.map(q => q.id)).size, queries.length, 'Query IDs must be unique');
assert(queries.every(q => /^(SELECT|WITH)\b/i.test(q.sql.trim())), 'Only SELECT/WITH query manifests accepted');
const sql = neon(env.GENEALOGY_DATABASE_URL);
try {
  const results = await sql.transaction([
    sql`SELECT current_setting('transaction_read_only') AS read_only, current_setting('transaction_isolation') AS isolation, now() AS checked_at, current_database() AS database, current_user AS reader, has_table_privilege(current_user,'genealogy_nodes','SELECT') AS can_select, has_table_privilege(current_user,'genealogy_nodes','INSERT') AS can_insert, has_table_privilege(current_user,'genealogy_nodes','UPDATE') AS can_update, has_table_privilege(current_user,'genealogy_nodes','DELETE') AS can_delete`,
    sql`SELECT set_config('statement_timeout','120000',true) AS statement_timeout`,
    ...queries.map(q => sql.query(q.sql, q.params ?? [source]))
  ], { readOnly: true, isolationLevel: 'RepeatableRead' });
  const context = results[0][0];
  assert.equal(context.read_only, 'on');
  assert.equal(context.isolation, 'repeatable read');
  assert.equal(context.can_insert || context.can_update || context.can_delete, false, 'Use a read-only reader role');
  const report = { context, source, query_sha256: createHash('sha256').update(bytes).digest('hex'), results: Object.fromEntries(queries.map((q,i) => [q.id, results[i+2]])) };
  writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ output, checked_at: context.checked_at, query_count: queries.length, read_only: context.read_only }));
} catch (error) {
  // Deliberately omit connection-bearing error details.
  console.error('Read-only audit failed:', error.code ?? error.name);
  process.exitCode = 1;
}
