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
  getExpandedPathIdsForSearchResult,
  computeViewportFitScale,
  layoutTree,
  normalizeTreeSearch,
  searchTree,
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
  initialFocusId?: string;
  initialJoin?: boolean;
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

export function InteractiveTree({ locale, tree, initialFocusId, initialJoin = false }: Props) {
  const isKk = locale === 'kk';
  const initialPath = useMemo(
    () => findTreePath(tree, initialFocusId ?? tree.id),
    [initialFocusId, tree],
  );
  const initialTargetId = initialPath.at(-1)?.id ?? tree.id;
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set([tree.id, ...initialPath.slice(0, -1).map((node) => node.id)]),
  );
  const [selectedId, setSelectedId] = useState(initialTargetId);
  const [query, setQuery] = useState('');
  const [transform, setTransform] = useState<ViewTransform>({ x: 20, y: 80, scale: INITIAL_SCALE });
  const [centerRequest, setCenterRequest] = useState({ id: initialTargetId, scale: INITIAL_SCALE, seq: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const gestureRef = useRef<Gesture | null>(null);
  const suppressClickRef = useRef(false);
  const hasCenteredRef = useRef(false);
  const hasInteractedRef = useRef(false);
  const [joinOpen, setJoinOpen] = useState(initialJoin);

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
  const normalizedQuery = normalizeTreeSearch(query);
  const results = useMemo(
    () => normalizedQuery.length >= 2 ? searchTree(tree, normalizedQuery) : [],
    [normalizedQuery, tree],
  );

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
    if (node.children?.length) {
      setExpanded((current) => {
        const next = new Set(current);
        if (next.has(node.id)) next.delete(node.id);
        else next.add(node.id);
        return next;
      });
    }
    requestCenter(node.id);
    ymGoal('public_tree_node', { kind: node.kind });
  };

  const focusSearchResult = (node: TribeTreeNode) => {
    setExpanded(new Set(getExpandedPathIdsForSearchResult(tree, node.id)));
    setSelectedId(node.id);
    setQuery('');
    requestCenter(node.id, 1);
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
    <section className="tt-explorer" aria-labelledby="tree-explorer-title">
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
        {normalizedQuery.length >= 2 && (
          <div className="tt-search-results" aria-live="polite">
            {results.length ? results.map((node) => (
              <button key={node.id} type="button" onClick={() => focusSearchResult(node)}>
                <span>{node.name}</span>
                <small>{node.secondaryName}</small>
              </button>
            )) : <p>{isKk ? 'Сәйкестік табылмады' : 'Совпадений не найдено'}</p>}
          </div>
        )}
      </div>

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
                {node.hasChildren && <span className="tt-node-toggle" aria-hidden="true">{isExpanded ? '−' : '+'}</span>}
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
            {selected.href && (
              <Link href={selected.href} className="tt-detail-link">
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
