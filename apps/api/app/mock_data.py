from __future__ import annotations

from collections import defaultdict

from .schemas import (
    DetailPanelResponse,
    GeographyNode,
    GeographyTreeResponse,
    IndustryStat,
    LabourMarketSnapshot,
    MapLayerItem,
    MapLayerResponse,
    MigrationEvidence,
    Occupation,
    OccupationListResponse,
    ShortageCategory,
    SourceReference,
    ViewMode,
    VisaMode,
)

GEOGRAPHY_NODES = [
    {
        "id": "au",
        "parent_id": None,
        "kind": "country",
        "code": "AU",
        "canonical_name": "Australia",
        "display_name": "Australia",
        "supported_view_modes": ["all"],
        "has_children": True,
    },
    {
        "id": "state-nsw",
        "parent_id": "au",
        "kind": "state",
        "code": "NSW",
        "canonical_name": "New South Wales",
        "display_name": "NSW",
        "supported_view_modes": ["all", "metro", "regional"],
        "has_children": True,
    },
    {
        "id": "state-vic",
        "parent_id": "au",
        "kind": "state",
        "code": "VIC",
        "canonical_name": "Victoria",
        "display_name": "VIC",
        "supported_view_modes": ["all", "metro", "regional"],
        "has_children": True,
    },
    {
        "id": "state-qld",
        "parent_id": "au",
        "kind": "state",
        "code": "QLD",
        "canonical_name": "Queensland",
        "display_name": "QLD",
        "supported_view_modes": ["all", "metro", "regional"],
        "has_children": True,
    },
    {
        "id": "state-sa",
        "parent_id": "au",
        "kind": "state",
        "code": "SA",
        "canonical_name": "South Australia",
        "display_name": "SA",
        "supported_view_modes": ["all", "metro", "regional"],
        "has_children": True,
    },
    {
        "id": "state-wa",
        "parent_id": "au",
        "kind": "state",
        "code": "WA",
        "canonical_name": "Western Australia",
        "display_name": "WA",
        "supported_view_modes": ["all", "metro", "regional"],
        "has_children": True,
    },
    {
        "id": "state-tas",
        "parent_id": "au",
        "kind": "state",
        "code": "TAS",
        "canonical_name": "Tasmania",
        "display_name": "TAS",
        "supported_view_modes": ["all", "metro", "regional"],
        "has_children": True,
    },
    {
        "id": "state-act",
        "parent_id": "au",
        "kind": "state",
        "code": "ACT",
        "canonical_name": "Australian Capital Territory",
        "display_name": "ACT",
        "supported_view_modes": ["all", "metro"],
        "has_children": True,
    },
    {
        "id": "state-nt",
        "parent_id": "au",
        "kind": "state",
        "code": "NT",
        "canonical_name": "Northern Territory",
        "display_name": "NT",
        "supported_view_modes": ["all", "metro", "regional"],
        "has_children": True,
    },
    {
        "id": "sa4-nsw-sydney-inner-west",
        "parent_id": "state-nsw",
        "kind": "sa4",
        "code": "NSW_IW",
        "canonical_name": "SA4: Sydney - Inner West",
        "display_name": "Sydney Inner West",
        "supported_view_modes": ["metro"],
        "has_children": False,
    },
    {
        "id": "sa4-nsw-sydney-inner-south-west",
        "parent_id": "state-nsw",
        "kind": "sa4",
        "code": "NSW_ISW",
        "canonical_name": "SA4: Sydney - Inner South West",
        "display_name": "Sydney Inner South West",
        "supported_view_modes": ["metro"],
        "has_children": False,
    },
    {
        "id": "sa4-nsw-central-coast",
        "parent_id": "state-nsw",
        "kind": "sa4",
        "code": "NSW_CC",
        "canonical_name": "SA4: Central Coast",
        "display_name": "Central Coast",
        "supported_view_modes": ["regional"],
        "has_children": False,
    },
    {
        "id": "sa4-nsw-newcastle",
        "parent_id": "state-nsw",
        "kind": "sa4",
        "code": "NSW_NW",
        "canonical_name": "SA4: Newcastle and Lake Macquarie",
        "display_name": "Newcastle and Lake Macquarie",
        "supported_view_modes": ["regional"],
        "has_children": False,
    },
    {
        "id": "sa4-vic-melbourne-inner",
        "parent_id": "state-vic",
        "kind": "sa4",
        "code": "VIC_MI",
        "canonical_name": "SA4: Melbourne - Inner",
        "display_name": "Melbourne Inner",
        "supported_view_modes": ["metro"],
        "has_children": False,
    },
    {
        "id": "sa4-vic-geelong",
        "parent_id": "state-vic",
        "kind": "sa4",
        "code": "VIC_GE",
        "canonical_name": "SA4: Geelong",
        "display_name": "Geelong",
        "supported_view_modes": ["regional"],
        "has_children": False,
    },
    {
        "id": "sa4-qld-brisbane-inner-city",
        "parent_id": "state-qld",
        "kind": "sa4",
        "code": "QLD_BIC",
        "canonical_name": "SA4: Brisbane - Inner City",
        "display_name": "Brisbane Inner City",
        "supported_view_modes": ["metro"],
        "has_children": False,
    },
    {
        "id": "sa4-qld-cairns",
        "parent_id": "state-qld",
        "kind": "sa4",
        "code": "QLD_CA",
        "canonical_name": "SA4: Cairns",
        "display_name": "Cairns",
        "supported_view_modes": ["regional"],
        "has_children": False,
    },
    {
        "id": "sa4-sa-adelaide-city",
        "parent_id": "state-sa",
        "kind": "sa4",
        "code": "SA_AC",
        "canonical_name": "SA4: Adelaide - City",
        "display_name": "Adelaide City",
        "supported_view_modes": ["metro"],
        "has_children": False,
    },
    {
        "id": "sa4-sa-barossa-yorke-mid-north",
        "parent_id": "state-sa",
        "kind": "sa4",
        "code": "SA_BYM",
        "canonical_name": "SA4: Barossa - Yorke - Mid North",
        "display_name": "Barossa, Yorke and Mid North",
        "supported_view_modes": ["regional"],
        "has_children": False,
    },
    {
        "id": "sa4-wa-perth-inner",
        "parent_id": "state-wa",
        "kind": "sa4",
        "code": "WA_PI",
        "canonical_name": "SA4: Perth - Inner",
        "display_name": "Perth Inner",
        "supported_view_modes": ["metro"],
        "has_children": False,
    },
    {
        "id": "sa4-wa-goldfields-esperance",
        "parent_id": "state-wa",
        "kind": "sa4",
        "code": "WA_GE",
        "canonical_name": "SA4: Goldfields - Esperance",
        "display_name": "Goldfields and Esperance",
        "supported_view_modes": ["regional"],
        "has_children": False,
    },
    {
        "id": "sa4-tas-hobart",
        "parent_id": "state-tas",
        "kind": "sa4",
        "code": "TAS_HO",
        "canonical_name": "SA4: Hobart",
        "display_name": "Hobart",
        "supported_view_modes": ["metro"],
        "has_children": False,
    },
    {
        "id": "sa4-tas-south-east",
        "parent_id": "state-tas",
        "kind": "sa4",
        "code": "TAS_SE",
        "canonical_name": "SA4: South East",
        "display_name": "South East Tasmania",
        "supported_view_modes": ["regional"],
        "has_children": False,
    },
    {
        "id": "sa4-act-canberra",
        "parent_id": "state-act",
        "kind": "sa4",
        "code": "ACT_CA",
        "canonical_name": "SA4: Canberra",
        "display_name": "Canberra",
        "supported_view_modes": ["metro"],
        "has_children": False,
    },
    {
        "id": "sa4-nt-darwin",
        "parent_id": "state-nt",
        "kind": "sa4",
        "code": "NT_DA",
        "canonical_name": "SA4: Darwin",
        "display_name": "Darwin",
        "supported_view_modes": ["metro"],
        "has_children": False,
    },
    {
        "id": "sa4-nt-outback",
        "parent_id": "state-nt",
        "kind": "sa4",
        "code": "NT_OB",
        "canonical_name": "SA4: Outback - NT",
        "display_name": "NT Outback",
        "supported_view_modes": ["regional"],
        "has_children": False,
    },
]

