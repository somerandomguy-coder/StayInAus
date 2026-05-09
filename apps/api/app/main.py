from __future__ import annotations

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .mock_data import (
    build_detail_panel,
    build_geography_tree,
    build_map_layer,
    list_occupations,
)
from .schemas import (
    DetailPanelResponse,
    GeographyTreeResponse,
    MapLayerResponse,
    OccupationListResponse,
    ViewMode,
    VisaMode,
)

app = FastAPI(
    title="AU-Settle Pro Explorer API",
    version="0.1.0",
    description="Mocked FastAPI backend for geography-first exploration contracts",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:3000", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/v1/geographies/tree", response_model=GeographyTreeResponse)
def get_geography_tree() -> GeographyTreeResponse:
    return build_geography_tree()


@app.get("/api/v1/occupations", response_model=OccupationListResponse)
def get_occupations() -> OccupationListResponse:
    return list_occupations()


@app.get("/api/v1/explorer/map", response_model=MapLayerResponse)
def get_map_layer(
    focus_id: str = Query(default="au"),
    occupation_id: str = Query(default="software-engineer"),
    view_mode: ViewMode = Query(default=ViewMode.ALL),
) -> MapLayerResponse:
    try:
        return build_map_layer(
            focus_id=focus_id,
            occupation_id=occupation_id,
            requested_view_mode=view_mode,
        )
    except KeyError as error:
        raise HTTPException(status_code=404, detail=f"Unknown id: {error.args[0]}") from error


@app.get("/api/v1/explorer/panel", response_model=DetailPanelResponse)
def get_detail_panel(
    geography_id: str = Query(default="au"),
    occupation_id: str = Query(default="software-engineer"),
    visa_mode: VisaMode = Query(default=VisaMode.SUBCLASS_491),
    view_mode: ViewMode = Query(default=ViewMode.ALL),
) -> DetailPanelResponse:
    try:
        return build_detail_panel(
            geography_id=geography_id,
            occupation_id=occupation_id,
            visa_mode=visa_mode,
            requested_view_mode=view_mode,
        )
    except KeyError as error:
        raise HTTPException(status_code=404, detail=f"Unknown id: {error.args[0]}") from error
