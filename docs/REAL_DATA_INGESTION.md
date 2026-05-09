# Real Data Ingestion Contract (v0.1)

This branch adds the first real-data ingestion path for occupations and shortage ratings.

## Backend data shape

### Source metadata (`apps/data/metadata/sources.json`)

Each source entry uses this shape:

- `dataset_id`: stable identifier used by backend
- `dataset_name`: human-readable dataset name
- `provider`: source owner
- `source_url`: canonical source page
- `download_url`: direct file URL (optional)
- `local_path`: path to local source file
- `file_format`: `csv | json | xlsx`
- `last_updated`: ISO date (`YYYY-MM-DD`)
- `data_status`: `mock | real`
- `description`, `license`
- `sheet_name`, `header_row` (for spreadsheet sources)

### Occupation shortage row contract

The current ingested dataset row format:

- `anzsco_code` (6 digits)
- `occupation_title`
- `national_rating`, `nsw`, `vic`, `qld`, `sa`, `wa`, `tas`, `nt`, `act`
- `skill_level` (1..5)
- `major_group` (1..9)

Allowed ratings:

- `NS` = No shortage
- `S` = Shortage
- `R` = Regional shortage
- `M` = Metropolitan shortage

## Loader coverage

`apps/api/app/data_pipeline.py` supports:

- CSV (`csv.DictReader`)
- JSON (array of objects, or object with `rows: []`)
- XLSX (`openpyxl`, configurable sheet/header row)

## Validation behavior

Bad data is rejected during ingestion (`DataLoadError`) when:

- required values are missing or malformed
- rating values are outside `{NS,S,R,M}`
- `anzsco_code` is not 6 digits
- skill/major group are outside expected ranges

## First real source ingested

- Dataset: `jsa_osl_2025_anzsco2022`
- File: `apps/data/raw/occupation_shortage/2025_osl_anzsco2022.csv`
- Scope replaced in API:
  - Occupation list (`/api/v1/occupations`)
  - National/state shortage categories used by map/panel

Labour market and industry data are still mock in this branch and will be replaced next.
