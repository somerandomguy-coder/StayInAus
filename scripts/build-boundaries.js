#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const RAW_DIR = path.join(ROOT, "apps", "data", "raw", "boundaries");
const OUT_DIR = path.join(ROOT, "apps", "web", "public", "data", "boundaries");

const STATE_FILE = path.join(RAW_DIR, "ste_2021.geojson");
const SA4_FILE = path.join(RAW_DIR, "sa4_2021.geojson");

const STATE_ABBREVIATION = {
  "New South Wales": "NSW",
  Victoria: "VIC",
  Queensland: "QLD",
  "South Australia": "SA",
  "Western Australia": "WA",
  Tasmania: "TAS",
  "Northern Territory": "NT",
  "Australian Capital Territory": "ACT",
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value));
}

function getSqDistance(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return dx * dx + dy * dy;
}

function getSqSegmentDistance(point, start, end) {
  let x = start[0];
  let y = start[1];
  let dx = end[0] - x;
  let dy = end[1] - y;

  if (dx !== 0 || dy !== 0) {
    const t = ((point[0] - x) * dx + (point[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x = end[0];
      y = end[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }

  dx = point[0] - x;
  dy = point[1] - y;
  return dx * dx + dy * dy;
}

function simplifyDPStep(points, first, last, sqTolerance, kept) {
  let maxSqDist = sqTolerance;
  let index = -1;

  for (let i = first + 1; i < last; i += 1) {
    const sqDist = getSqSegmentDistance(points[i], points[first], points[last]);
    if (sqDist > maxSqDist) {
      index = i;
      maxSqDist = sqDist;
    }
  }

  if (index > -1) {
    if (index - first > 1) {
      simplifyDPStep(points, first, index, sqTolerance, kept);
    }
    kept.push(points[index]);
    if (last - index > 1) {
      simplifyDPStep(points, index, last, sqTolerance, kept);
    }
  }
}

function simplifyLine(points, tolerance) {
  if (points.length <= 2) return points.slice();
  const sqTolerance = tolerance * tolerance;
  const filtered = [points[0]];
  for (let i = 1; i < points.length; i += 1) {
    if (getSqDistance(points[i], filtered[filtered.length - 1]) > sqTolerance) {
      filtered.push(points[i]);
    }
  }
  if (
    filtered.length === 0 ||
    filtered[filtered.length - 1][0] !== points[points.length - 1][0] ||
    filtered[filtered.length - 1][1] !== points[points.length - 1][1]
  ) {
    filtered.push(points[points.length - 1]);
  }

  const kept = [filtered[0]];
  simplifyDPStep(filtered, 0, filtered.length - 1, sqTolerance, kept);
  kept.push(filtered[filtered.length - 1]);
  return kept;
}

function ringArea(ring) {
  let total = 0;
  for (let i = 0; i < ring.length - 1; i += 1) {
    const a = ring[i];
    const b = ring[i + 1];
    total += a[0] * b[1] - b[0] * a[1];
  }
  return Math.abs(total / 2);
}

function roundPoint(point, precision) {
  const factor = 10 ** precision;
  return [
    Math.round(point[0] * factor) / factor,
    Math.round(point[1] * factor) / factor,
  ];
}

function simplifyRing(ring, options) {
  const { tolerance, minArea, precision } = options;
  if (!Array.isArray(ring) || ring.length < 4) return null;
  const isClosed =
    ring[0][0] === ring[ring.length - 1][0] &&
    ring[0][1] === ring[ring.length - 1][1];
  const open = isClosed ? ring.slice(0, -1) : ring.slice();
  if (open.length < 3) return null;

  const simplifiedOpen = simplifyLine(open, tolerance);
  if (simplifiedOpen.length < 3) return null;

  let closed = simplifiedOpen.map((point) => roundPoint(point, precision));
  const first = closed[0];
  const last = closed[closed.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    closed = [...closed, [first[0], first[1]]];
  }

  if (closed.length < 4) return null;
  if (ringArea(closed) < minArea) return null;
  return closed;
}

function simplifyMultiPolygonCoordinates(coordinates, options) {
  const polygons = [];
  for (const polygon of coordinates) {
    if (!Array.isArray(polygon) || polygon.length === 0) continue;
    const simplifiedRings = [];
    for (let i = 0; i < polygon.length; i += 1) {
      const ring = polygon[i];
      const threshold = i === 0 ? options.minAreaOuter : options.minAreaInner;
      const simplified = simplifyRing(ring, {
        tolerance: options.tolerance,
        minArea: threshold,
        precision: options.precision,
      });
      if (!simplified) continue;
      simplifiedRings.push(simplified);
    }
    if (simplifiedRings.length > 0) {
      polygons.push(simplifiedRings);
    }
  }
  return polygons;
}

function normalizeStateFeature(feature) {
  const props = feature.properties || {};
  const name = props.STE_NAME21;
  const abbreviation = STATE_ABBREVIATION[name];
  if (!abbreviation) return null;
  return {
    type: "Feature",
    properties: {
      code: abbreviation,
      name,
      ste_code21: String(props.STE_CODE21),
      area_sqkm21: Number(props.AREASQKM21 || 0),
    },
    geometry: feature.geometry,
  };
}

function normalizeSa4Feature(feature) {
  const props = feature.properties || {};
  const stateAbbreviation = STATE_ABBREVIATION[props.STE_NAME21] || null;
  if (!stateAbbreviation) return null;
  return {
    type: "Feature",
    properties: {
      sa4_code21: String(props.SA4_CODE21),
      sa4_name21: String(props.SA4_NAME21),
      ste_code: stateAbbreviation,
      ste_name21: String(props.STE_NAME21),
      area_sqkm21: Number(props.AREASQKM21 || 0),
    },
    geometry: feature.geometry,
  };
}

function simplifyCollection(input, options, normalizeFeature) {
  const outputFeatures = [];
  for (const feature of input.features || []) {
    if (!feature || !feature.geometry) continue;
    if (feature.geometry.type !== "MultiPolygon") continue;
    const normalized = normalizeFeature(feature);
    if (!normalized) continue;
    const simplifiedCoordinates = simplifyMultiPolygonCoordinates(
      normalized.geometry.coordinates,
      options,
    );
    if (simplifiedCoordinates.length === 0) continue;
    outputFeatures.push({
      type: "Feature",
      properties: normalized.properties,
      geometry: {
        type: "MultiPolygon",
        coordinates: simplifiedCoordinates,
      },
    });
  }

  return {
    type: "FeatureCollection",
    features: outputFeatures,
  };
}

function main() {
  const stateInput = readJson(STATE_FILE);
  const sa4Input = readJson(SA4_FILE);

  const stateSimplified = simplifyCollection(
    stateInput,
    {
      tolerance: 0.035,
      precision: 4,
      minAreaOuter: 0.0018,
      minAreaInner: 0.0012,
    },
    normalizeStateFeature,
  );

  const sa4Simplified = simplifyCollection(
    sa4Input,
    {
      tolerance: 0.01,
      precision: 4,
      minAreaOuter: 0,
      minAreaInner: 0,
    },
    normalizeSa4Feature,
  );

  const stateOut = path.join(OUT_DIR, "ste_2021_simplified.geojson");
  const sa4Out = path.join(OUT_DIR, "sa4_2021_simplified.geojson");
  writeJson(stateOut, stateSimplified);
  writeJson(sa4Out, sa4Simplified);

  const stateBytes = fs.statSync(stateOut).size;
  const sa4Bytes = fs.statSync(sa4Out).size;
  console.log(`Wrote ${stateOut} (${stateBytes} bytes)`);
  console.log(`Wrote ${sa4Out} (${sa4Bytes} bytes)`);
}

main();
