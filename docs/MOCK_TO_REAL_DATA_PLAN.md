# Mock-to-Real Data Plan (Person B Scope)

This plan is implementation-ready, but intentionally does not fully ingest real data yet.

## 1) What is mocked today

- Geography tree: `GEOGRAPHY_NODES` in `apps/api/app/mock_data.py`
- Occupations list: `OCCUPATIONS`
- Shortage categories and occupation overrides: `BASE_CATEGORIES`, `OCCUPATION_OVERRIDES`
- Labour market: `LABOUR_MARKET_DATA`
- Industries: `INDUSTRY_DATA`
- Source references and dates: `JSA_SOURCE`, `SKILLSELECT_SOURCE`, `ABS_SOURCE`

## 2) Real data targets

- Occupation shortage status:
  - Source: Jobs and Skills Australia Occupation Shortage List
  - Output target: shortage category by `occupation` x `geography_scope` (all/metro/regional)
- Labour market core metrics (population, employment, unemployment):
  - Source: ABS Labour Force / Labour Account tables
  - Output target: national + state baseline snapshots
- Top industries by employment share:
  - Source: Jobs and Skills Atlas / ABS-aligned industry tables
  - Output target: top-5 industries by state (then SA4 if available)
- Migration context evidence:
  - Source: SkillSelect EOI dashboard metadata
  - Output target: referenced context block, not eligibility decision logic

## 3) Incremental rollout

### Phase A: data contracts first

- Add source staging files under `apps/data/raw/` for shortage, labour, and industries.
- Define stable normalized tables (CSV/JSON):
  - `occupation_shortage_normalized`
  - `labour_market_normalized`
  - `industry_share_normalized`
- Keep API response shape unchanged while swapping internals.

### Phase B: replace weakest mocks first

- Replace `LABOUR_MARKET_DATA` (currently least trustworthy).
- Replace `INDUSTRY_DATA` with source-backed state-level top 5.
- Keep geography/occupation fallback behavior deterministic.

### Phase C: shortage matrix

- Replace `BASE_CATEGORIES` + `OCCUPATION_OVERRIDES` with source-derived matrix.
- Preserve current category enum values:
  - `shortage`
  - `regional_shortage`
  - `metropolitan_shortage`
  - `no_shortage`

### Phase D: provenance hardening

- Keep `SourceReference.last_updated` real per dataset update.
- Move `meta.data_status` from `mock` to `real` endpoint-by-endpoint.
- Add changelog note when each endpoint flips to real data.

## 4) Guardrails

- No scoring model changes until all panel metrics are source-backed.
- No frontend contract changes without a version bump in `API_CONTRACT_V1.md`.
- Each real-data replacement must ship with tests and a fixture snapshot.
