'use client';

import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  findTreePath,
  computeViewportFitScale,
  layoutTree,
  mergeTreeChildren,
  mergeTreePath,
  normalizeTreeSearch,
  TREE_NODE_HEIGHT,
  TREE_NODE_WIDTH,
  type TribeTreeNode,
} from '@/lib/tribe-tree';
import { ymGoal } from '@/lib/analytics';
import { TRIBES_DB } from '@/data/tribes';
import { TribeJoinModal } from './TribeJoinModal';

interface Props {
  locale: string;
  tree: TribeTreeNode;
  source: string;
  initialFocusId?: string;
  initialJoin?: boolean;
}

interface SearchResult extends TribeTreeNode {
  path: TribeTreeNode[];
}

interface ViewTransform {
  x: number;
  y: number;
  scale: number;
}

type Gesture =
  | { type: 'pan'; startX: number; startY: number; origin: ViewTransform }
  | { type: 'pinch'; distance: number; scale: number; canvasX: number; canvasY: number };

const MIN_SCALE = 0.55;
const MAX_SCALE = 2.2;
const INITIAL_SCALE = 1;

const clampScale = (value: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));

export function InteractiveTree({
  locale,
  tree: initialTree,
  source,
  initialFocusId,
  initialJoin = false,
}: Props) {
  const isKk = locale === 'kk';
  const [tree, setTree] = useState(initialTree);
  const initialPath = useMemo(
    () => findTreePath(initialTree, initialFocusId ?? initialTree.id),
    [initialFocusId, initialTree],
  );
  const initialTargetId = initialPath.at(-1)?.id ?? initialTree.id;
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set([initialTree.id, ...initialPath.slice(0, -1).map((node) => node.id)]),
  );
  const [selectedId, setSelectedId] = useState(initialTargetId);
  const lastUrlSelection = useRef(initialTargetId);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [loadingIds, setLoadingIds] = useState<Set<string>>(() => new Set());
  const [loadErrors, setLoadErrors] = useState<Set<string>>(() => new Set());
  const [transform, setTransform] = useState<ViewTransform>({ x: 20, y: 80, scale: INITIAL_SCALE });
  const [centerRequest, setCenterRequest] = useState({ id: initialTargetId, scale: INITIAL_SCALE, seq: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const gestureRef = useRef<Gesture | null>(null);
  const suppressClickRef = useRef(false);
  const hasCenteredRef = useRef(false);
  const hasInteractedRef = useRef(false);
  const [joinOpen, setJoinOpen] = useState(initialJoin);
  const [linkStatus, setLinkStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  const layout = useMemo(() => layoutTree(tree, expanded), [expanded, tree]);
  const resetLayout = useMemo(() => layoutTree(tree, new Set([tree.id])), [tree]);
  const selectedPath = useMemo(() => findTreePath(tree, selectedId), [selectedId, tree]);
  const selected = selectedPath.at(-1) ?? tree;
  const selectedTribe = useMemo(() => {
    if (selected.kind !== 'tribe') return null;
    const tribeId = selected.id.replace(/^tribe:/, '');
    for (const zhuz of TRIBES_DB) {
      const tribe = zhuz.tribes.find((item) => item.id === tribeId);
      if (tribe) return { tribe, zhuz };
    }
    return null;
  }, [selected]);
  const normalizedQuery = source === 'repo' ? normalizeTreeSearch(query) : query.trim();
  const minSearchLength = source === 'repo' ? 2 : 3;

  useEffect(() => {
    if (lastUrlSelection.current === selectedId) return;
    const url = new URL(window.location.href);
    url.searchParams.set('highlight', selectedId);
    window.history.replaceState(window.history.state, '', url);
    lastUrlSelection.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    ymGoal('public_tree_open', { locale, mode: source === 'repo' ? 'encyclopedia' : 'published', deep_link: Boolean(initialFocusId) });
  }, [initialFocusId, locale, source]);

  useEffect(() => {
    if (normalizedQuery.length < minSearchLength) {
      setResults([]);
      setSearchStatus('idle');
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearchStatus('loading');
      try {
        const params = new URLSearchParams({
          q: normalizedQuery,
          locale,
          source,
        });
        const response = await fetch(`/api/genealogy/search?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error('search_failed');
        const payload = await response.json() as { results?: SearchResult[] };
        setResults(payload.results ?? []);
        setSearchStatus('success');
        ymGoal('public_tree_search', { status: 'success', count: payload.results?.length ?? 0 });
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setResults([]);
        setSearchStatus('error');
        ymGoal('public_tree_search', { status: 'error' });
      }
    }, 250);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [locale, minSearchLength, normalizedQuery, source]);

  const pendingLoads = useRef(new Set<string>());
  const loadChildren = useCallback(async (node: TribeTreeNode) => {
    if (!node.hasChildren || (node.children !== undefined && node.nextChildrenOffset == null)) return node.children ?? [];
    if (pendingLoads.current.has(node.id)) return node.children ?? [];
    pendingLoads.current.add(node.id);
    setLoadingIds((current) => new Set(current).add(node.id));
    setLoadErrors((current) => {
      const next = new Set(current);
      next.delete(node.id);
      return next;
    });
    try {
      const params = new URLSearchParams({ node: node.id, locale, source, offset: String(node.nextChildrenOffset ?? 0) });
      const response = await fetch(`/api/genealogy/children?${params}`);
      if (!response.ok) throw new Error('children_failed');
      const payload = await response.json() as { children?: TribeTreeNode[]; nextOffset?: number | null };
      const children = payload.children ?? [];
      setTree((current) => mergeTreeChildren(current, node.id, children, payload.nextOffset ?? null));
      ymGoal('public_tree_load', { status: 'success', count: children.length });
      return children;
    } catch {
      setLoadErrors((current) => new Set(current).add(node.id));
      ymGoal('public_tree_load', { status: 'error' });
      return [];
    } finally {
      pendingLoads.current.delete(node.id);
      setLoadingIds((current) => {
        const next = new Set(current);
        next.delete(node.id);
        return next;
      });
    }
  }, [locale, source]);

  const centerNode = useCallback((id: string, requestedScale?: number) => {
    const viewport = viewportRef.current;
    const node = layout.nodes.find((item) => item.id === id);
    if (!viewport || !node) return;
    const rect = viewport.getBoundingClientRect();
    const anchorX = rect.width < 640 ? 0.3 : 0.36;
    setTransform((current) => {
      const scale = clampScale(requestedScale ?? current.scale);
      return {
        x: rect.width * anchorX - (node.x + TREE_NODE_WIDTH / 2) * scale,
        y: rect.height / 2 - (node.y + TREE_NODE_HEIGHT / 2) * scale,
        scale,
      };
    });
  }, [layout.nodes]);

  useEffect(() => {
    if (hasCenteredRef.current) return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    const scale = computeViewportFitScale(layout.width, viewport.clientWidth, 24, MIN_SCALE, INITIAL_SCALE);
    setCenterRequest((current) => ({ id: initialTargetId, scale, seq: current.seq + 1 }));
    hasCenteredRef.current = true;
  }, [initialTargetId, layout.width]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || typeof ResizeObserver === 'undefined') return;
    let previousWidth = viewport.clientWidth;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      if (!width || width === previousWidth || hasInteractedRef.current) return;
      previousWidth = width;
      const scale = computeViewportFitScale(layout.width, width, 24, MIN_SCALE, INITIAL_SCALE);
      setCenterRequest((current) => ({ id: selectedId, scale, seq: current.seq + 1 }));
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [layout.width, selectedId]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => centerNode(centerRequest.id, centerRequest.scale));
    return () => cancelAnimationFrame(frame);
  }, [centerNode, centerRequest]);

  const requestCenter = (id: string, scale = transform.scale) => {
    setCenterRequest((current) => ({ id, scale, seq: current.seq + 1 }));
  };

  const selectNode = (node: TribeTreeNode) => {
    if (suppressClickRef.current) return;
    hasInteractedRef.current = true;
    setSelectedId(node.id);
    setLinkStatus('idle');
    if (node.hasChildren || node.children?.length) {
      setExpanded((current) => {
        const next = new Set(current);
        if (next.has(node.id)) next.delete(node.id);
        else next.add(node.id);
        return next;
      });
      void loadChildren(node);
    }
    requestCenter(node.id);
    ymGoal('public_tree_node', { kind: node.kind, action: node.hasChildren || node.children?.length ? (expanded.has(node.id) ? 'collapse' : 'expand') : 'select' });
  };

  const focusSearchResult = (node: SearchResult) => {
    setTree((current) => mergeTreePath(current, node.path));
    setExpanded(new Set(node.path.slice(0, -1).map((pathNode) => pathNode.id)));
    setSelectedId(node.id);
    setLinkStatus('idle');
    setQuery('');
    requestCenter(node.id, 1);
    void loadChildren(node);
    ymGoal('public_tree_search_result', { kind: node.kind });
  };

  const zoomAt = useCallback((clientX: number, clientY: number, factor: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    hasInteractedRef.current = true;
    const rect = viewport.getBoundingClientRect();
    const pointX = clientX - rect.left;
    const pointY = clientY - rect.top;
    setTransform((current) => {
      const scale = clampScale(current.scale * factor);
      const canvasX = (pointX - current.x) / current.scale;
      const canvasY = (pointY - current.y) / current.scale;
      return { x: pointX - canvasX * scale, y: pointY - canvasY * scale, scale };
    });
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const handleWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      zoomAt(event.clientX, event.clientY, event.deltaY < 0 ? 1.12 : 0.89);
    };
    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', handleWheel);
  }, [zoomAt]);

  const zoomFromCenter = (factor: number) => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (rect) zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, factor);
  };

  const resetView = () => {
    hasInteractedRef.current = false;
    setExpanded(new Set([tree.id]));
    setSelectedId(tree.id);
    setLinkStatus('idle');
    const viewport = viewportRef.current;
    const nextScale = viewport
      ? computeViewportFitScale(resetLayout.width, viewport.clientWidth, 24, MIN_SCALE, INITIAL_SCALE)
      : MIN_SCALE;
    requestCenter(tree.id, nextScale);
  };

  const closeJoin = () => {
    setJoinOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('join');
    window.history.replaceState(null, '', url);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if ((event.target as HTMLElement).closest('.tt-toolbar, .tt-search-panel')) return;
    const startedOnNode = Boolean((event.target as HTMLElement).closest('.tt-node'));
    if (!startedOnNode) event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    suppressClickRef.current = false;

    const points = [...pointersRef.current.values()];
    if (points.length === 1) {
      gestureRef.current = { type: 'pan', startX: points[0].x, startY: points[0].y, origin: transform };
    } else if (points.length === 2) {
      hasInteractedRef.current = true;
      suppressClickRef.current = true;
      for (const pointerId of pointersRef.current.keys()) {
        if (!event.currentTarget.hasPointerCapture(pointerId)) {
          event.currentTarget.setPointerCapture(pointerId);
        }
      }
      const [a, b] = points;
      const rect = event.currentTarget.getBoundingClientRect();
      const midpointX = (a.x + b.x) / 2;
      const midpointY = (a.y + b.y) / 2;
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      gestureRef.current = {
        type: 'pinch',
        distance,
        scale: transform.scale,
        canvasX: (midpointX - rect.left - transform.x) / transform.scale,
        canvasY: (midpointY - rect.top - transform.y) / transform.scale,
      };
    }
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = [...pointersRef.current.values()];
    const gesture = gestureRef.current;

    if (points.length === 1 && gesture?.type === 'pan') {
      const dx = points[0].x - gesture.startX;
      const dy = points[0].y - gesture.startY;
      if (Math.abs(dx) + Math.abs(dy) > 5) {
        suppressClickRef.current = true;
        hasInteractedRef.current = true;
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.setPointerCapture(event.pointerId);
        }
      }
      setTransform({ ...gesture.origin, x: gesture.origin.x + dx, y: gesture.origin.y + dy });
    } else if (points.length === 2) {
      const [a, b] = points;
      const midpointX = (a.x + b.x) / 2;
      const midpointY = (a.y + b.y) / 2;
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      const pinch = gesture?.type === 'pinch' ? gesture : null;
      if (!pinch) return;
      const rect = event.currentTarget.getBoundingClientRect();
      suppressClickRef.current = true;
      hasInteractedRef.current = true;
      const scale = clampScale(pinch.scale * (distance / pinch.distance));
      setTransform({
        x: midpointX - rect.left - pinch.canvasX * scale,
        y: midpointY - rect.top - pinch.canvasY * scale,
        scale,
      });
    }
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(event.pointerId);
    const remaining = [...pointersRef.current.values()];
    if (remaining.length === 1) {
      gestureRef.current = {
        type: 'pan',
        startX: remaining[0].x,
        startY: remaining[0].y,
        origin: transform,
      };
    } else {
      gestureRef.current = null;
      window.setTimeout(() => { suppressClickRef.current = false; }, 0);
    }
  };

  return (
    <section className="tt-explorer ym-hide-content" aria-labelledby="tree-explorer-title">
      <div className="tt-explorer-heading">
        <div>
          <span className="tt-eyebrow">{isKk ? 'Интерактивті карта' : 'Интерактивная карта'}</span>
          <h2 id="tree-explorer-title">{isKk ? 'Рулар ағашын зерттеңіз' : 'Исследуйте дерево родов'}</h2>
        </div>
        <p>{isKk ? 'Түйінді ашыңыз, ағашты саусақпен жылжытыңыз және масштабтаңыз.' : 'Раскрывайте узлы, перемещайте дерево пальцем и меняйте масштаб.'}</p>
      </div>

      <div className="tt-search-panel">
        <label htmlFor="tribe-tree-search">{isKk ? 'Руды немесе тармақты табу' : 'Найти род или ветвь'}</label>
        <div className="tt-search-box">
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m21 21-4.3-4.3m2.3-5.2a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" /></svg>
          <input
            id="tribe-tree-search"
            className="ym-disable-keys"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={isKk ? 'Мысалы: Адай, Найман, Байұлы' : 'Например: Адай, Найман, Байулы'}
            autoComplete="off"
          />
          {query && <button type="button" onClick={() => setQuery('')} aria-label={isKk ? 'Іздеуді тазарту' : 'Очистить поиск'}>×</button>}
        </div>
        {normalizedQuery.length >= minSearchLength && (
          <div className="tt-search-results" aria-live="polite">
            {searchStatus === 'loading' ? (
              <p>{isKk ? 'Ізделуде…' : 'Ищем…'}</p>
            ) : searchStatus === 'error' ? (
              <p>{isKk ? 'Іздеу уақытша қолжетімсіз' : 'Поиск временно недоступен'}</p>
            ) : results.length ? results.map((node) => (
              <button key={node.id} type="button" onClick={() => focusSearchResult(node)}>
                <span>{node.name}</span>
                <small>{node.path.slice(0, -1).map((item) => item.name).join(' → ')}</small>
              </button>
            )) : searchStatus === 'success' ? (
              <p>{isKk ? 'Сәйкестік табылмады' : 'Совпадений не найдено'}</p>
            ) : null}
          </div>
        )}
      </div>

      <nav className="tt-mobile-browser" aria-label={isKk ? 'Шежіре тармақтары' : 'Ветви шежіре'}>
        <div className="tt-mobile-browser-head">
          <button
            type="button"
            onClick={() => {
              const parent = selectedPath.at(-2);
              if (parent) { setSelectedId(parent.id); setLinkStatus('idle'); }
            }}
            disabled={selectedPath.length < 2}
          >
            <span aria-hidden="true">←</span> {isKk ? 'Артқа' : 'Назад'}
          </button>
          <div>
            <small>{selectedPath.map((node) => node.name).join(' → ')}</small>
            <h3>{selected.name}</h3>
          </div>
        </div>

        {loadingIds.has(selected.id) && !selected.children ? (
          <div className="tt-mobile-loading" role="status">
            <span />
            <span />
            <span />
          </div>
        ) : loadErrors.has(selected.id) && !selected.children?.length ? (
          <div className="tt-mobile-message" role="alert">
            <p>{isKk ? 'Тармақ жүктелмеді.' : 'Не удалось загрузить ветвь.'}</p>
            <button type="button" onClick={() => void loadChildren(selected)}>
              {isKk ? 'Қайталау' : 'Повторить'}
            </button>
          </div>
        ) : selected.hasChildren && selected.children === undefined ? (
          <button type="button" onClick={() => void loadChildren(selected)}>
            {isKk ? 'Тармақтарды көрсету' : 'Показать ветви'}
          </button>
        ) : selected.children?.length ? (
          <ul>
            {selected.children.map((child) => (
              <li key={child.id}>
                <button type="button" onClick={() => selectNode(child)}>
                  <span>
                    <strong>{child.name}</strong>
                    {child.secondaryName && child.secondaryName !== child.name && <small>{child.secondaryName}</small>}
                  </span>
                  {child.hasChildren && <b aria-hidden="true">→</b>}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="tt-mobile-empty">{isKk ? 'Бұл тармақта жалғасы жоқ.' : 'У этой ветви нет продолжения.'}</p>
        )}
        {selected.children?.length && selected.nextChildrenOffset != null ? (
          <div>
            {loadErrors.has(selected.id) && <p role="alert">{isKk ? 'Тармақ жүктелмеді.' : 'Не удалось загрузить ветвь.'}</p>}
            <button type="button" disabled={loadingIds.has(selected.id)} onClick={() => void loadChildren(selected)}>
              {loadingIds.has(selected.id) ? (isKk ? 'Жүктелуде…' : 'Загрузка…') : (isKk ? 'Тағы тармақтарды көрсету' : 'Показать ещё ветви')}
            </button>
          </div>
        ) : null}
      </nav>

      <div
        ref={viewportRef}
        className="tt-viewport"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        aria-label={isKk ? 'Қазақ руларының интерактивті ағашы' : 'Интерактивное дерево казахских родов'}
      >
        <div className="tt-toolbar" aria-label={isKk ? 'Масштаб басқару' : 'Управление масштабом'}>
          <button type="button" onClick={() => zoomFromCenter(1.18)} aria-label={isKk ? 'Үлкейту' : 'Приблизить'}>+</button>
          <button type="button" onClick={() => zoomFromCenter(0.85)} aria-label={isKk ? 'Кішірейту' : 'Отдалить'}>−</button>
          <button type="button" className="tt-reset" onClick={resetView}>{isKk ? 'Басы' : 'Сначала'}</button>
        </div>
        <p className="tt-gesture-hint">{isKk ? 'Бір саусақ — жылжыту · Екі саусақ — масштаб' : 'Один палец — двигать · Два — масштаб'}</p>

        <div
          className="tt-canvas"
          style={{
            width: layout.width,
            height: layout.height,
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
          }}
        >
          <svg className="tt-lines" width={layout.width} height={layout.height} aria-hidden="true">
            {layout.edges.map(({ from, to }) => {
              const x1 = from.x + TREE_NODE_WIDTH;
              const y1 = from.y + TREE_NODE_HEIGHT / 2;
              const x2 = to.x;
              const y2 = to.y + TREE_NODE_HEIGHT / 2;
              const bend = (x2 - x1) * 0.5;
              return <path key={`${from.id}-${to.id}`} d={`M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`} />;
            })}
          </svg>

          {layout.nodes.map((node) => {
            const isExpanded = expanded.has(node.id);
            const isSelected = selectedId === node.id;
            return (
              <button
                key={node.id}
                type="button"
                className={`tt-node tt-node--${node.kind}${isSelected ? ' is-selected' : ''}`}
                style={{ left: node.x, top: node.y, width: TREE_NODE_WIDTH, height: TREE_NODE_HEIGHT }}
                onClick={() => selectNode(node)}
                aria-expanded={node.hasChildren ? isExpanded : undefined}
              >
                {node.tamga && <span className="tt-node-tamga" aria-hidden="true">{node.tamga}</span>}
                <span className="tt-node-copy">
                  <strong>{node.name}</strong>
                  {node.secondaryName && node.secondaryName !== node.name && <small>{node.secondaryName}</small>}
                </span>
                {node.hasChildren && (
                  <span className="tt-node-toggle" aria-hidden="true">
                    {loadingIds.has(node.id) ? '…' : isExpanded ? '−' : '+'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <article className="tt-detail" aria-live="polite">
        <div className="tt-detail-path">
          {selectedPath.map((node, index) => (
            <span key={node.id}>{index > 0 && <b>→</b>}{node.name}</span>
          ))}
        </div>
        <div className="tt-detail-main">
          <div className="tt-detail-title">
            {selected.tamga && <span aria-hidden="true">{selected.tamga}</span>}
            <div>
              <p>{isKk ? 'Таңдалған түйін' : 'Выбранный узел'}</p>
              <h3>{selected.name}</h3>
            </div>
          </div>
          {selected.summary && <p className="tt-detail-summary">{selected.summary}</p>}
          <div className="tt-detail-actions">
            <button type="button" className="tt-detail-link" onClick={async () => {
              const url = new URL(window.location.pathname, window.location.origin);
              url.searchParams.set('highlight', selected.id);
              if (source === 'repo') url.searchParams.set('view', 'reference');
              try {
                await navigator.clipboard.writeText(url.href);
                setLinkStatus('copied');
                ymGoal('public_tree_link', { kind: selected.kind, status: 'copied' });
              } catch {
                setLinkStatus('error');
              }
            }}>{isKk ? 'Тармақ сілтемесін көшіру' : 'Скопировать ссылку на ветвь'}</button>
            <span role="status">{linkStatus === 'copied' ? (isKk ? 'Сілтеме көшірілді' : 'Ссылка скопирована') : linkStatus === 'error' ? (isKk ? 'Сілтемені браузердің мекенжай жолағынан көшіріңіз' : 'Скопируйте ссылку из адресной строки браузера') : ''}</span>
            {selected.hasChildren && (selected.children === undefined || selected.nextChildrenOffset != null) && (
              <button type="button" className="tt-detail-link" disabled={loadingIds.has(selected.id)} onClick={() => void loadChildren(selected)}>
                {loadingIds.has(selected.id) ? (isKk ? 'Жүктелуде…' : 'Загрузка…') : (isKk ? 'Тағы тармақтарды көрсету' : 'Показать ещё ветви')}
              </button>
            )}
            {loadErrors.has(selected.id) && <p role="alert">{isKk ? 'Тармақ жүктелмеді. Қайталап көріңіз.' : 'Ветвь не загрузилась. Повторите попытку.'}</p>}
            {selected.href && (
              <Link href={selected.href} className="tt-detail-link" onClick={() => ymGoal('public_tree_article', { kind: selected.kind })}>
                {isKk ? 'Толық мәліметті ашу' : 'Подробнее'} <span aria-hidden="true">→</span>
              </Link>
            )}
            {selectedTribe && (
              <button type="button" className="tt-detail-link tt-detail-join" onClick={() => setJoinOpen(true)}>
                {isKk ? 'Руға қосылу' : 'Вступить в род'} <span aria-hidden="true">+</span>
              </button>
            )}
          </div>
        </div>
      </article>
      {joinOpen && selectedTribe && (
        <TribeJoinModal
          tribe={selectedTribe.tribe}
          zhuz={selectedTribe.zhuz}
          locale={locale}
          onClose={closeJoin}
          onJoined={() => {
            const url = new URL(window.location.href);
            url.searchParams.delete('join');
            window.history.replaceState(null, '', url);
            window.location.reload();
          }}
        />
      )}
    </section>
  );
}
