-- Source editing restrictions do not decide publication. Apply after 004.
-- This migration never changes is_public/reviewed_at/publication_basis.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';

ALTER TABLE genealogy_nodes
  ADD COLUMN source_locked INTEGER CHECK (source_locked >= 0),
  ADD CONSTRAINT genealogy_nodes_source_locked_consistent
    CHECK (source_locked IS NULL OR locked = (source_locked > 0));
COMMENT ON COLUMN genealogy_nodes.source_locked IS
  'Exact numeric source edit restriction; NULL means unknown (legacy boolean import). Not a privacy flag.';
COMMENT ON COLUMN genealogy_nodes.locked IS
  'Legacy boolean source edit restriction retained for compatibility. Not a privacy flag.';

ALTER TABLE genealogy_nodes DROP CONSTRAINT genealogy_nodes_public_reviewed;
ALTER TABLE genealogy_nodes ADD CONSTRAINT genealogy_nodes_public_reviewed CHECK (
  NOT is_public OR (reviewed_at IS NOT NULL AND publication_basis IS NOT NULL
    AND length(trim(publication_basis)) > 0)
);

GRANT INSERT (source_locked), UPDATE (source_locked) ON genealogy_nodes TO service_role;

CREATE OR REPLACE FUNCTION enforce_public_genealogy_path()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.source IS DISTINCT FROM OLD.source THEN
    RAISE EXCEPTION 'genealogy node source cannot be changed';
  END IF;

  IF TG_OP = 'UPDATE' AND (
    NEW.parent_key IS DISTINCT FROM OLD.parent_key OR
    NEW.external_id IS DISTINCT FROM OLD.external_id OR
    NEW.external_parent_id IS DISTINCT FROM OLD.external_parent_id OR
    NEW.name IS DISTINCT FROM OLD.name OR
    NEW.depth IS DISTINCT FROM OLD.depth OR
    NEW.taipa IS DISTINCT FROM OLD.taipa OR
    NEW.sort_order IS DISTINCT FROM OLD.sort_order
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM genealogy_import_state state
      WHERE state.source = OLD.source AND state.importing
    ) THEN
      RAISE EXCEPTION 'begin an import before changing genealogy source %', OLD.source;
    END IF;
    NEW.is_public := false;
    NEW.reviewed_at := NULL;
    NEW.publication_basis := NULL;
  END IF;

  IF NEW.is_public AND NEW.parent_key IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM genealogy_nodes parent
    WHERE parent.node_key = NEW.parent_key AND parent.source = NEW.source AND parent.is_public
  ) THEN
    RAISE EXCEPTION 'publish the parent path before node %', NEW.node_key;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION begin_genealogy_import(p_source TEXT, p_recover BOOLEAN)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  already_importing BOOLEAN;
  affected BIGINT;
BEGIN
  INSERT INTO genealogy_import_state (source, importing)
  VALUES (p_source, false)
  ON CONFLICT (source) DO NOTHING;

  SELECT importing INTO already_importing
  FROM genealogy_import_state
  WHERE source = p_source
  FOR UPDATE;

  IF already_importing AND NOT p_recover THEN
    RAISE EXCEPTION 'source % already has an unfinished import; retry with explicit recovery', p_source;
  END IF;

  -- ponytail: reviewed sources require a separate staged import with atomic cutover.
  -- Refuse before any mutation of node/review data, under the publication lock.
  IF EXISTS (SELECT 1 FROM genealogy_nodes WHERE source = p_source
    AND (is_public OR reviewed_at IS NOT NULL OR publication_basis IS NOT NULL)) THEN
    RAISE EXCEPTION 'reviewed source % requires a staged import', p_source;
  END IF;

  UPDATE genealogy_import_state
  SET importing = true, started_at = now(), finished_at = NULL
  WHERE source = p_source;
  affected := 0;
  RETURN affected;
END;
$$;

