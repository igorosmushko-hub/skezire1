-- Large genealogy snapshots stay private until editorial review explicitly publishes nodes.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS genealogy_nodes (
  node_key TEXT PRIMARY KEY,
  parent_key TEXT REFERENCES genealogy_nodes(node_key) DEFERRABLE INITIALLY DEFERRED,
  source TEXT NOT NULL,
  external_id BIGINT NOT NULL,
  external_parent_id BIGINT,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  depth SMALLINT NOT NULL CHECK (depth >= 0),
  taipa BIGINT,
  locked BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_public BOOLEAN NOT NULL DEFAULT false,
  source_snapshot_at TIMESTAMPTZ,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  publication_basis TEXT,
  CONSTRAINT genealogy_nodes_source_identity UNIQUE NULLS NOT DISTINCT
    (source, external_id, external_parent_id),
  CONSTRAINT genealogy_nodes_public_reviewed CHECK (
    NOT is_public OR (
      reviewed_at IS NOT NULL
      AND publication_basis IS NOT NULL
      AND length(trim(publication_basis)) > 0
      AND NOT locked
    )
  )
);

CREATE INDEX IF NOT EXISTS genealogy_nodes_public_children_idx
  ON genealogy_nodes (parent_key, sort_order, external_id)
  WHERE is_public;

CREATE INDEX IF NOT EXISTS genealogy_nodes_public_name_trgm_idx
  ON genealogy_nodes USING gin (lower(name) gin_trgm_ops)
  WHERE is_public;

ALTER TABLE genealogy_nodes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON genealogy_nodes FROM anon, authenticated;
REVOKE ALL ON genealogy_nodes FROM service_role;
GRANT SELECT ON genealogy_nodes TO service_role;
GRANT INSERT (
  node_key, parent_key, source, external_id, external_parent_id, name,
  depth, taipa, locked, sort_order, source_snapshot_at
) ON genealogy_nodes TO service_role;

CREATE TABLE IF NOT EXISTS genealogy_import_state (
  source TEXT PRIMARY KEY,
  importing BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ
);

ALTER TABLE genealogy_import_state ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON genealogy_import_state FROM PUBLIC, anon, authenticated;
REVOKE ALL ON genealogy_import_state FROM service_role;
GRANT UPDATE (
  node_key, parent_key, source, external_id, external_parent_id, name,
  depth, taipa, locked, sort_order, source_snapshot_at, imported_at
) ON genealogy_nodes TO service_role;

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
    NEW.locked IS DISTINCT FROM OLD.locked OR
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

  IF NEW.is_public AND NEW.locked THEN
    RAISE EXCEPTION 'locked node % cannot be published', NEW.node_key;
  END IF;

  IF NEW.is_public AND NEW.parent_key IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM genealogy_nodes parent
    WHERE parent.node_key = NEW.parent_key AND parent.is_public
  ) THEN
    RAISE EXCEPTION 'publish the parent path before node %', NEW.node_key;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS genealogy_nodes_public_path_guard ON genealogy_nodes;
CREATE TRIGGER genealogy_nodes_public_path_guard
  BEFORE INSERT OR UPDATE OF
    is_public, parent_key, source, external_id, external_parent_id,
    name, depth, taipa, locked, sort_order
  ON genealogy_nodes
  FOR EACH ROW EXECUTE FUNCTION enforce_public_genealogy_path();

REVOKE ALL ON FUNCTION enforce_public_genealogy_path() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION enforce_public_genealogy_path() TO service_role;

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

  UPDATE genealogy_import_state
  SET importing = true, started_at = now(), finished_at = NULL
  WHERE source = p_source;

  UPDATE genealogy_nodes
  SET is_public = false, reviewed_at = NULL, publication_basis = NULL
  WHERE source = p_source AND is_public;
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;

CREATE OR REPLACE FUNCTION finish_genealogy_import(p_source TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE genealogy_import_state
  SET importing = false, finished_at = now()
  WHERE source = p_source AND importing;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'source % has no active import', p_source;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION publish_genealogy_nodes(p_node_keys TEXT[], p_basis TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  candidate RECORD;
  source_candidate RECORD;
  source_importing BOOLEAN;
  affected INTEGER := 0;
BEGIN
  IF p_basis IS NULL OR length(trim(p_basis)) = 0 THEN
    RAISE EXCEPTION 'publication basis is required';
  END IF;

  FOR source_candidate IN
    SELECT DISTINCT source
    FROM genealogy_nodes
    WHERE node_key = ANY(p_node_keys)
    ORDER BY source
  LOOP
    INSERT INTO genealogy_import_state (source, importing)
    VALUES (source_candidate.source, false)
    ON CONFLICT (source) DO NOTHING;

    SELECT importing INTO source_importing
    FROM genealogy_import_state
    WHERE source = source_candidate.source
    FOR UPDATE;

    IF source_importing THEN
      RAISE EXCEPTION 'source % is being imported', source_candidate.source;
    END IF;
  END LOOP;

  FOR candidate IN
    SELECT node_key
    FROM genealogy_nodes
    WHERE node_key = ANY(p_node_keys)
    ORDER BY depth
  LOOP
    UPDATE genealogy_nodes
    SET is_public = true, reviewed_at = now(), publication_basis = trim(p_basis)
    WHERE node_key = candidate.node_key;
    affected := affected + 1;
  END LOOP;
  RETURN affected;
END;
$$;

REVOKE ALL ON FUNCTION begin_genealogy_import(TEXT, BOOLEAN) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION finish_genealogy_import(TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION publish_genealogy_nodes(TEXT[], TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION begin_genealogy_import(TEXT, BOOLEAN) TO service_role;
GRANT EXECUTE ON FUNCTION finish_genealogy_import(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION publish_genealogy_nodes(TEXT[], TEXT) TO service_role;

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
  SELECT
    node.node_key,
    node.parent_key,
    node.name,
    node.depth,
    node.sort_order,
    EXISTS (
      SELECT 1
      FROM genealogy_nodes child
      WHERE child.parent_key = node.node_key AND child.is_public
    ) AS has_children
  FROM genealogy_nodes node
  WHERE node.parent_key = p_parent_key AND node.is_public
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
      0 AS steps
    FROM matches match
    UNION ALL
    SELECT
      ancestor.target_key,
      parent.node_key,
      parent.parent_key,
      parent.name,
      parent.depth,
      ancestor.steps + 1
    FROM ancestors ancestor
    JOIN genealogy_nodes parent ON parent.node_key = ancestor.parent_key
    WHERE parent.is_public
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
  )
  SELECT
    match.node_key,
    match.parent_key,
    match.name,
    match.depth,
    EXISTS (
      SELECT 1
      FROM genealogy_nodes child
      WHERE child.parent_key = match.node_key AND child.is_public
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
