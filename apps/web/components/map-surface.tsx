"use client";

import { useEffect, useMemo, useState } from "react";

import type { MapLayerItem, ShortageCategory } from "../lib/types";

const CATEGORY_CLASS: Record<ShortageCategory, string> = {
  shortage: "cat-shortage",
  regional_shortage: "cat-regional-shortage",
  metropolitan_shortage: "cat-metropolitan-shortage",
  no_shortage: "cat-no-shortage",
};

function formatCategory(category: ShortageCategory) {
  if (category === "shortage") return "Shortage";
  if (category === "regional_shortage") return "Regional shortage";
  if (category === "metropolitan_shortage") return "Metropolitan shortage";
  return "No shortage";
}

const CATEGORY_COLORS: Record<ShortageCategory, string> = {
  shortage: "#4aa84f",
  regional_shortage: "#ef9e24",
  metropolitan_shortage: "#db4d8f",
  no_shortage: "#c36a2f",
};

type Position = [number, number];
type Ring = Position[];
type Polygon = Ring[];
type MultiPolygon = Polygon[];

interface StateBoundaryFeature {
  type: "Feature";
  properties: {
    code: string;
    name: string;
  };
  geometry: {
    type: "MultiPolygon";
    coordinates: MultiPolygon;
  };
}

interface Sa4BoundaryFeature {
  type: "Feature";
  properties: {
    sa4_code21: string;
    sa4_name21: string;
    ste_code: string;
  };
  geometry: {
    type: "MultiPolygon";
    coordinates: MultiPolygon;
  };
}

interface BoundaryCollections {
  states: StateBoundaryFeature[];
  sa4: Sa4BoundaryFeature[];
}

interface BBox {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
}

const SVG_WIDTH = 920;
const SVG_HEIGHT = 700;
const SVG_PADDING = 24;

const SA4_NAME_ALIASES: Record<string, string> = {
  "brisbane-inner city": "brisbane inner city",
  "adelaide-city": "adelaide-central and hills",
  "goldfields-esperance": "western australia-outback (south)",
  canberra: "australian capital territory",
  "outback-nt": "northern territory-outback",
};

function isStateMap(items: MapLayerItem[]) {
  if (items.length === 0) return false;
  return items.every((item) => item.geography.kind === "state");
}

function isSa4Map(items: MapLayerItem[]) {
  if (items.length === 0) return false;
  return items.every((item) => item.geography.kind === "sa4");
}

