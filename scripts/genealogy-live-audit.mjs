// Read-only aggregate audit. Load a separately authorized preview env file with node --env-file.
import { neon } from '@neondatabase/serverless';
import fs from 'node:fs';
if (!process.env.GENEALOGY_DATABASE_URL) throw Error('genealogy_not_configured');
try {
  if (process.env.GENEALOGY_DATABASE_URL === '[SENSITIVE]') throw Error('credential_redacted');
  const sql = neon(process.env.GENEALOGY_DATABASE_URL, { fetchOptions: { signal: AbortSignal.timeout(30000) } });
  const results = await sql.transaction([
    sql`SELECT count(*)::int total, count(*) FILTER(WHERE is_public)::int public,
      count(*) FILTER(WHERE locked)::int locked, max(depth)::int max_depth,
      min(source_snapshot_at) first_snapshot, max(source_snapshot_at) last_snapshot,
      count(*) FILTER(WHERE is_public AND (reviewed_at IS NULL OR coalesce(length(trim(publication_basis)),0)=0))::int invalid_public
      FROM genealogy_nodes WHERE source=${process.env.GENEALOGY_SOURCE}`,
    sql`SELECT max(width)::int widest_branch FROM (SELECT count(*) width FROM genealogy_nodes WHERE source=${process.env.GENEALOGY_SOURCE} GROUP BY parent_key) widths`,
    sql`SELECT is_public, locked, reviewed_at IS NOT NULL reviewed, coalesce(length(trim(publication_basis)),0)>0 has_publication_basis, parent_key IS NULL is_root FROM genealogy_nodes WHERE node_key=${process.env.GENEALOGY_ROOT_KEY ?? ''} AND source=${process.env.GENEALOGY_SOURCE}`,
    sql`SELECT relrowsecurity rls_enabled FROM pg_class WHERE oid='genealogy_nodes'::regclass`,
    sql`SELECT conname, pg_get_constraintdef(oid) definition FROM pg_constraint WHERE conrelid='genealogy_nodes'::regclass`,
    sql`SELECT has_table_privilege(current_user,'genealogy_nodes','SELECT') can_read, has_table_privilege(current_user,'genealogy_nodes','INSERT') can_insert, has_table_privilege(current_user,'genealogy_nodes','UPDATE') can_update, has_table_privilege(current_user,'genealogy_nodes','DELETE') can_delete`,
    sql`SELECT count(*)::int broken_public_parent_paths FROM genealogy_nodes n LEFT JOIN genealogy_nodes p ON p.node_key=n.parent_key WHERE n.is_public AND n.parent_key IS NOT NULL AND (p.node_key IS NULL OR NOT p.is_public OR p.reviewed_at IS NULL OR coalesce(length(trim(p.publication_basis)),0)=0 OR p.source<>n.source)`,
    sql`SELECT indexname, indexdef FROM pg_indexes WHERE tablename='genealogy_nodes'`,
  ], { readOnly: true, isolationLevel: 'RepeatableRead' });
  const labels = ['counts','width','configuredRoot','rls','constraints','role','publicPaths','indexes'];
  const report = { checkedAt: new Date().toISOString(), source: process.env.GENEALOGY_SOURCE,
    configScope: 'existing Neon preview reader from authenticated console; no roles or passwords changed',
    auditReadOnly: true, includesPrivateAggregates: true,
    ...Object.fromEntries(labels.map((label,i)=>[label,results[i]])) };
  fs.writeFileSync('docs/seo/genealogy-live-db-2026-09-05.json', JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
} catch(error) { console.error('Read-only audit failed', error.message === 'credential_redacted' ? 'credential_redacted' : error.code ?? error.name); process.exitCode=1; }
