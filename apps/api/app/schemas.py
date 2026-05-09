from __future__ import annotations

from datetime import date
from enum import Enum

from pydantic import BaseModel, Field, HttpUrl

CONTRACT_VERSION = "v1"


class GeographyKind(str, Enum):
    COUNTRY = "country"
    STATE = "state"
    SA4 = "sa4"


class ViewMode(str, Enum):
    ALL = "all"
    METRO = "metro"
    REGIONAL = "regional"


class ShortageCategory(str, Enum):
    SHORTAGE = "shortage"
    REGIONAL_SHORTAGE = "regional_shortage"
    METROPOLITAN_SHORTAGE = "metropolitan_shortage"
    NO_SHORTAGE = "no_shortage"


class VisaMode(str, Enum):
    SUBCLASS_189 = "189"
    SUBCLASS_190 = "190"
    SUBCLASS_491 = "491"


class DataStatus(str, Enum):
    MOCK = "mock"
    REAL = "real"


class ResponseMeta(BaseModel):
    contract_version: str = CONTRACT_VERSION
    data_status: DataStatus = DataStatus.MOCK


class SourceReference(BaseModel):
    title: str
    url: HttpUrl
    last_updated: date
    data_status: DataStatus = DataStatus.MOCK


class GeographyNode(BaseModel):
    id: str
    parent_id: str | None = None
    kind: GeographyKind
    code: str
    boundary_code: str | None = None
    canonical_name: str
    display_name: str
    supported_view_modes: list[ViewMode] = Field(default_factory=list)
    has_children: bool = False


class GeographyTreeResponse(BaseModel):
    root_id: str
    nodes: list[GeographyNode]
    meta: ResponseMeta = Field(default_factory=ResponseMeta)


class Occupation(BaseModel):
    id: str
    label: str
    anzsco_code: str
    major_group: str
    skill_level: int = Field(ge=1, le=5)


class OccupationListResponse(BaseModel):
    occupations: list[Occupation]
    meta: ResponseMeta = Field(default_factory=ResponseMeta)


class MapLayerItem(BaseModel):
    geography: GeographyNode
    shortage_category: ShortageCategory


class MapLayerResponse(BaseModel):
    focus: GeographyNode
    parent: GeographyNode | None = None
    breadcrumb: list[GeographyNode]
    items: list[MapLayerItem]
    meta: ResponseMeta = Field(default_factory=ResponseMeta)


class MigrationEvidence(BaseModel):
    shortage_category: ShortageCategory
    source: SourceReference
    geography_scope: ViewMode
    visa_context_note: str
    references: list[SourceReference]
    data_status: DataStatus = DataStatus.MOCK


class LabourMarketSnapshot(BaseModel):
    population: int = Field(ge=0)
    employment: int = Field(ge=0)
    unemployment_rate: float = Field(ge=0, le=100)


class IndustryStat(BaseModel):
    name: str
    employment_share: float = Field(ge=0, le=100)


class DetailPanelResponse(BaseModel):
    geography: GeographyNode
    occupation: Occupation
    visa_mode: VisaMode
    view_mode: ViewMode
    badges: list[str]
    migration_evidence: MigrationEvidence
    labour_market: LabourMarketSnapshot
    industries: list[IndustryStat]
    meta: ResponseMeta = Field(default_factory=ResponseMeta)