function normalizeSa4Name(value: string) {
  return value
    .toLowerCase()
    .replace(/^sa4:\s*/i, "")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\s*-\s*/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function iterateCoordinates(geometry: { coordinates: MultiPolygon }, cb: (coord: Position) => void) {
  for (const polygon of geometry.coordinates) {
    for (const ring of polygon) {
      for (const point of ring) {
        cb(point);
      }
    }
  }
}

function getBBox(features: Array<{ geometry: { coordinates: MultiPolygon } }>): BBox {
  let minLon = Number.POSITIVE_INFINITY;
  let minLat = Number.POSITIVE_INFINITY;
  let maxLon = Number.NEGATIVE_INFINITY;
  let maxLat = Number.NEGATIVE_INFINITY;

  for (const feature of features) {
    iterateCoordinates(feature.geometry, ([lon, lat]) => {
      if (lon < minLon) minLon = lon;
      if (lat < minLat) minLat = lat;
      if (lon > maxLon) maxLon = lon;
      if (lat > maxLat) maxLat = lat;
    });
  }

  return { minLon, minLat, maxLon, maxLat };
}

function makeProjector(features: Array<{ geometry: { coordinates: MultiPolygon } }>) {
  const bbox = getBBox(features);
  const lonSpan = Math.max(0.0001, bbox.maxLon - bbox.minLon);
  const latSpan = Math.max(0.0001, bbox.maxLat - bbox.minLat);

  const availableWidth = SVG_WIDTH - SVG_PADDING * 2;
  const availableHeight = SVG_HEIGHT - SVG_PADDING * 2;
  const scale = Math.min(availableWidth / lonSpan, availableHeight / latSpan);

  const drawWidth = lonSpan * scale;
  const drawHeight = latSpan * scale;
  const offsetX = (SVG_WIDTH - drawWidth) / 2;
  const offsetY = (SVG_HEIGHT - drawHeight) / 2;

  return ([lon, lat]: Position): Position => {
    const x = offsetX + (lon - bbox.minLon) * scale;
    const y = offsetY + (bbox.maxLat - lat) * scale;
    return [x, y];
  };
}

function geometryToPath(
  geometry: { coordinates: MultiPolygon },
  project: (point: Position) => Position,
) {
  const parts: string[] = [];
  for (const polygon of geometry.coordinates) {
    for (const ring of polygon) {
      if (!ring.length) continue;
      const first = project(ring[0]);
      parts.push(`M${first[0].toFixed(2)} ${first[1].toFixed(2)}`);
      for (let i = 1; i < ring.length; i += 1) {
        const projected = project(ring[i]);
        parts.push(`L${projected[0].toFixed(2)} ${projected[1].toFixed(2)}`);
      }
      parts.push("Z");
    }
  }
  return parts.join(" ");
}

function geometryCentroid(
  geometry: { coordinates: MultiPolygon },
  project: (point: Position) => Position,
): Position {
  let totalX = 0;
  let totalY = 0;
  let count = 0;

  iterateCoordinates(geometry, (point) => {
    const [x, y] = project(point);
    totalX += x;
    totalY += y;
    count += 1;
  });

  if (count === 0) return [0, 0];
  return [totalX / count, totalY / count];
}

function inferStateCodeFromSa4(items: MapLayerItem[]) {
  const firstCode = items[0]?.geography.code ?? "";
  const prefix = firstCode.split("_")[0];
  return prefix.length > 0 ? prefix : null;
}

function BoundaryMap({
  items,
  selectedId,
  boundaries,
  onSelect,
}: {
  items: MapLayerItem[];
  selectedId: string;
  boundaries: BoundaryCollections;
  onSelect: (id: string) => void;
}) {
  const mapMode = isStateMap(items) ? "state" : isSa4Map(items) ? "sa4" : "none";

  const renderFeatures = useMemo(() => {
    if (mapMode === "state") {
      const byCode = new Map(items.map((item) => [item.geography.code, item]));
      return boundaries.states.map((feature) => {
        const item = byCode.get(feature.properties.code);
        return {
          key: feature.properties.code,
          label: feature.properties.code,
          geometry: feature.geometry,
          item,
        };
      });
    }

    if (mapMode === "sa4") {
      const stateCode = inferStateCodeFromSa4(items);
      if (!stateCode) return [];

      const byName = new Map<string, MapLayerItem>();
      for (const item of items) {
        const rawName = item.geography.canonical_name.replace(/^SA4:\s*/, "");
        const normalized = normalizeSa4Name(rawName);
        const alias = SA4_NAME_ALIASES[normalized] ?? normalized;
        byName.set(alias, item);
      }

      return boundaries.sa4
        .filter((feature) => feature.properties.ste_code === stateCode)
        .map((feature) => {
          const normalized = normalizeSa4Name(feature.properties.sa4_name21);
          const item = byName.get(normalized);
          return {
            key: `${feature.properties.ste_code}-${feature.properties.sa4_code21}`,
            label: feature.properties.sa4_name21,
            geometry: feature.geometry,
            item,
          };
        });
    }

    return [];
  }, [boundaries.sa4, boundaries.states, items, mapMode]);

  const projector = useMemo(() => {
    if (renderFeatures.length === 0) return null;
    return makeProjector(renderFeatures);
  }, [renderFeatures]);

  if (mapMode === "none" || renderFeatures.length === 0 || !projector) {
    return null;
  }

  return (
    <div className="australia-map-wrap">
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="australia-map"
        role="img"
        aria-label="Australian shortage evidence map"
      >
        <rect x={0} y={0} width={SVG_WIDTH} height={SVG_HEIGHT} className="map-bg" />
        {renderFeatures.map((entry) => {
          const path = geometryToPath(entry.geometry, projector);
          const isSelected = entry.item?.geography.id === selectedId;
          const shortageCategory = entry.item?.shortage_category;
          const hasData = Boolean(shortageCategory);
          const color = shortageCategory
            ? CATEGORY_COLORS[shortageCategory]
            : "#dbe2ea";
          const centroid = geometryCentroid(entry.geometry, projector);
          const titleSuffix = shortageCategory
            ? formatCategory(shortageCategory)
            : "no mapped evidence";

          return (
            <g key={entry.key}>
              <path
                d={path}
                style={{ fill: color }}
                className={`state-shape ${isSelected ? "selected" : ""} ${
                  hasData ? "has-data" : "no-data"
                }`}
                onClick={() => {
                  if (!entry.item) return;
                  onSelect(entry.item.geography.id);
                }}
              >
                <title>
                  {entry.label}
                  {` - ${titleSuffix}`}
                </title>
              </path>
              {mapMode === "state" ? (
                <text x={centroid[0]} y={centroid[1]} className="state-label">
                  {entry.label}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

interface MapSurfaceProps {
  items: MapLayerItem[];
  selectedId: string;
  focusLabel: string;
  onSelect: (id: string) => void;
}

export function MapSurface({
  items,
  selectedId,
  focusLabel,
  onSelect,
}: MapSurfaceProps) {
  const [boundaries, setBoundaries] = useState<BoundaryCollections | null>(null);
  const [boundaryError, setBoundaryError] = useState<string | null>(null);
  const showStateMap = isStateMap(items);
  const showSa4Map = isSa4Map(items);
  const shouldTryBoundaryMap = showStateMap || showSa4Map;

  useEffect(() => {
    if (!shouldTryBoundaryMap) return;
    let active = true;
    Promise.all([
      fetch("/data/boundaries/ste_2021_simplified.geojson", { cache: "force-cache" }).then(
        (res) => res.json(),
      ),
      fetch("/data/boundaries/sa4_2021_simplified.geojson", { cache: "force-cache" }).then(
        (res) => res.json(),
      ),
    ])
      .then(([states, sa4]) => {
        if (!active) return;
        setBoundaries({
          states: states.features ?? [],
          sa4: sa4.features ?? [],
        });
      })
      .catch((error: Error) => {
        if (!active) return;
        setBoundaryError(error.message);
      });
    return () => {
      active = false;
    };
  }, [shouldTryBoundaryMap]);

  return (
    <section className="panel map-surface">
      <header className="map-header">
        <div>
          <p className="eyebrow">Evidence map</p>
          <h2>Drilldown focus: {focusLabel}</h2>
        </div>
        <p className="map-hint">
          Categories use product-normalized shortage colors, not source-native
          palette.
        </p>
      </header>

      {items.length === 0 ? (
        <p className="empty-state">
          No regions are available at this level with current filters.
        </p>
      ) : shouldTryBoundaryMap && boundaries ? (
        <BoundaryMap
          items={items}
          selectedId={selectedId}
          boundaries={boundaries}
          onSelect={onSelect}
        />
      ) : shouldTryBoundaryMap && boundaryError ? (
        <p className="empty-state">Boundary load failed: {boundaryError}</p>
      ) : (
        <div className="tile-grid">
          {items.map((item) => (
            <button
              type="button"
              key={item.geography.id}
              className={`tile ${CATEGORY_CLASS[item.shortage_category]} ${
                item.geography.id === selectedId ? "selected" : ""
              }`}
              onClick={() => onSelect(item.geography.id)}
            >
              <span className="tile-name">{item.geography.display_name}</span>
              <span className="tile-meta">{item.geography.canonical_name}</span>
              <span className="tile-tag">
                {formatCategory(item.shortage_category)}
              </span>
            </button>
          ))}
        </div>
      )}

      <footer className="legend">
        <span className="legend-item cat-shortage">Shortage</span>
        <span className="legend-item cat-regional-shortage">Regional shortage</span>
        <span className="legend-item cat-metropolitan-shortage">
          Metropolitan shortage
        </span>
        <span className="legend-item cat-no-shortage">No shortage</span>
      </footer>
    </section>
  );
}
