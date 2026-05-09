# Boundary Consistency Plan

Goal: make API geography IDs and boundary files integrate with zero manual aliasing.

## 1) Canonical join keys

- State level:
  - API key: `GeographyNode.code` (`NSW`, `VIC`, ...)
  - Boundary key: `ste_2021_simplified.geojson -> properties.code`
  - Verification key: `GeographyNode.boundary_code == properties.ste_code21`
- SA4 level:
  - API key: `GeographyNode.boundary_code`
  - Boundary key: `sa4_2021_simplified.geojson -> properties.sa4_code21`
  - Parent consistency: SA4 `ste_code` must match parent state `code`

## 2) Naming policy

- `canonical_name` should match ABS names exactly (for deterministic matching and audits).
- `display_name` can stay product-friendly.
- Avoid joining map data on free-text labels; use boundary codes.

## 3) Validation gate

- Script: `apps/api/scripts/validate_boundary_consistency.py`
- It checks:
  - state code to `STE_CODE21` mapping
  - SA4 code existence
  - SA4 parent-state alignment
  - SA4 canonical name vs boundary name

Run:

```bash
python3 apps/api/scripts/validate_boundary_consistency.py
```

## 4) Integration next step for frontend

- Replace SA4 name-based map joins in `apps/web/components/map-surface.tsx` with `boundary_code` joins.
- Keep name aliases only as temporary fallback during migration.
- Once frontend uses `boundary_code`, remove alias map and fail fast on missing boundary codes.
