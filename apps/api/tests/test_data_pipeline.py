import csv
import json
import sys
import tempfile
import unittest
from pathlib import Path

API_ROOT = Path(__file__).resolve().parents[1]
if str(API_ROOT) not in sys.path:
    sys.path.insert(0, str(API_ROOT))

from app.data_pipeline import (
    DataLoadError,
    FileFormat,
    load_real_industry_dataset,
    OccupationShortageRow,
    load_real_labour_market_dataset,
    load_real_occupation_dataset,
    read_table,
)
from app.schemas import ShortageCategory


class DataPipelineTests(unittest.TestCase):
    def test_read_table_csv(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            path = Path(tmpdir) / "sample.csv"
            with path.open("w", encoding="utf-8", newline="") as handle:
                writer = csv.DictWriter(handle, fieldnames=["id", "value"])
                writer.writeheader()
                writer.writerow({"id": "a", "value": "1"})
            rows = read_table(path, FileFormat.CSV)
            self.assertEqual(rows, [{"id": "a", "value": "1"}])

    def test_read_table_json_list(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            path = Path(tmpdir) / "sample.json"
            path.write_text(json.dumps([{"id": "a", "value": "1"}]), encoding="utf-8")
            rows = read_table(path, FileFormat.JSON)
            self.assertEqual(rows, [{"id": "a", "value": "1"}])

    def test_read_table_json_object_rows(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            path = Path(tmpdir) / "sample.json"
            path.write_text(json.dumps({"rows": [{"id": "a", "value": "1"}]}), encoding="utf-8")
            rows = read_table(path, FileFormat.JSON)
            self.assertEqual(rows, [{"id": "a", "value": "1"}])

    def test_read_table_invalid_json_shape_raises(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            path = Path(tmpdir) / "sample.json"
            path.write_text(json.dumps({"invalid": True}), encoding="utf-8")
            with self.assertRaises(DataLoadError):
                read_table(path, FileFormat.JSON)

    def test_read_table_xlsx(self) -> None:
        try:
            import openpyxl  # type: ignore
        except ModuleNotFoundError:
            self.skipTest("openpyxl not installed")
        with tempfile.TemporaryDirectory() as tmpdir:
            path = Path(tmpdir) / "sample.xlsx"
            workbook = openpyxl.Workbook()
            sheet = workbook.active
            sheet.title = "data"
            sheet.append(["id", "value"])
            sheet.append(["a", "1"])
            workbook.save(path)

            rows = read_table(path, FileFormat.XLSX, sheet_name="data", header_row=1)
            self.assertEqual(rows, [{"id": "a", "value": "1"}])

    def test_validation_rejects_bad_shortage_rating(self) -> None:
        with self.assertRaises(ValueError):
            OccupationShortageRow.model_validate(
                {
                    "anzsco_code": "261313",
                    "occupation_title": "Software Engineer",
                    "national_rating": "BAD",
                    "nsw": "NS",
                    "vic": "NS",
                    "qld": "NS",
                    "sa": "NS",
                    "wa": "NS",
                    "tas": "NS",
                    "nt": "NS",
                    "act": "NS",
                    "skill_level": 1,
                    "major_group": 2,
                }
            )

    def test_load_real_occupation_dataset(self) -> None:
        dataset = load_real_occupation_dataset()
        self.assertGreaterEqual(len(dataset.occupations), 900)
        software_engineer = next(
            occupation for occupation in dataset.occupations if occupation.id == "software-engineer"
        )
        self.assertEqual(software_engineer.anzsco_code, "261313")
        self.assertEqual(software_engineer.skill_level, 1)

        ratings = dataset.shortage_matrix["software-engineer"]
        self.assertEqual(ratings["AU"], ShortageCategory.NO_SHORTAGE)
        self.assertEqual(ratings["NT"], ShortageCategory.NO_SHORTAGE)

    def test_load_real_labour_market_dataset(self) -> None:
        dataset = load_real_labour_market_dataset()
        self.assertEqual(dataset.latest_month, "2026-03")
        self.assertIn("AU", dataset.by_geo_code)
        self.assertIn("NSW", dataset.by_geo_code)

        nsw = dataset.by_geo_code["NSW"]
        self.assertGreater(nsw.population, 1_000_000)
        self.assertGreater(nsw.employment, 1_000_000)
        self.assertGreaterEqual(nsw.unemployment_rate, 0)
        self.assertLessEqual(nsw.unemployment_rate, 100)

    def test_load_real_industry_dataset(self) -> None:
        dataset = load_real_industry_dataset()
        self.assertEqual(dataset.latest_month, "2026-02")
        self.assertIn("NSW", dataset.by_geo_code)

        nsw = dataset.by_geo_code["NSW"]
        self.assertGreaterEqual(len(nsw), 5)
        shares = [item.employment_share for item in nsw]
        self.assertTrue(all(0 <= share <= 100 for share in shares))
        self.assertGreaterEqual(shares[0], shares[-1])


if __name__ == "__main__":
    unittest.main()
