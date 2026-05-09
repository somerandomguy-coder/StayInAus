export type GeographyKind = "country" | "state" | "sa4";
export type ViewMode = "all" | "metro" | "regional";
export type ShortageCategory =
  | "shortage"
  | "regional_shortage"
  | "metropolitan_shortage"
  | "no_shortage";
export type VisaMode = "189" | "190" | "491";

export interface SourceReference {
  title: string;
  url: string;
  last_updated: string;
}

export interface GeographyNode {
  id: string;
  parent_id: string | null;
  kind: GeographyKind;
  code: string;
  canonical_name: string;
  display_name: string;
  supported_view_modes: ViewMode[];
  has_children: boolean;
}

export interface GeographyTreeResponse {
  root_id: string;
  nodes: GeographyNode[];
}

export interface Occupation {
  id: string;
  label: string;
  anzsco_code: string;
  major_group: string;
  skill_level: number;
}

export interface OccupationListResponse {
  occupations: Occupation[];
}

export interface MapLayerItem {
  geography: GeographyNode;
  shortage_category: ShortageCategory;
}

export interface MapLayerResponse {
  focus: GeographyNode;
  parent: GeographyNode | null;
  breadcrumb: GeographyNode[];
  items: MapLayerItem[];
}

export interface MigrationEvidence {
  shortage_category: ShortageCategory;
  source: SourceReference;
  geography_scope: ViewMode;
  visa_context_note: string;
  references: SourceReference[];
}

export interface LabourMarketSnapshot {
  population: number;
  employment: number;
  unemployment_rate: number;
}

export interface IndustryStat {
  name: string;
  employment_share: number;
}

export type FitTier = "strong" | "moderate" | "weak";

export interface RegionFitScore {
  score: number;
  tier: FitTier;
  method: string;
  components: Record<string, number>;
}

export interface DetailPanelResponse {
  geography: GeographyNode;
  occupation: Occupation;
  visa_mode: VisaMode;
  view_mode: ViewMode;
  badges: string[];
  migration_evidence: MigrationEvidence;
  labour_market: LabourMarketSnapshot;
  industries: IndustryStat[];
  ranking: RegionFitScore;
}
