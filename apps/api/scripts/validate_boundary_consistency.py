#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
from pathlib import Path

SCRIPT_PATH = Path(__file__).resolve()
API_ROOT = SCRIPT_PATH.parents[1]
REPO_ROOT = SCRIPT_PATH.parents[3]

if str(API_ROOT) not in sys.path:
    sys.path.insert(0, str(API_ROOT))

from app.mock_data import GEOGRAPHY_NODES  # noqa: E402

STATE_BOUNDARY_FILE = REPO_ROOT / "apps" / "web" / "public" / "data" / "boundaries" / "ste_2021_simplified.geojson"
SA4_BOUNDARY_FILE = REPO_ROOT / "apps" / "web" / "public" / "data" / "boundaries" / "sa4_2021_simplified.geojson"


def load_features(path: Path) -> list[dict]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    return payload.get("features", [])


def canonical_sa4_name(value: str) -> str:
    return value.replace("SA4: ", "", 1).strip()


def main() -> int:
    state_features = load_features(STATE_BOUNDARY_FILE)
    sa4_features = load_features(SA4_BOUNDARY_FILE)

    state_by_code = {feature["properties"]["code"]: feature for feature in state_features}
    sa4_by_code = {feature["properties"]["sa4_code21"]: feature for feature in sa4_features}
    nodes_by_id = {node["id"]: node for node in GEOGRAPHY_NODES}

    errors: list[str] = []
    checked_states = 0
    checked_sa4 = 0

    for node in GEOGRAPHY_NODES:
        kind = node.get("kind")
        if kind == "state":
            checked_states += 1
            state_code = node.get("code")
            boundary_code = node.get("boundary_code")
            if not state_code or state_code not in state_by_code:
                errors.append(f"State {node['id']} has unknown code: {state_code}")
                continue
            expected_boundary_code = state_by_code[state_code]["properties"]["ste_code21"]
            if boundary_code != expected_boundary_code:
                errors.append(
                    f"State {node['id']} boundary_code mismatch: {boundary_code} != {expected_boundary_code}"
                )
            continue

        if kind == "sa4":
            checked_sa4 += 1
            boundary_code = node.get("boundary_code")
            if not boundary_code or boundary_code not in sa4_by_code:
                errors.append(f"SA4 {node['id']} has unknown boundary_code: {boundary_code}")
                continue

            boundary_feature = sa4_by_code[boundary_code]
            parent_id = node.get("parent_id")
            parent_node = nodes_by_id.get(parent_id)
            if not parent_node or parent_node.get("kind") != "state":
                errors.append(f"SA4 {node['id']} has invalid parent_id: {parent_id}")
                continue

            expected_state_code = parent_node.get("code")
            actual_state_code = boundary_feature["properties"]["ste_code"]
            if expected_state_code != actual_state_code:
                errors.append(
                    f"SA4 {node['id']} state mismatch: parent={expected_state_code}, boundary={actual_state_code}"
                )

            expected_name = boundary_feature["properties"]["sa4_name21"]
            canonical_name = canonical_sa4_name(node.get("canonical_name", ""))
            if canonical_name != expected_name:
                errors.append(
                    f"SA4 {node['id']} name mismatch: canonical='{canonical_name}', boundary='{expected_name}'"
                )

    print(
        f"Checked {checked_states} state nodes and {checked_sa4} SA4 nodes "
        f"against simplified boundary files."
    )
    if errors:
        print("")
        print("Boundary consistency errors:")
        for item in errors:
            print(f"- {item}")
        return 1

    print("Boundary consistency check passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