OCCUPATIONS = [
    {
        "id": "software-engineer",
        "label": "Software Engineer",
        "anzsco_code": "261313",
        "major_group": "Professionals",
        "skill_level": 1,
    },
    {
        "id": "ict-business-analyst",
        "label": "ICT Business Analyst",
        "anzsco_code": "261111",
        "major_group": "Professionals",
        "skill_level": 1,
    },
    {
        "id": "civil-engineer",
        "label": "Civil Engineer",
        "anzsco_code": "233211",
        "major_group": "Professionals",
        "skill_level": 1,
    },
    {
        "id": "registered-nurse",
        "label": "Registered Nurse (nec)",
        "anzsco_code": "254499",
        "major_group": "Professionals",
        "skill_level": 1,
    },
    {
        "id": "carpenter",
        "label": "Carpenter",
        "anzsco_code": "331212",
        "major_group": "Technicians and Trades Workers",
        "skill_level": 3,
    },
]

NODE_INDEX = {node["id"]: node for node in GEOGRAPHY_NODES}
CHILDREN_INDEX: dict[str, list[dict]] = defaultdict(list)
for _node in GEOGRAPHY_NODES:
    if _node["parent_id"]:
        CHILDREN_INDEX[_node["parent_id"]].append(_node)

OCCUPATION_INDEX = {occupation["id"]: occupation for occupation in OCCUPATIONS}

