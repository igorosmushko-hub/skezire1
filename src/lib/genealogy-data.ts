import 'server-only';

import { TRIBES_DB } from '../data/tribes';
import { getSupabase } from './supabase';
import {
  findTreePath,
  normalizeTreeSearch,
  mergeTreePath,
  pruneTree,
  searchTree,
  type TribeTreeNode,
  type TribeTreeNodeKind,
} from './tribe-tree';
import { buildTribeTree } from './tribe-tree-page';

export interface GenealogySearchResult extends TribeTreeNode {
  path: TribeTreeNode[];
}

export interface InitialGenealogyTree {
  source: string;
  tree: TribeTreeNode;
}

function kindForDepth(depth: number): TribeTreeNodeKind {
  if (depth === 0) return 'root';
  if (depth === 1) return 'zhuz';
  if (depth === 2) return 'tribe';
  return 'subtribe';
}

function repositoryTree(locale: string) {
  return buildTribeTree(locale, TRIBES_DB);
}

export function getRepositoryChildren(locale: string, parentId: string): TribeTreeNode[] | null {
  const parent = findTreePath(repositoryTree(locale), parentId).at(-1);
  if (!parent) return null;
  return (parent.children ?? []).map((child) => pruneTree(child, 0));
}

export function searchRepositoryGenealogy(locale: string, query: string): GenealogySearchResult[] {
  const tree = repositoryTree(locale);
  return searchTree(tree, query).map((node) => ({
    ...pruneTree(node, 0),
    path: findTreePath(tree, node.id).map((pathNode) => pruneTree(pathNode, 0)),
  }));
}

export async function getPublicGenealogyChildren(parentKey: string): Promise<TribeTreeNode[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('db_not_configured');
  const { data, error } = await supabase.rpc('get_public_genealogy_children', {
    p_parent_key: parentKey,
  });
  if (error) throw error;
  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: String(row.node_key),
    name: String(row.name),
    kind: kindForDepth(Number(row.depth)),
    hasChildren: Boolean(row.has_children),
  }));
}

export async function searchPublicGenealogy(
  source: string,
  query: string,
): Promise<GenealogySearchResult[]> {
  const normalized = normalizeTreeSearch(query);
  if (normalized.length < 2) return [];
  const supabase = getSupabase();
  if (!supabase) throw new Error('db_not_configured');
  const { data, error } = await supabase.rpc('search_public_genealogy', {
    p_source: source,
    p_query: normalized,
    p_limit: 8,
  });
  if (error) throw error;
  return (data ?? []).map((row: Record<string, unknown>) => {
    const path = Array.isArray(row.path) ? row.path : [];
    return {
      id: String(row.node_key),
      name: String(row.name),
      kind: kindForDepth(Number(row.depth)),
      hasChildren: Boolean(row.has_children),
      path: path.map((node) => {
        const item = node as Record<string, unknown>;
        return {
          id: String(item.id),
          name: String(item.name),
          kind: String(item.kind) as TribeTreeNodeKind,
          hasChildren: String(item.id) === String(row.node_key) ? Boolean(row.has_children) : true,
        };
      }),
    };
  });
}

export async function getInitialGenealogyTree(
  locale: string,
  initialFocusId?: string,
): Promise<InitialGenealogyTree> {
  const fullTree = repositoryTree(locale);
  const initialTree = pruneTree(fullTree, 1);
  const focusPath = initialFocusId ? findTreePath(fullTree, initialFocusId) : [];
  if (focusPath.length) {
    return {
      source: 'repo',
      tree: mergeTreePath(initialTree, focusPath.map((node) => pruneTree(node, 0))),
    };
  }

  const rootKey = process.env.GENEALOGY_ROOT_KEY?.trim();
  const source = process.env.GENEALOGY_SOURCE?.trim();
  const supabase = getSupabase();
  if (rootKey && source && supabase) {
    try {
      const { data: root, error } = await supabase
        .from('genealogy_nodes')
        .select('node_key, name, depth')
        .eq('node_key', rootKey)
        .eq('source', source)
        .eq('is_public', true)
        .maybeSingle();
      if (!error && root) {
        const children = await getPublicGenealogyChildren(root.node_key);
        return {
          source,
          tree: {
            id: root.node_key,
            name: root.name,
            kind: kindForDepth(root.depth),
            hasChildren: children.length > 0,
            children,
          },
        };
      }
    } catch {
      // Keep the repository-owned tree available while a migration or import is incomplete.
    }
  }

  return { source: 'repo', tree: initialTree };
}
