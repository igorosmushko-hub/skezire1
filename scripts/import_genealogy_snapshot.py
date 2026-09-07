#!/usr/bin/env python3
"""Validate a flat genealogy snapshot and optionally import it as private rows."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.request
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("snapshot", type=Path)
    parser.add_argument("--source", default="tumalas-local-snapshot")
    parser.add_argument("--snapshot-at")
    parser.add_argument("--batch-size", type=int, default=500)
    parser.add_argument("--report", type=Path)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument(
        "--recover",
        action="store_true",
        help="replace an explicitly abandoned import for the same source",
    )
    return parser.parse_args()


def node_key(source: str, external_id: int, external_parent_id: int | None) -> str:
    parent = "root" if external_parent_id is None else str(external_parent_id)
    return f"{source}:{external_id}:{parent}"


def integer(value: Any, field: str, bits: int = 64) -> int:
    if type(value) is not int or not -(2 ** (bits - 1)) <= value < 2 ** (bits - 1):
        raise ValueError(f"{field} must fit a PostgreSQL int{bits}")
    return value


def analyze(rows: list[dict[str, Any]], source: str) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    ids = Counter(row.get("id") for row in rows)
    pairs = Counter((row.get("id"), row.get("parent")) for row in rows)
    if any(value > 1 for value in pairs.values()):
        raise ValueError("snapshot contains duplicate id + parent pairs")

    rows_by_key: dict[tuple[int, int | None], dict[str, Any]] = {}
    id_to_keys: dict[int, list[tuple[int, int | None]]] = {}
    for row in rows:
        external_id = row.get("id")
        external_parent_id = row.get("parent")
        integer(external_id, "id")
        if external_parent_id is not None:
            integer(external_parent_id, "parent")
        row_key = (external_id, external_parent_id)
        rows_by_key[row_key] = row
        id_to_keys.setdefault(external_id, []).append(row_key)

    depth_cache: dict[tuple[int, int | None], int] = {}
    visiting: set[tuple[int, int | None]] = set()

    def depth_for(row_key: tuple[int, int | None]) -> int:
        if row_key in depth_cache:
            return depth_cache[row_key]
        if row_key in visiting:
            raise ValueError(f"cycle detected at id={row_key[0]}, parent={row_key[1]}")
        visiting.add(row_key)
        parent = row_key[1]
        if parent is None:
            depth = 0
        elif parent not in id_to_keys:
            raise ValueError(f"missing parent={parent!r} for id={row_key[0]}")
        else:
            parent_candidates = id_to_keys[parent]
            if len(parent_candidates) != 1:
                raise ValueError(
                    f"parent id={parent} is reused and ambiguous for child id={row_key[0]}"
                )
            depth = depth_for(parent_candidates[0]) + 1
        visiting.remove(row_key)
        depth_cache[row_key] = depth
        return depth

    prepared: list[dict[str, Any]] = []
    placeholder_names = 0
    for row in rows:
        external_id = int(row["id"])
        external_parent_id = row.get("parent")
        row_key = (external_id, external_parent_id)
        name = str(row.get("name") or "").strip()
        if not name:
            placeholder_names += 1
            name = f"[без имени #{external_id}]"
        parent_key = None
        if external_parent_id is not None:
            parent_candidates = id_to_keys.get(external_parent_id, [])
            if len(parent_candidates) != 1:
                raise ValueError(
                    f"parent id={external_parent_id} is ambiguous for child id={external_id}"
                )
            parent_row_key = parent_candidates[0]
            parent_key = node_key(source, parent_row_key[0], parent_row_key[1])
        source_locked = row.get("locked")
        if source_locked is not None and (type(source_locked) is not int or not 0 <= source_locked <= 2147483647):
            raise ValueError("locked must be a non-negative integer or null")
        taipa = row.get("taipa")
        if taipa is not None:
            integer(taipa, "taipa")
        prepared.append({
            "node_key": node_key(source, external_id, external_parent_id),
            "parent_key": parent_key,
            "source": source,
            "external_id": external_id,
            "external_parent_id": external_parent_id,
            "name": name,
            "depth": integer(depth_for(row_key), "depth", 16),
            "taipa": taipa,
            "locked": bool(source_locked),
            "source_locked": source_locked,
            "sort_order": integer(row.get("orderBy", 0) if row.get("orderBy") is not None else 0, "orderBy", 32),
        })

    prepared.sort(key=lambda row: (row["depth"], row["sort_order"], row["external_id"]))
    report = {
        "total": len(rows),
        "importable": len(prepared),
        "unique_ids": len(ids),
        "reused_ids": sum(value > 1 for value in ids.values()),
        "duplicate_id_parent_pairs": sum(value > 1 for value in pairs.values()),
        "roots": sum(row.get("parent") is None for row in rows),
        "placeholder_names": placeholder_names,
        "locked": sum(bool(row.get("locked")) for row in rows),
        "max_depth": max(depth_cache.values(), default=0),
    }
    return prepared, report


def call_rpc(url: str, headers: dict[str, str], function: str, payload: dict[str, Any]) -> None:
    request = urllib.request.Request(
        f"{url.rstrip('/')}/rest/v1/rpc/{function}",
        data=json.dumps(payload).encode("utf-8"),
        headers=headers,
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            if response.status >= 300:
                raise RuntimeError(f"Supabase returned HTTP {response.status}")
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")[:500]
        raise RuntimeError(f"Supabase RPC {function} failed: {detail}") from error


def import_rows(
    rows: list[dict[str, Any]], batch_size: int, source: str, recover: bool
) -> None:
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required with --apply")
    endpoint = f"{url.rstrip('/')}/rest/v1/genealogy_nodes?on_conflict=node_key"
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }
    # Fail before begin/import mutations if the new migration is absent.
    preflight = urllib.request.Request(
        f"{url.rstrip('/')}/rest/v1/genealogy_nodes?select=node_key,source_locked&limit=0",
        headers=headers,
    )
    with urllib.request.urlopen(preflight, timeout=30) as response:
        if response.status != 200:
            raise RuntimeError("genealogy schema preflight failed")
    call_rpc(
        url,
        headers,
        "begin_genealogy_import",
        {"p_source": source, "p_recover": recover},
    )
    print(f"Source {source!r} is private and publication is blocked", file=sys.stderr)

    for offset in range(0, len(rows), batch_size):
        request = urllib.request.Request(
            endpoint,
            data=json.dumps(rows[offset:offset + batch_size], ensure_ascii=False).encode("utf-8"),
            headers=headers,
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                if response.status >= 300:
                    raise RuntimeError(f"Supabase returned HTTP {response.status}")
        except urllib.error.HTTPError as error:
            detail = error.read().decode("utf-8", errors="replace")[:500]
            raise RuntimeError(f"Supabase import failed at offset {offset}: {detail}") from error
        print(f"Imported {min(offset + batch_size, len(rows))}/{len(rows)}", file=sys.stderr)

    call_rpc(url, headers, "finish_genealogy_import", {"p_source": source})
    print(f"Import finished; source {source!r} remains private", file=sys.stderr)


def main() -> int:
    args = parse_args()
    if args.batch_size < 1 or args.batch_size > 1000:
        raise ValueError("--batch-size must be between 1 and 1000")
    if not re.fullmatch(r"[a-z0-9_-]{1,64}", args.source):
        raise ValueError("--source must contain only lowercase letters, digits, _ or -")
    with args.snapshot.open(encoding="utf-8") as file:
        payload = json.load(file)
    if not isinstance(payload, list) or not all(isinstance(row, dict) for row in payload):
        raise ValueError("snapshot must be a JSON array of objects")

    rows, report = analyze(payload, args.source)
    snapshot_at = args.snapshot_at or datetime.fromtimestamp(
        args.snapshot.stat().st_mtime, tz=timezone.utc
    ).isoformat()
    parsed_snapshot_at = datetime.fromisoformat(snapshot_at.replace("Z", "+00:00"))
    if parsed_snapshot_at.tzinfo is None:
        raise ValueError("--snapshot-at must include a timezone")
    for row in rows:
        row["source_snapshot_at"] = snapshot_at

    report.update({
        "snapshot": args.snapshot.name,
        "source": args.source,
        "snapshot_at": snapshot_at,
        "publication_default": "private",
    })
    rendered = json.dumps(report, ensure_ascii=False, indent=2)
    print(rendered)
    if args.report:
        args.report.write_text(rendered + "\n", encoding="utf-8")
    if args.apply:
        import_rows(rows, args.batch_size, args.source, args.recover)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