JSA_SOURCE = SourceReference(
    title="Jobs and Skills Australia Occupation Shortage List",
    url="https://www.jobsandskills.gov.au/data/occupation-shortage/occupation-shortage-list",
    last_updated="2026-04-24",
)
SKILLSELECT_SOURCE = SourceReference(
    title="SkillSelect EOI Data Dashboard",
    url="https://api.dynamic.reports.employment.gov.au/anonap/extensions/hSKLS02_SkillSelect_EOI_Data/hSKLS02_SkillSelect_EOI_Data.html",
    last_updated="2026-04-24",
)
ABS_SOURCE = SourceReference(
    title="ABS Labour Force Survey",
    url="https://www.abs.gov.au/statistics/labour/employment-and-unemployment",
    last_updated="2026-04-24",
)

BASE_CATEGORIES = {
    "au": ShortageCategory.SHORTAGE,
    "state-nsw": ShortageCategory.SHORTAGE,
    "state-vic": ShortageCategory.SHORTAGE,
    "state-qld": ShortageCategory.SHORTAGE,
    "state-sa": ShortageCategory.REGIONAL_SHORTAGE,
    "state-wa": ShortageCategory.REGIONAL_SHORTAGE,
    "state-tas": ShortageCategory.REGIONAL_SHORTAGE,
    "state-act": ShortageCategory.METROPOLITAN_SHORTAGE,
    "state-nt": ShortageCategory.REGIONAL_SHORTAGE,
    "sa4-nsw-sydney-inner-west": ShortageCategory.METROPOLITAN_SHORTAGE,
    "sa4-nsw-sydney-inner-south-west": ShortageCategory.METROPOLITAN_SHORTAGE,
    "sa4-nsw-central-coast": ShortageCategory.REGIONAL_SHORTAGE,
    "sa4-nsw-newcastle": ShortageCategory.REGIONAL_SHORTAGE,
    "sa4-vic-melbourne-inner": ShortageCategory.METROPOLITAN_SHORTAGE,
    "sa4-vic-geelong": ShortageCategory.REGIONAL_SHORTAGE,
    "sa4-qld-brisbane-inner-city": ShortageCategory.METROPOLITAN_SHORTAGE,
    "sa4-qld-cairns": ShortageCategory.REGIONAL_SHORTAGE,
    "sa4-sa-adelaide-city": ShortageCategory.METROPOLITAN_SHORTAGE,
    "sa4-sa-barossa-yorke-mid-north": ShortageCategory.REGIONAL_SHORTAGE,
    "sa4-wa-perth-inner": ShortageCategory.METROPOLITAN_SHORTAGE,
    "sa4-wa-goldfields-esperance": ShortageCategory.REGIONAL_SHORTAGE,
    "sa4-tas-hobart": ShortageCategory.METROPOLITAN_SHORTAGE,
    "sa4-tas-south-east": ShortageCategory.REGIONAL_SHORTAGE,
    "sa4-act-canberra": ShortageCategory.METROPOLITAN_SHORTAGE,
    "sa4-nt-darwin": ShortageCategory.METROPOLITAN_SHORTAGE,
    "sa4-nt-outback": ShortageCategory.REGIONAL_SHORTAGE,
}

OCCUPATION_OVERRIDES: dict[str, dict[str, ShortageCategory]] = {
    "software-engineer": {
        "state-sa": ShortageCategory.NO_SHORTAGE,
        "state-tas": ShortageCategory.NO_SHORTAGE,
        "sa4-sa-barossa-yorke-mid-north": ShortageCategory.NO_SHORTAGE,
    },
    "carpenter": {
        "au": ShortageCategory.REGIONAL_SHORTAGE,
        "state-nsw": ShortageCategory.REGIONAL_SHORTAGE,
        "state-vic": ShortageCategory.REGIONAL_SHORTAGE,
        "state-qld": ShortageCategory.REGIONAL_SHORTAGE,
        "sa4-vic-melbourne-inner": ShortageCategory.NO_SHORTAGE,
        "sa4-qld-brisbane-inner-city": ShortageCategory.NO_SHORTAGE,
    },
    "registered-nurse": {
        "au": ShortageCategory.SHORTAGE,
        "state-sa": ShortageCategory.SHORTAGE,
        "state-wa": ShortageCategory.SHORTAGE,
        "sa4-nt-outback": ShortageCategory.SHORTAGE,
    },
}

