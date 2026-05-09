# AU-Settle Pro Foundation Setup

This repo now has two parallel tracks:

- `www.settledin.app` + `local-clone-server.js`: captured reference clone
- `apps/web` + `apps/api`: new source-based foundation

## Run the new foundation

From repo root:

```bash
npm install --workspace @stayinaus/web
```

Start API:

```bash
npm run dev:api
```

Run API contract tests:

```bash
npm run test:api
```

Run data-ingestion tests:

```bash
npm run check:data
```

Start web app (new terminal):

```bash
npm run dev:web
```

Web app default URL: `http://127.0.0.1:3000`
API default URL: `http://127.0.0.1:8000`

## Build boundary assets (after updating raw ABS files)

Raw boundary inputs currently expected at:

- `apps/data/raw/boundaries/ste_2021.geojson`
- `apps/data/raw/boundaries/sa4_2021.geojson`

Generate optimized frontend boundary assets:

```bash
npm run build:boundaries
```

Outputs:

- `apps/web/public/data/boundaries/ste_2021_simplified.geojson`
- `apps/web/public/data/boundaries/sa4_2021_simplified.geojson`

Validate boundary/API consistency:

```bash
npm run check:boundaries
```

Build latest labour-market snapshot CSV from ABS workbook:

```bash
npm run build:labour-market
```

To point web to another API base URL:

```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000 npm run dev:web
```

## Current scope

- Geography-first hierarchy: `Australia -> State/Territory -> SA4`
- Drilldown map surface with synchronized breadcrumb
- Source-style filters + visa/view mode controls
- Detail panel sections:
  - Migration evidence
  - Labour market
  - Industries
  - Evidence links

- Occupations and national/state shortage categories ingest from real OSL source data.
- Labour market panel ingests from real ABS LFS Table 12 state snapshot.
- Industry panel is still mocked and is the next replacement target.
