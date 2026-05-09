import sys
import unittest
from pathlib import Path

from fastapi import HTTPException

API_ROOT = Path(__file__).resolve().parents[1]
if str(API_ROOT) not in sys.path:
    sys.path.insert(0, str(API_ROOT))

from app.main import (  # noqa: E402
    get_detail_panel,
    get_geography_tree,
    get_map_layer,
    get_occupations,
    health,
)
from app.schemas import ViewMode, VisaMode  # noqa: E402


class ApiContractTests(unittest.TestCase):
    def test_health(self) -> None:
        self.assertEqual(health(), {"status": "ok"})

    def test_geographies_tree_contract(self) -> None:
        payload = get_geography_tree().model_dump(mode="json")
        self.assertEqual(payload["root_id"], "au")
        self.assertEqual(payload["meta"]["contract_version"], "v1")
        self.assertEqual(payload["meta"]["data_status"], "mock")

        nodes = payload["nodes"]
        self.assertGreater(len(nodes), 0)
        ids = {node["id"] for node in nodes}
        for node in nodes:
            parent_id = node["parent_id"]
            if parent_id is not None:
                self.assertIn(parent_id, ids)
            if node["kind"] == "state":
                self.assertIsNotNone(node["boundary_code"])
            if node["kind"] == "sa4":
                self.assertRegex(node["boundary_code"], r"^\d+$")

    def test_occupations_contract(self) -> None:
        payload = get_occupations().model_dump(mode="json")
        self.assertEqual(payload["meta"]["contract_version"], "v1")
        self.assertIn(payload["meta"]["data_status"], {"mock", "real"})
        if payload["meta"]["data_status"] == "real":
            self.assertGreaterEqual(len(payload["occupations"]), 900)
        else:
            self.assertGreaterEqual(len(payload["occupations"]), 5)
        for occupation in payload["occupations"]:
            self.assertGreaterEqual(occupation["skill_level"], 1)
            self.assertLessEqual(occupation["skill_level"], 5)

    def test_map_layer_contract(self) -> None:
        payload = get_map_layer(
            focus_id="au",
            occupation_id="software-engineer",
            view_mode=ViewMode.ALL,
        ).model_dump(mode="json")
        self.assertEqual(payload["meta"]["contract_version"], "v1")
        self.assertIn(payload["meta"]["data_status"], {"mock", "real"})
        self.assertEqual(payload["focus"]["id"], "au")
        self.assertEqual(payload["parent"]["id"], "au")
        self.assertGreaterEqual(len(payload["items"]), 8)
        for item in payload["items"]:
            self.assertEqual(item["geography"]["kind"], "state")

    def test_map_layer_invalid_focus_returns_404(self) -> None:
        with self.assertRaises(HTTPException) as err:
            get_map_layer(
                focus_id="missing",
                occupation_id="software-engineer",
                view_mode=ViewMode.ALL,
            )
        self.assertEqual(err.exception.status_code, 404)
        self.assertIn("Unknown id", err.exception.detail)

    def test_map_layer_invalid_occupation_returns_404(self) -> None:
        with self.assertRaises(HTTPException) as err:
            get_map_layer(
                focus_id="au",
                occupation_id="missing-occupation",
                view_mode=ViewMode.ALL,
            )
        self.assertEqual(err.exception.status_code, 404)
        self.assertIn("Unknown id", err.exception.detail)

    def test_detail_panel_contract(self) -> None:
        payload = get_detail_panel(
            geography_id="sa4-nt-outback",
            occupation_id="software-engineer",
            visa_mode=VisaMode.SUBCLASS_491,
            view_mode=ViewMode.REGIONAL,
        ).model_dump(mode="json")

        self.assertEqual(payload["meta"]["contract_version"], "v1")
        self.assertIn(payload["meta"]["data_status"], {"mock", "real"})
        self.assertEqual(payload["geography"]["id"], "sa4-nt-outback")
        self.assertEqual(payload["occupation"]["id"], "software-engineer")
        self.assertEqual(payload["visa_mode"], "491")
        self.assertEqual(payload["view_mode"], "regional")

        migration = payload["migration_evidence"]
        self.assertIn(migration["data_status"], {"mock", "real"})
        self.assertIn("shortage_category", migration)
        self.assertRegex(migration["source"]["last_updated"], r"^\d{4}-\d{2}-\d{2}$")
        self.assertIn(migration["source"]["data_status"], {"mock", "real"})
        self.assertGreaterEqual(len(migration["references"]), 3)

        labour_market = payload["labour_market"]
        self.assertGreaterEqual(labour_market["population"], 0)
        self.assertGreaterEqual(labour_market["employment"], 0)
        self.assertGreaterEqual(labour_market["unemployment_rate"], 0)
        self.assertLessEqual(labour_market["unemployment_rate"], 100)

        industries = payload["industries"]
        self.assertGreaterEqual(len(industries), 1)
        for industry in industries:
            self.assertGreaterEqual(industry["employment_share"], 0)
            self.assertLessEqual(industry["employment_share"], 100)

        ranking = payload["ranking"]
        self.assertGreaterEqual(ranking["score"], 0)
        self.assertLessEqual(ranking["score"], 100)
        self.assertIn(ranking["tier"], {"strong", "moderate", "weak"})
        self.assertEqual(ranking["method"], "region-fit-v0.1")
        self.assertIn("shortage", ranking["components"])

    def test_detail_panel_invalid_geography_returns_404(self) -> None:
        with self.assertRaises(HTTPException) as err:
            get_detail_panel(
                geography_id="missing",
                occupation_id="software-engineer",
                visa_mode=VisaMode.SUBCLASS_491,
                view_mode=ViewMode.ALL,
            )
        self.assertEqual(err.exception.status_code, 404)
        self.assertIn("Unknown id", err.exception.detail)

    def test_detail_panel_invalid_occupation_returns_404(self) -> None:
        with self.assertRaises(HTTPException) as err:
            get_detail_panel(
                geography_id="au",
                occupation_id="missing-occupation",
                visa_mode=VisaMode.SUBCLASS_491,
                view_mode=ViewMode.ALL,
            )
        self.assertEqual(err.exception.status_code, 404)
        self.assertIn("Unknown id", err.exception.detail)

    def test_view_mode_enum_rejects_invalid_value(self) -> None:
        with self.assertRaises(ValueError):
            ViewMode("not-valid")


if __name__ == "__main__":
    unittest.main()
