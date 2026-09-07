-- Run only against the intended snapshot with a specifically authorized read-only
-- credential. Returns aggregate/catalog evidence, never names or node identifiers.
BEGIN TRANSACTION READ ONLY;
SET LOCAL statement_timeout = '15s';
SELECT count(*) AS total,
 count(*) FILTER (WHERE is_public) AS public,
 count(*) FILTER (WHERE locked) AS locked,
 count(*) FILTER (WHERE is_public AND (reviewed_at IS NULL OR coalesce(length(trim(publication_basis)),0)=0)) AS invalid_public,
 max(depth) AS max_depth, min(source_snapshot_at) AS first_snapshot, max(source_snapshot_at) AS last_snapshot
FROM genealogy_nodes;
SELECT max(width) AS widest_branch FROM (SELECT count(*) AS width FROM genealogy_nodes GROUP BY parent_key) widths;
SELECT count(*) AS broken_public_parent_paths FROM genealogy_nodes n LEFT JOIN genealogy_nodes p ON p.node_key=n.parent_key
WHERE n.is_public AND n.parent_key IS NOT NULL AND (p.node_key IS NULL OR NOT p.is_public OR p.reviewed_at IS NULL OR coalesce(length(trim(p.publication_basis)),0)=0 OR p.source<>n.source);
SELECT relrowsecurity AS rls_enabled FROM pg_class WHERE oid='genealogy_nodes'::regclass;
SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid='genealogy_nodes'::regclass;
SELECT has_table_privilege(current_user, 'genealogy_nodes','SELECT') AS can_read,
 has_table_privilege(current_user,'genealogy_nodes','INSERT') AS can_insert,
 has_table_privilege(current_user,'genealogy_nodes','UPDATE') AS can_update,
 has_table_privilege(current_user,'genealogy_nodes','DELETE') AS can_delete;
ROLLBACK;
