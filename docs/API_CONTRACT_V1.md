# AU-Settle Pro API Contract (v1)

This document defines the current backend contract for `apps/api`.

- Contract version: `v1`
- Base URL (local): `http://127.0.0.1:8000`
- Data status in this branch: `mock`

## Global behavior

- Every `v1` response model includes `meta`:
  - `contract_version`: `v1`
  - `data_status`: `mock | real`
- Unknown IDs return `404` with `{"detail":"Unknown id: <id>"}`.
- Invalid enum values (for `view_mode` or `visa_mode`) return `422`.

## Endpoints

### `GET /health`

- Purpose: liveness check.
- Response `200`:

```json
{"status":"ok"}
```

### `GET /api/v1/geographies/tree`

- Purpose: geography hierarchy for filters and drilldown.
- Response `200`: `GeographyTreeResponse`
  - `root_id: string`
  - `nodes: GeographyNode[]`
  - `meta: ResponseMeta`

`GeographyNode` fields:
- `id`, `parent_id`, `kind`, `code`
- `boundary_code`: ABS boundary key (`STE_CODE21` for state, `SA4_CODE21` for SA4)
- `canonical_name`, `display_name`
- `supported_view_modes`, `has_children`

### `GET /api/v1/occupations`

- Purpose: occupation filter options.
- Response `200`: `OccupationListResponse`
  - `occupations: Occupation[]`
  - `meta: ResponseMeta`

`Occupation` fields:
- `id`, `label`, `anzsco_code`, `major_group`
- `skill_level` (`1..5`)

### `GET /api/v1/explorer/map`

- Purpose: categorical shortage layer for current focus.
- Query params:
  - `focus_id` (default `au`)
  - `occupation_id` (default `software-engineer`)
  - `view_mode`: `all | metro | regional` (default `all`)
- Response `200`: `MapLayerResponse`
  - `focus`, `parent`, `breadcrumb`
  - `items[]` where each item has `geography` + `shortage_category`
  - `meta: ResponseMeta`
- Errors:
  - `404` for unknown `focus_id` or `occupation_id`
  - `422` for invalid `view_mode`

### `GET /api/v1/explorer/panel`

- Purpose: right-panel evidence data for selected geography + occupation + visa mode.
- Query params:
  - `geography_id` (default `au`)
  - `occupation_id` (default `software-engineer`)
  - `visa_mode`: `189 | 190 | 491` (default `491`)
  - `view_mode`: `all | metro | regional` (default `all`)
- Response `200`: `DetailPanelResponse`
  - `geography`, `occupation`, `visa_mode`, `view_mode`, `badges`
  - `migration_evidence`
  - `labour_market`
  - `industries`
  - `meta: ResponseMeta`
- Errors:
  - `404` for unknown `geography_id` or `occupation_id`
  - `422` for invalid enums

`migration_evidence` fields:
- `shortage_category`
- `source` (`title`, `url`, `last_updated`, `data_status`)
- `geography_scope`
- `visa_context_note`
- `references[]` (same `SourceReference` shape)
- `data_status`

## Current limits (known)

- Labour market and industry values are still mocked.
- Shortage category logic is deterministic mock logic, not full source-derived aggregation yet.
