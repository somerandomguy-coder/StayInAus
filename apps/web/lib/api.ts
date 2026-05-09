import type {
  DetailPanelResponse,
  GeographyTreeResponse,
  MapLayerResponse,
  OccupationListResponse,
  ViewMode,
  VisaMode,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Failed API request: ${response.status}`);
  }
  return (await response.json()) as T;
}

export function fetchGeographyTree() {
  return fetchJson<GeographyTreeResponse>("/api/v1/geographies/tree");
}

export function fetchOccupations() {
  return fetchJson<OccupationListResponse>("/api/v1/occupations");
}

export function fetchMapLayer(params: {
  focusId: string;
  occupationId: string;
  viewMode: ViewMode;
}) {
  const search = new URLSearchParams({
    focus_id: params.focusId,
    occupation_id: params.occupationId,
    view_mode: params.viewMode,
  });
  return fetchJson<MapLayerResponse>(`/api/v1/explorer/map?${search.toString()}`);
}

export function fetchDetailPanel(params: {
  geographyId: string;
  occupationId: string;
  visaMode: VisaMode;
  viewMode: ViewMode;
}) {
  const search = new URLSearchParams({
    geography_id: params.geographyId,
    occupation_id: params.occupationId,
    visa_mode: params.visaMode,
    view_mode: params.viewMode,
  });
  return fetchJson<DetailPanelResponse>(
    `/api/v1/explorer/panel?${search.toString()}`,
  );
}
