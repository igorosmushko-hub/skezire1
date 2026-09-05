-- Prefer application rollback. Run this only after the preflight passes.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM genealogy_nodes WHERE is_public AND locked) THEN
    RAISE EXCEPTION 'rollback blocked: public source-locked nodes require an explicitly reviewed withdrawal plan';
  END IF;
END $$;
ALTER TABLE genealogy_nodes DROP CONSTRAINT genealogy_nodes_public_reviewed;
ALTER TABLE genealogy_nodes ADD CONSTRAINT genealogy_nodes_public_reviewed CHECK (
  NOT is_public OR (reviewed_at IS NOT NULL AND publication_basis IS NOT NULL
    AND length(trim(publication_basis)) > 0 AND NOT locked)
);
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
    WHERE parent.node_key = NEW.parent_key AND parent.source = NEW.source AND parent.is_public
  ) THEN
    RAISE EXCEPTION 'publish the parent path before node %', NEW.node_key;
  END IF;
  RETURN NEW;
END;
$$;

-- Legacy importer writes only locked; keep its old behavior without a CHECK failure.
ALTER TABLE genealogy_nodes DROP CONSTRAINT genealogy_nodes_source_locked_consistent;
-- Clear exact metadata if a legacy writer changes only the boolean, to avoid stale levels.
CREATE OR REPLACE FUNCTION clear_legacy_genealogy_lock_level()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.locked IS DISTINCT FROM OLD.locked
    AND NEW.source_locked IS NOT DISTINCT FROM OLD.source_locked THEN
    NEW.source_locked := NULL;
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION clear_legacy_genealogy_lock_level() FROM PUBLIC;
CREATE TRIGGER genealogy_nodes_legacy_lock_level
  BEFORE UPDATE OF locked ON genealogy_nodes
  FOR EACH ROW EXECUTE FUNCTION clear_legacy_genealogy_lock_level();
-- Retain the hardened begin_genealogy_import and full-chain readers.
-- Keep recovered source_locked values unless a legacy writer changes their boolean.
COMMIT;
