import 'server-only';

import { neon } from '@neondatabase/serverless';
import { TRIBES_DB } from '../data/tribes';
import { findTreePath, mergeTreePath, pruneTree, searchTree, type TribeTreeNode } from './tribe-tree';
import { buildTribeTree } from './tribe-tree-page';

export interface GenealogySearchResult extends TribeTreeNode { path: TribeTreeNode[] }
export interface InitialGenealogyTree { source: string; tree: TribeTreeNode; focusId?: string }
export const GENEALOGY_PAGE_SIZE = 100;

function database() {
  // Private preview credentials/configuration must never enable public access.
  if (process.env.GENEALOGY_INCLUDE_PRIVATE === '1') throw new Error('genealogy_private_mode_forbidden');
  const source = process.env.GENEALOGY_SOURCE?.trim();
  const root = process.env.GENEALOGY_ROOT_KEY?.trim();
  const url = process.env.GENEALOGY_DATABASE_URL?.trim();
  if (!source || source === 'repo' || !root || !url) throw new Error('genealogy_not_configured');
  return { source, root, sql: neon(url, { fetchOptions: { signal: AbortSignal.timeout(8000) } }) };
}

type Row = Record<string, unknown>;
function mapNode(row: Row): TribeTreeNode {
  return { id: String(row.node_key), name: String(row.name),
    // Depth describes graph position, not a verified tribe/person classification.
    kind: Number(row.depth) === 0 ? 'root' : 'subtribe', hasChildren: Boolean(row.has_children) };
}

function repositoryTree(locale: string) { return buildTribeTree(locale, TRIBES_DB); }
export function getRepositoryChildren(locale: string, parentId: string): TribeTreeNode[] | null {
  const parent = findTreePath(repositoryTree(locale), parentId).at(-1);
  return parent ? (parent.children ?? []).map(child => pruneTree(child, 0)) : null;
}
export function searchRepositoryGenealogy(locale: string, query: string): GenealogySearchResult[] {
  const tree = repositoryTree(locale);
  return searchTree(tree, query).map(node => ({ ...pruneTree(node, 0), path: findTreePath(tree, node.id).map(item => pruneTree(item, 0)) }));
}

export async function getPublicGenealogyPath(key: string): Promise<TribeTreeNode[]> {
  const { sql, source, root } = database();
  const externalId = /^\d{1,18}$/.test(key) ? key : null;
  const rows = await sql`
    WITH RECURSIVE target AS (
      SELECT * FROM genealogy_nodes
      WHERE source = ${source} AND (node_key = ${key} OR external_id = ${externalId}::bigint)
        AND is_public AND reviewed_at IS NOT NULL AND length(trim(publication_basis)) > 0
      LIMIT 2
    ), ancestors AS (
      SELECT node_key, parent_key, name, depth, ARRAY[node_key] AS visited, 0 AS steps FROM target
      WHERE (SELECT count(*) FROM target) = 1
      UNION ALL
      SELECT p.node_key, p.parent_key, p.name, p.depth, a.visited || p.node_key, a.steps + 1
      FROM ancestors a JOIN genealogy_nodes p ON p.node_key = a.parent_key
      WHERE p.source = ${source} AND p.is_public
        AND p.reviewed_at IS NOT NULL AND length(trim(p.publication_basis)) > 0
        AND a.steps < 64 AND NOT p.node_key = ANY(a.visited)
    )
    SELECT a.*, EXISTS(SELECT 1 FROM genealogy_nodes c WHERE c.parent_key = a.node_key
      AND c.source = ${source} AND c.is_public
      AND c.reviewed_at IS NOT NULL AND length(trim(c.publication_basis)) > 0) AS has_children
    FROM ancestors a ORDER BY steps DESC
  `;
  if (!rows.length || rows[0].node_key !== root || rows[0].parent_key !== null) return [];
  return rows.map(mapNode);
}

export async function getPublicGenealogyChildren(parentKey: string, offset = 0) {
  const { sql, source, root } = database();
  const rows = await sql`
    WITH RECURSIVE ancestors AS (
      SELECT node_key, parent_key, ARRAY[node_key] AS visited FROM genealogy_nodes
      WHERE node_key = ${parentKey} AND source = ${source} AND is_public
        AND reviewed_at IS NOT NULL AND length(trim(publication_basis)) > 0
      UNION ALL
      SELECT p.node_key, p.parent_key, a.visited || p.node_key
      FROM ancestors a JOIN genealogy_nodes p ON p.node_key = a.parent_key
      WHERE p.source = ${source} AND p.is_public
        AND p.reviewed_at IS NOT NULL AND length(trim(p.publication_basis)) > 0
        AND cardinality(a.visited) < 65 AND NOT p.node_key = ANY(a.visited)
    ), permitted AS (
      SELECT 1 FROM ancestors WHERE node_key = ${root} AND parent_key IS NULL
    ), children AS (
    SELECT n.node_key, n.name, n.depth, row_number() OVER (ORDER BY n.sort_order, n.external_id, n.node_key) AS ordinal,
      EXISTS(SELECT 1 FROM genealogy_nodes c WHERE c.parent_key = n.node_key
        AND c.source = ${source} AND c.is_public
        AND c.reviewed_at IS NOT NULL AND length(trim(c.publication_basis)) > 0) AS has_children
    FROM genealogy_nodes n WHERE n.parent_key = ${parentKey} AND n.source = ${source}
      AND n.is_public AND n.reviewed_at IS NOT NULL AND length(trim(n.publication_basis)) > 0
    ORDER BY n.sort_order, n.external_id, n.node_key LIMIT ${GENEALOGY_PAGE_SIZE + 1} OFFSET ${offset}
    )
    SELECT children.* FROM children WHERE EXISTS(SELECT 1 FROM permitted)
    UNION ALL
    SELECT NULL, NULL, NULL, NULL, NULL WHERE NOT EXISTS(SELECT 1 FROM permitted)
    ORDER BY ordinal
  `;
  if (rows.some(row => row.node_key === null)) return null;
  return { children: rows.slice(0, GENEALOGY_PAGE_SIZE).map(mapNode),
    nextOffset: rows.length > GENEALOGY_PAGE_SIZE ? offset + GENEALOGY_PAGE_SIZE : null };
}

