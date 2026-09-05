#!/usr/bin/env python3
"""Offline consistency check; does not connect to Neon or change a dataset."""
import hashlib
import json
from pathlib import Path

base = Path(__file__).resolve().parent
profile = json.loads((base / 'neon-profile.json').read_text())
queries = (base / 'queries.json').read_bytes()
assert hashlib.sha256(queries).hexdigest() == profile['query_sha256']
ctx = profile['context']
assert ctx['read_only'] == 'on' and ctx['isolation'] == 'repeatable read'
assert ctx['can_select'] and not any(ctx[k] for k in ('can_insert', 'can_update', 'can_delete'))
r = profile['results']
total = r['summary'][0]['total']
c = r['classification'][0]
classes = {x['class']: x['n'] for x in c['classes']}
assert sum(classes.values()) == total == 794594
assert classes == {'A': 18, 'B': 446, 'C': 294, 'D': 793836}
assert sum(x['n'] for x in r['depth']) == sum(x['n'] for x in r['degree']) == total
assert sum(x['children'] * x['n'] for x in r['degree']) == total - 1
assert sum(x['public'] for x in c['classes']) == r['summary'][0]['public'] == 3
assert all(x['leaf'] + x['nonleaf'] == x['n'] for x in c['classes'])
assert sum(x['n'] for x in c['class_by_depth']) == total
assert sum(x['n'] for x in c['signal_overlap']) == total
assert not any(r['integrity'][0].values())
seeds = json.loads((base / 'evidence-seeds.json').read_text())
manifest = json.loads(queries)
assert len({x['id'] for x in manifest}) == len(manifest)
sql_seeds = json.loads(next(x for x in manifest if x['id'] == 'classification')['params'][1])
assert sql_seeds == seeds
sources = json.loads((base / 'source-manifest.json').read_text())
assert sources['evidence_seed_sha256'] == hashlib.sha256((base / 'evidence-seeds.json').read_bytes()).hexdigest()
assert sorted(i for s in sources['sources'] for i in s['covered_external_ids']) == sorted(s['external_id'] for s in seeds)
for source in sources['sources']:
    assert source['http_status'] == 200 and len(source['content_sha256']) == 64
    assert source['retrieved_at'] and sources['reviewer'] and sources['identity_match_basis']
    for seed in seeds:
        if seed['external_id'] in source['covered_external_ids']:
            assert seed['evidence_url'].split('#')[0] == source['url']
    snapshot = Path(source['local_snapshot_ref'])
    if snapshot.exists():
        assert hashlib.sha256(snapshot.read_bytes()).hexdigest() == source['content_sha256']
    else:
        print('NOTE: temporary source snapshot unavailable:', source['source_id'])
nodes = {int(x['external_id']): x for x in c['a_candidates']}
assert len(nodes) == len(seeds) == classes['A']
for seed in seeds:
    n = nodes[seed['external_id']]
    assert n['name'] == seed['expected_name']
    assert int(n['external_parent_id']) == seed['expected_parent_id']
    assert int(n['taipa']) == seed['expected_taipa']
    assert n['relationship_verified'] == seed['relationship_verified']
    assert seed['evidence_url'].startswith('https://')
    seen = set()
    current = seed['external_id']
    while current != 1:
        assert current not in seen and current in nodes
        seen.add(current)
        current = int(nodes[current]['external_parent_id'])
paths = c['candidate_paths']
assert paths['full_candidate_path_nodes'] == paths['proposed_nodes_including_root'] == len(nodes) + 1 == 19
assert paths['currently_private_in_candidate_paths'] == 16
assert total - paths['full_candidate_path_nodes'] == 794575
assert total - r['summary'][0]['public'] == 16 + 794575
assert c['e_overlay']['corroborated_entity_type_records'] == len(nodes)
assert c['e_overlay']['corroborated_traditional_subgroup_edges'] == sum(x['relationship_verified'] for x in nodes.values()) == 7
assert c['e_overlay']['biological_parentage_verified'] == 0
# Ensure the persisted report has no connection URLs; data remains aggregate/group-only.
for p in base.iterdir():
    if p.suffix in {'.json', '.md'}:
        text = p.read_text()
        assert 'postgresql://' not in text and 'postgres://' not in text, p.name
print('PASS: manifest hash, read-only scope, totals, A/B/C/D partition, evidence seeds, full candidate paths, E scope, credential URL scan')
print(f"Neon snapshot: {ctx['checked_at']}; nodes={total}; A=18 B_review=446 C_signal=294 D=793836; candidate_path=19; public=3; new_publications=0")
