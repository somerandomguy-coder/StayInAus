"use client";

import type {
  GeographyNode,
  Occupation,
  ShortageCategory,
  ViewMode,
  VisaMode,
} from "../lib/types";

const ALL_SHORTAGE_CATEGORIES: ShortageCategory[] = [
  "shortage",
  "regional_shortage",
  "metropolitan_shortage",
  "no_shortage",
];

const VISA_MODES: VisaMode[] = ["189", "190", "491"];
const VIEW_MODES: ViewMode[] = ["all", "metro", "regional"];

function formatCategory(category: ShortageCategory) {
  if (category === "shortage") return "Shortage";
  if (category === "regional_shortage") return "Regional shortage";
  if (category === "metropolitan_shortage") return "Metropolitan shortage";
  return "No shortage";
}

interface FilterBarProps {
  occupationQuery: string;
  onOccupationQueryChange: (value: string) => void;
  occupations: Occupation[];
  selectedOccupationId: string;
  onOccupationChange: (value: string) => void;
  selectedVisaMode: VisaMode;
  onVisaModeChange: (mode: VisaMode) => void;
  selectedViewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  selectedStateId: string;
  onStateChange: (stateId: string) => void;
  selectedRegionId: string;
  onRegionChange: (regionId: string) => void;
  states: GeographyNode[];
  regions: GeographyNode[];
  selectedMajorGroup: string;
  onMajorGroupChange: (value: string) => void;
  majorGroups: string[];
  selectedSkillLevel: string;
  onSkillLevelChange: (value: string) => void;
  selectedShortageCategories: ShortageCategory[];
  onShortageCategoryToggle: (category: ShortageCategory) => void;
}

export function FilterBar(props: FilterBarProps) {
  const {
    occupationQuery,
    onOccupationQueryChange,
    occupations,
    selectedOccupationId,
    onOccupationChange,
    selectedVisaMode,
    onVisaModeChange,
    selectedViewMode,
    onViewModeChange,
    selectedStateId,
    onStateChange,
    selectedRegionId,
    onRegionChange,
    states,
    regions,
    selectedMajorGroup,
    onMajorGroupChange,
    majorGroups,
    selectedSkillLevel,
    onSkillLevelChange,
    selectedShortageCategories,
    onShortageCategoryToggle,
  } = props;

  const hasStateSelection = selectedStateId.length > 0;

  return (
    <section className="panel filter-bar">
      <div className="filter-grid">
        <label className="field">
          <span>Occupation search</span>
          <input
            type="search"
            value={occupationQuery}
            placeholder="Search by occupation or ANZSCO"
            onChange={(event) => onOccupationQueryChange(event.target.value)}
          />
        </label>

        <label className="field">
          <span>Occupation</span>
          <select
            value={selectedOccupationId}
            onChange={(event) => onOccupationChange(event.target.value)}
          >
            {occupations.map((occupation) => (
              <option key={occupation.id} value={occupation.id}>
                {occupation.label} ({occupation.anzsco_code})
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Major group</span>
          <select
            value={selectedMajorGroup}
            onChange={(event) => onMajorGroupChange(event.target.value)}
          >
            <option value="all">All major groups</option>
            {majorGroups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Skill level</span>
          <select
            value={selectedSkillLevel}
            onChange={(event) => onSkillLevelChange(event.target.value)}
          >
            <option value="all">All levels</option>
            <option value="1">1 (Bachelor or higher)</option>
            <option value="2">2 (Diploma)</option>
            <option value="3">3 (Certificate III/IV)</option>
            <option value="4">4 (Certificate II/III)</option>
          </select>
        </label>

        <label className="field">
          <span>State / territory</span>
          <select
            value={selectedStateId}
            onChange={(event) => onStateChange(event.target.value)}
          >
            <option value="">All states (Australia)</option>
            {states.map((state) => (
              <option key={state.id} value={state.id}>
                {state.display_name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Region (SA4)</span>
          <select
            value={selectedRegionId}
            disabled={!hasStateSelection}
            onChange={(event) => onRegionChange(event.target.value)}
          >
            <option value="">All regions in state</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.display_name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="segmented-row">
        <div className="segment">
          <span className="segment-label">Visa mode</span>
          <div className="chip-list">
            {VISA_MODES.map((mode) => (
              <button
                key={mode}
                type="button"
                className={mode === selectedVisaMode ? "chip active" : "chip"}
                onClick={() => onVisaModeChange(mode)}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
        <div className="segment">
          <span className="segment-label">View mode</span>
          <div className="chip-list">
            {VIEW_MODES.map((mode) => (
              <button
                key={mode}
                type="button"
                className={mode === selectedViewMode ? "chip active" : "chip"}
                onClick={() => onViewModeChange(mode)}
              >
                {mode.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="segment">
        <span className="segment-label">Shortage ratings</span>
        <div className="chip-list">
          {ALL_SHORTAGE_CATEGORIES.map((category) => {
            const selected = selectedShortageCategories.includes(category);
            return (
              <button
                key={category}
                type="button"
                className={selected ? "chip active" : "chip"}
                onClick={() => onShortageCategoryToggle(category)}
              >
                {formatCategory(category)}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
