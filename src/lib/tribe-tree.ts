export type TribeTreeNodeKind = 'root' | 'zhuz' | 'subgroup' | 'tribe' | 'subtribe';

export interface TribeTreeNode {
  id: string;
  name: string;
  secondaryName?: string;
  kind: TribeTreeNodeKind;
  href?: string;
  tamga?: string;
  summary?: string;
  children?: TribeTreeNode[];
}

export interface PositionedTreeNode extends TribeTreeNode {
  x: number;
  y: number;
  depth: number;
  hasChildren: boolean;
}

export interface TribeTreeLayout {
  nodes: PositionedTreeNode[];
  edges: Array<{ from: PositionedTreeNode; to: PositionedTreeNode }>;
  width: number;
  height: number;
}

const NODE_WIDTH = 184;
const NODE_HEIGHT = 54;
const HORIZONTAL_GAP = 226;
const VERTICAL_GAP = 74;
const PADDING = 48;

export function computeViewportFitScale(
  layoutWidth: number,
  viewportWidth: number,
  padding = 24,
  minScale = 0.55,
  maxScale = 2.2,
) {
  const safeLayoutWidth = Math.max(1, layoutWidth);
  const safeViewportWidth = Math.max(1, viewportWidth);
  const availableWidth = Math.max(1, safeViewportWidth - padding);
  const scale = availableWidth / safeLayoutWidth;
  return Math.min(maxScale, Math.max(minScale, scale));
}

export function normalizeTreeSearch(value: string) {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase('kk-KZ')
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-яәіңғүұқөһ0-9]+/gi, ' ')
    .trim();
}

export function stringifyJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export function flattenTree(root: TribeTreeNode) {
  const result: TribeTreeNode[] = [];
  const visit = (node: TribeTreeNode) => {
    result.push(node);
    node.children?.forEach(visit);
  };
  visit(root);
  return result;
}

export function findTreePath(root: TribeTreeNode, id: string): TribeTreeNode[] {
  if (root.id === id) return [root];
  for (const child of root.children ?? []) {
    const path = findTreePath(child, id);
    if (path.length) return [root, ...path];
  }
  return [];
}

export function searchTree(root: TribeTreeNode, query: string, limit = 8) {
  const needle = normalizeTreeSearch(query);
  if (!needle) return [];

  return flattenTree(root)
    .filter((node) => node.kind !== 'root')
    .filter((node) => normalizeTreeSearch(`${node.name} ${node.secondaryName ?? ''}`).includes(needle))
    .slice(0, limit);
}

export function getExpandedPathIdsForSearchResult(root: TribeTreeNode, targetId: string) {
  const path = findTreePath(root, targetId);
  if (!path.length) return [];

  const ids = path.slice(0, -1).filter((node) => node.children?.length).map((node) => node.id);
  const target = path.at(-1);
  if (target?.children?.length) ids.push(target.id);
  return ids;
}

export function layoutTree(root: TribeTreeNode, expanded: ReadonlySet<string>): TribeTreeLayout {
  const nodes: PositionedTreeNode[] = [];
  const edgeIds: Array<{ from: string; to: string }> = [];
  let leafIndex = 0;
  let maxDepth = 0;

  const visit = (node: TribeTreeNode, depth: number): PositionedTreeNode => {
    maxDepth = Math.max(maxDepth, depth);
    const children = expanded.has(node.id) ? node.children ?? [] : [];
    const positionedChildren = children.map((child) => visit(child, depth + 1));
    const y = positionedChildren.length
      ? (positionedChildren[0].y + positionedChildren[positionedChildren.length - 1].y) / 2
      : PADDING + leafIndex++ * VERTICAL_GAP;
    const positioned: PositionedTreeNode = {
      ...node,
      x: PADDING + depth * HORIZONTAL_GAP,
      y,
      depth,
      hasChildren: Boolean(node.children?.length),
    };
    nodes.push(positioned);
    positionedChildren.forEach((child) => edgeIds.push({ from: node.id, to: child.id }));
    return positioned;
  };

  visit(root, 0);
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const edges = edgeIds.flatMap(({ from, to }) => {
    const fromNode = byId.get(from);
    const toNode = byId.get(to);
    return fromNode && toNode ? [{ from: fromNode, to: toNode }] : [];
  });

  return {
    nodes,
    edges,
    width: PADDING * 2 + maxDepth * HORIZONTAL_GAP + NODE_WIDTH,
    height: Math.max(420, PADDING * 2 + Math.max(1, leafIndex) * VERTICAL_GAP - (VERTICAL_GAP - NODE_HEIGHT)),
  };
}

export const TREE_NODE_WIDTH = NODE_WIDTH;
export const TREE_NODE_HEIGHT = NODE_HEIGHT;