CREATE OR REPLACE FUNCTION get_public_genealogy_children(p_parent_key TEXT)
RETURNS TABLE (
  node_key TEXT,
  parent_key TEXT,
  name TEXT,
  depth SMALLINT,
  sort_order INTEGER,
  has_children BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
SET statement_timeout = '2000ms'
AS $$
  WITH RECURSIVE ancestors AS (
    SELECT node_key, parent_key, source, ARRAY[node_key] visited
    FROM genealogy_nodes
    WHERE node_key = p_parent_key AND is_public
      AND reviewed_at IS NOT NULL AND length(trim(publication_basis)) > 0
    UNION ALL
    SELECT p.node_key, p.parent_key, p.source, a.visited || p.node_key
    FROM ancestors a JOIN genealogy_nodes p ON p.node_key = a.parent_key
    WHERE p.source = a.source AND p.is_public
      AND p.reviewed_at IS NOT NULL AND length(trim(p.publication_basis)) > 0
      AND cardinality(a.visited) < 65 AND NOT p.node_key = ANY(a.visited)
  )
  SELECT
    node.node_key,
    node.parent_key,
    node.name,
    node.depth,
    node.sort_order,
    EXISTS (
      SELECT 1
      FROM genealogy_nodes child
      WHERE child.parent_key = node.node_key AND child.source = node.source AND child.is_public
        AND child.reviewed_at IS NOT NULL AND length(trim(child.publication_basis)) > 0
    ) AS has_children
  FROM genealogy_nodes node
  WHERE node.parent_key = p_parent_key AND node.is_public
    AND node.reviewed_at IS NOT NULL AND length(trim(node.publication_basis)) > 0
    AND EXISTS (SELECT 1 FROM ancestors a WHERE a.parent_key IS NULL AND a.source = node.source)
  ORDER BY node.sort_order, node.external_id;
$$;

CREATE OR REPLACE FUNCTION search_public_genealogy(
  p_source TEXT,
  p_query TEXT,
  p_limit INTEGER DEFAULT 8
)
RETURNS TABLE (
  node_key TEXT,
  parent_key TEXT,
  name TEXT,
  depth SMALLINT,
  has_children BOOLEAN,
  path JSONB
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
SET statement_timeout = '2000ms'
AS $$
  WITH RECURSIVE matches AS (
    SELECT node.node_key, node.parent_key, node.name, node.depth
    FROM genealogy_nodes node
    WHERE node.source = p_source
      AND node.is_public
      AND node.reviewed_at IS NOT NULL AND length(trim(node.publication_basis)) > 0
      AND length(trim(p_query)) >= 3
      AND lower(node.name) LIKE '%' || lower(trim(p_query)) || '%'
    ORDER BY
      (lower(node.name) LIKE lower(trim(p_query)) || '%') DESC,
      similarity(lower(node.name), lower(trim(p_query))) DESC,
      node.depth,
      node.name
    LIMIT least(greatest(p_limit, 1), 8)
  ), ancestors AS (
    SELECT
      match.node_key AS target_key,
      match.node_key,
      match.parent_key,
      match.name,
      match.depth,
      ARRAY[match.node_key] AS visited,
      0 AS steps
    FROM matches match
    UNION ALL
    SELECT
      ancestor.target_key,
      parent.node_key,
      parent.parent_key,
      parent.name,
      parent.depth,
      ancestor.visited || parent.node_key,
      ancestor.steps + 1
    FROM ancestors ancestor
    JOIN genealogy_nodes parent ON parent.node_key = ancestor.parent_key
    WHERE parent.source = p_source AND parent.is_public
      AND parent.reviewed_at IS NOT NULL AND length(trim(parent.publication_basis)) > 0
      AND ancestor.steps < 64 AND NOT parent.node_key = ANY(ancestor.visited)
  ), paths AS (
    SELECT
      target_key,
      jsonb_agg(
        jsonb_build_object(
          'id', node_key,
          'name', name,
          'kind', CASE
            WHEN depth = 0 THEN 'root'
            WHEN depth = 1 THEN 'zhuz'
            WHEN depth = 2 THEN 'tribe'
            ELSE 'subtribe'
          END
        ) ORDER BY steps DESC
      ) AS path
    FROM ancestors
    GROUP BY target_key
    HAVING bool_or(parent_key IS NULL)
  )
  SELECT
    match.node_key,
    match.parent_key,
    match.name,
    match.depth,
    EXISTS (
      SELECT 1
      FROM genealogy_nodes child
      WHERE child.parent_key = match.node_key AND child.source = p_source AND child.is_public
        AND child.reviewed_at IS NOT NULL AND length(trim(child.publication_basis)) > 0
    ) AS has_children,
    paths.path
  FROM matches match
  JOIN paths ON paths.target_key = match.node_key
  ORDER BY
    (lower(match.name) LIKE lower(trim(p_query)) || '%') DESC,
    similarity(lower(match.name), lower(trim(p_query))) DESC,
    match.depth,
    match.name;
$$;

REVOKE ALL ON FUNCTION get_public_genealogy_children(TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION search_public_genealogy(TEXT, TEXT, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION get_public_genealogy_children(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION search_public_genealogy(TEXT, TEXT, INTEGER) TO service_role;

COMMIT;