LABOUR_MARKET_DATA = {
    "au": {"population": 27100000, "employment": 14500000, "unemployment_rate": 4.1},
    "state-nsw": {"population": 8540000, "employment": 4380000, "unemployment_rate": 4.0},
    "state-vic": {"population": 6910000, "employment": 3600000, "unemployment_rate": 4.3},
    "state-qld": {"population": 5590000, "employment": 2900000, "unemployment_rate": 4.2},
    "state-sa": {"population": 1890000, "employment": 930000, "unemployment_rate": 4.5},
    "state-wa": {"population": 2980000, "employment": 1570000, "unemployment_rate": 3.8},
    "state-tas": {"population": 576000, "employment": 290000, "unemployment_rate": 4.8},
    "state-act": {"population": 474000, "employment": 252000, "unemployment_rate": 3.6},
    "state-nt": {"population": 255000, "employment": 128000, "unemployment_rate": 3.9},
}

INDUSTRY_DATA = {
    "au": [
        {"name": "Health Care and Social Assistance", "employment_share": 14.8},
        {"name": "Professional, Scientific and Technical Services", "employment_share": 10.2},
        {"name": "Retail Trade", "employment_share": 9.1},
        {"name": "Construction", "employment_share": 8.6},
        {"name": "Education and Training", "employment_share": 8.2},
    ],
    "state-nsw": [
        {"name": "Health Care and Social Assistance", "employment_share": 14.3},
        {"name": "Professional, Scientific and Technical Services", "employment_share": 12.1},
        {"name": "Financial and Insurance Services", "employment_share": 8.4},
        {"name": "Construction", "employment_share": 7.9},
        {"name": "Retail Trade", "employment_share": 7.8},
    ],
    "state-vic": [
        {"name": "Health Care and Social Assistance", "employment_share": 15.0},
        {"name": "Professional, Scientific and Technical Services", "employment_share": 10.5},
        {"name": "Construction", "employment_share": 8.9},
        {"name": "Retail Trade", "employment_share": 8.8},
        {"name": "Education and Training", "employment_share": 8.4},
    ],
}


def get_node(node_id: str) -> GeographyNode:
    raw = NODE_INDEX[node_id]
    return GeographyNode.model_validate(raw)


def list_children(node_id: str) -> list[GeographyNode]:
    return [GeographyNode.model_validate(child) for child in CHILDREN_INDEX.get(node_id, [])]


def list_breadcrumb(node_id: str) -> list[GeographyNode]:
    chain: list[GeographyNode] = []
    cursor: str | None = node_id
    while cursor:
        node = get_node(cursor)
        chain.append(node)
        cursor = node.parent_id
    return list(reversed(chain))


def get_state_id(node_id: str) -> str | None:
    cursor: str | None = node_id
    while cursor:
        node = get_node(cursor)
        if node.kind.value == "state":
            return node.id
        cursor = node.parent_id
    return None


def list_occupations() -> OccupationListResponse:
    return OccupationListResponse(
        occupations=[Occupation.model_validate(occupation) for occupation in OCCUPATIONS]
    )


def get_occupation(occupation_id: str) -> Occupation:
    raw = OCCUPATION_INDEX[occupation_id]
    return Occupation.model_validate(raw)


def get_effective_view_mode(node: GeographyNode, requested: ViewMode) -> ViewMode:
    supported = node.supported_view_modes
    if requested in supported:
        return requested
    if supported:
        return supported[0]
    return ViewMode.ALL


def apply_view_mode(category: ShortageCategory, view_mode: ViewMode) -> ShortageCategory:
    if view_mode == ViewMode.METRO:
        if category == ShortageCategory.SHORTAGE:
            return ShortageCategory.METROPOLITAN_SHORTAGE
        if category == ShortageCategory.REGIONAL_SHORTAGE:
            return ShortageCategory.NO_SHORTAGE
    if view_mode == ViewMode.REGIONAL:
        if category == ShortageCategory.SHORTAGE:
            return ShortageCategory.REGIONAL_SHORTAGE
        if category == ShortageCategory.METROPOLITAN_SHORTAGE:
            return ShortageCategory.NO_SHORTAGE
    return category