export async function searchPublicGenealogy(source: string, query: string): Promise<GenealogySearchResult[]> {
  const db = database();
  if (source !== db.source) throw new Error('invalid_source');
  const normalized = query.trim();
  if (normalized.length < 3) return [];
  const escaped = normalized.replace(/[\\%_]/g, '\\$&');
  const rows = await db.sql`
    WITH RECURSIVE matches AS (
      SELECT node_key, parent_key, name, depth,
        row_number() OVER (ORDER BY (lower(name) LIKE lower(${escaped}) || '%') DESC, depth, name, node_key) AS match_rank
      FROM genealogy_nodes WHERE source = ${source}
        AND is_public AND reviewed_at IS NOT NULL AND length(trim(publication_basis)) > 0
        AND lower(name) LIKE '%' || lower(${escaped}) || '%'
      ORDER BY (lower(name) LIKE lower(${escaped}) || '%') DESC, depth, name, node_key LIMIT 8
    ), ancestors AS (
      SELECT node_key AS target, node_key, parent_key, name, depth, match_rank, ARRAY[node_key] AS visited, 0 AS steps FROM matches
      UNION ALL
      SELECT a.target, p.node_key, p.parent_key, p.name, p.depth, a.match_rank, a.visited || p.node_key, a.steps+1
      FROM ancestors a JOIN genealogy_nodes p ON p.node_key=a.parent_key
      WHERE p.source=${source} AND p.is_public AND p.reviewed_at IS NOT NULL
        AND length(trim(p.publication_basis))>0 AND a.steps<64 AND NOT p.node_key=ANY(a.visited)
    )
    SELECT a.*, EXISTS(SELECT 1 FROM genealogy_nodes c WHERE c.parent_key=a.node_key
      AND c.source=${source} AND c.is_public AND c.reviewed_at IS NOT NULL
      AND length(trim(c.publication_basis))>0) AS has_children
    FROM ancestors a WHERE EXISTS(SELECT 1 FROM ancestors r WHERE r.target=a.target AND r.node_key=${db.root} AND r.parent_key IS NULL)
    ORDER BY a.match_rank, a.steps DESC
  `;
  const paths = new Map<string, TribeTreeNode[]>();
  rows.forEach(row => {
    const path = paths.get(String(row.target)) ?? [];
    path.push(mapNode(row));
    paths.set(String(row.target), path);
  });
  return [...paths.values()].map(path => ({ ...path.at(-1)!, path }));
}

export async function getInitialGenealogyTree(locale: string, initialFocusId?: string): Promise<InitialGenealogyTree> {
  if (process.env.GENEALOGY_INCLUDE_PRIVATE === '1') throw new Error('genealogy_private_mode_forbidden');
  if (initialFocusId && (initialFocusId.length > 200 || /[\u0000-\u001f]/.test(initialFocusId))) throw new Error('genealogy_focus_unavailable');
  const source = process.env.GENEALOGY_SOURCE?.trim();
  const fullTree = repositoryTree(locale);
  const legacyPath = initialFocusId ? findTreePath(fullTree, initialFocusId) : [];
  // The first release opens the curated directory. A DB lookup needs an explicit
  // external focus and a configured external source; this is never an outage fallback.
  if (!initialFocusId || legacyPath.length || !source || source === 'repo' || /^(tribe:|zhuz:|subtribe:)/.test(initialFocusId)) {
    if (initialFocusId && !legacyPath.length) throw new Error('genealogy_focus_unavailable');
    return { source: 'repo', tree: mergeTreePath(pruneTree(fullTree, 1), legacyPath.map(node => pruneTree(node, 0))), focusId: initialFocusId };
  }
  const db = database();
  const rootPath = await getPublicGenealogyPath(db.root);
  if (!rootPath.length) throw new Error('genealogy_public_root_unavailable');
  const page = await getPublicGenealogyChildren(db.root);
  if (!page) throw new Error('genealogy_public_root_unavailable');
  let tree: TribeTreeNode = { ...rootPath[0], children: page.children, nextChildrenOffset: page.nextOffset };
  const path = initialFocusId ? await getPublicGenealogyPath(initialFocusId) : [];
  if (initialFocusId && !path.length) throw new Error('genealogy_focus_unavailable');
  if (path.length) tree = mergeTreePath(tree, path);
  return { source: db.source, tree, focusId: path.at(-1)?.id };
}
