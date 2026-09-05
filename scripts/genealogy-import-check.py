"""Offline regression for preserving source edit levels without publishing rows."""
from import_genealogy_snapshot import analyze
import import_genealogy_snapshot as importer
import os
from unittest.mock import patch
from urllib.error import HTTPError

for level in (None, 0, 1, 3):
    rows, _ = analyze([{"id": 1, "parent": None, "name": "Synthetic", "locked": level}], "test")
    assert rows[0]["source_locked"] == level
    assert rows[0]["locked"] == bool(level)
    assert "is_public" not in rows[0]

for invalid in ("0", True, -1, 1.5, 2147483648):
    try:
        analyze([{"id": 1, "parent": None, "name": "Synthetic", "locked": invalid}], "test")
    except ValueError:
        pass
    else:
        raise AssertionError(f"accepted invalid source locked: {invalid!r}")

for field, value in (("id", True), ("id", 2**63), ("parent", False), ("taipa", 2**63), ("orderBy", 2**31)):
    try:
        analyze([{**{"id": 1, "parent": None, "name": "Synthetic"}, field: value}], "test")
    except ValueError:
        pass
    else:
        raise AssertionError(f"accepted invalid {field}")

# A missing migration must fail before invoking the destructive legacy begin RPC.
with patch.dict(os.environ, {"SUPABASE_URL": "https://synthetic.invalid", "SUPABASE_SERVICE_ROLE_KEY": "synthetic"}), \
     patch.object(importer.urllib.request, "urlopen", side_effect=HTTPError("synthetic", 400, "missing column", {}, None)), \
     patch.object(importer, "call_rpc") as rpc:
    try:
        importer.import_rows([], 100, "test", False)
    except HTTPError:
        pass
    else:
        raise AssertionError("missing schema accepted")
    rpc.assert_not_called()

print("PASS: source levels and numeric bounds validated; missing schema cannot begin import")