def resolve_shortage_category(
    node_id: str, occupation_id: str, requested_view_mode: ViewMode
) -> tuple[ShortageCategory, ViewMode]:
    node = get_node(node_id)
    effective_mode = get_effective_view_mode(node, requested_view_mode)
    base_category = BASE_CATEGORIES.get(node_id, ShortageCategory.NO_SHORTAGE)
    category = OCCUPATION_OVERRIDES.get(occupation_id, {}).get(node_id, base_category)
    category = apply_view_mode(category, effective_mode)
    return category, effective_mode


def build_map_layer(
    focus_id: str,
    occupation_id: str,
    requested_view_mode: ViewMode,
) -> MapLayerResponse:
    focus = get_node(focus_id)
    breadcrumb = list_breadcrumb(focus_id)

    if focus.kind.value == "sa4":
        layer_parent_id = focus.parent_id or focus.id
    else:
        layer_parent_id = focus.id

    parent = get_node(layer_parent_id)
    items = []
    for node in list_children(layer_parent_id):
        category, _ = resolve_shortage_category(node.id, occupation_id, requested_view_mode)
        items.append(MapLayerItem(geography=node, shortage_category=category))

    return MapLayerResponse(
        focus=focus,
        parent=parent,
        breadcrumb=breadcrumb,
        items=items,
    )


def build_badges(
    category: ShortageCategory,
    effective_mode: ViewMode,
    visa_mode: VisaMode,
) -> list[str]:
    badges = [category.value.replace("_", " ").title(), effective_mode.value.upper()]
    if visa_mode == VisaMode.SUBCLASS_491:
        badges.append("Regional strategy")
    if visa_mode == VisaMode.SUBCLASS_190:
        badges.append("State nomination context")
    if visa_mode == VisaMode.SUBCLASS_189:
        badges.append("Independent pathway context")
    return badges


def build_migration_note(
    visa_mode: VisaMode,
    effective_mode: ViewMode,
    category: ShortageCategory,
) -> str:
    if visa_mode == VisaMode.SUBCLASS_491 and effective_mode == ViewMode.REGIONAL:
        if category in {ShortageCategory.SHORTAGE, ShortageCategory.REGIONAL_SHORTAGE}:
            return "Regional shortage evidence aligns with 491 pathway exploration."
        return "Regional view is relevant for 491, but current shortage evidence is limited."
    if visa_mode == VisaMode.SUBCLASS_190:
        return "Use this as shortage evidence and cross-check with state nomination settings."
    if visa_mode == VisaMode.SUBCLASS_189:
        return "Treat this view as demand context; 189 decisions rely more on national competitiveness."
    return "Use this shortage evidence as one migration signal alongside invitation trends."


def get_labour_market(geography_id: str) -> LabourMarketSnapshot:
    entry = LABOUR_MARKET_DATA.get(geography_id)
    if not entry:
        state_id = get_state_id(geography_id)
        entry = LABOUR_MARKET_DATA.get(state_id or "au", LABOUR_MARKET_DATA["au"])
    return LabourMarketSnapshot.model_validate(entry)


def get_industries(geography_id: str) -> list[IndustryStat]:
    rows = INDUSTRY_DATA.get(geography_id)
    if not rows:
        state_id = get_state_id(geography_id)
        rows = INDUSTRY_DATA.get(state_id or "au", INDUSTRY_DATA["au"])
    return [IndustryStat.model_validate(row) for row in rows]


def build_detail_panel(
    geography_id: str,
    occupation_id: str,
    visa_mode: VisaMode,
    requested_view_mode: ViewMode,
) -> DetailPanelResponse:
    geography = get_node(geography_id)
    occupation = get_occupation(occupation_id)
    shortage_category, effective_mode = resolve_shortage_category(
        geography_id, occupation_id, requested_view_mode
    )
    migration_note = build_migration_note(visa_mode, effective_mode, shortage_category)
    badges = build_badges(shortage_category, effective_mode, visa_mode)
    migration_evidence = MigrationEvidence(
        shortage_category=shortage_category,
        source=JSA_SOURCE,
        geography_scope=effective_mode,
        visa_context_note=migration_note,
        references=[JSA_SOURCE, SKILLSELECT_SOURCE, ABS_SOURCE],
    )
    return DetailPanelResponse(
        geography=geography,
        occupation=occupation,
        visa_mode=visa_mode,
        view_mode=effective_mode,
        badges=badges,
        migration_evidence=migration_evidence,
        labour_market=get_labour_market(geography_id),
        industries=get_industries(geography_id),
    )


def build_geography_tree() -> GeographyTreeResponse:
    nodes = [GeographyNode.model_validate(node) for node in GEOGRAPHY_NODES]
    return GeographyTreeResponse(root_id="au", nodes=nodes)
