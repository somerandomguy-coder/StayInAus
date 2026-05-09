# Data Layout

`apps/data` separates raw source files, metadata, and processed outputs.

- `raw/`
  - `boundaries/`: ABS boundary geometry source files.
  - `occupation_shortage/`: occupation shortage inputs (CSV/JSON/XLSX).
  - `labour_market/`: labour market workbook + normalized snapshot CSV.
  - `industry/`: industry workbook + normalized top-5 snapshot CSV.
- `metadata/`
  - `sources.json`: source registry used by backend ingestion.
- `processed/`
  - generated normalized outputs (optional, deterministic build artifacts).
