"use client";

import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";

import {
  fetchDetailPanel,
  fetchGeographyTree,
  fetchMapLayer,
  fetchOccupations,
} from "../lib/api";
import type {
  DetailPanelResponse,
  GeographyNode,
  MapLayerResponse,
  Occupation,
  ShortageCategory,
  ViewMode,
  VisaMode,
} from "../lib/types";
import { DetailPanel } from "./detail-panel";
import { FilterBar } from "./filter-bar";
import { MapSurface } from "./map-surface";

const ALL_SHORTAGE_CATEGORIES: ShortageCategory[] = [
  "shortage",
  "regional_shortage",
  "metropolitan_shortage",
  "no_shortage",
];

function getStateIdForNode(
  node: GeographyNode | null,
  nodeIndex: Map<string, GeographyNode>,
): string {
  if (!node) return "";
  let cursor: GeographyNode | null = node;
  while (cursor) {
    if (cursor.kind === "state") return cursor.id;
    cursor = cursor.parent_id ? nodeIndex.get(cursor.parent_id) ?? null : null;
  }
  return "";
}

export function ExplorerApp() {
  const [geographyNodes, setGeographyNodes] = useState<GeographyNode[]>([]);
  const [occupations, setOccupations] = useState<Occupation[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState("au");
  const [selectedOccupationId, setSelectedOccupationId] = useState("");
  const [selectedVisaMode, setSelectedVisaMode] = useState<VisaMode>("491");
  const [selectedViewMode, setSelectedViewMode] = useState<ViewMode>("all");
  const [selectedMajorGroup, setSelectedMajorGroup] = useState("all");
  const [selectedSkillLevel, setSelectedSkillLevel] = useState("all");
  const [occupationQuery, setOccupationQuery] = useState("");
  const [selectedShortageCategories, setSelectedShortageCategories] = useState<
    ShortageCategory[]
  >(ALL_SHORTAGE_CATEGORIES);
  const [mapLayer, setMapLayer] = useState<MapLayerResponse | null>(null);
  const [panelData, setPanelData] = useState<DetailPanelResponse | null>(null);
  const [isBootLoading, setIsBootLoading] = useState(true);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [isPanelLoading, setIsPanelLoading] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [panelError, setPanelError] = useState<string | null>(null);

  const nodeIndex = useMemo(
    () => new Map(geographyNodes.map((node) => [node.id, node])),
    [geographyNodes],
  );
  const currentNode = nodeIndex.get(currentNodeId) ?? null;
  const selectedStateId = getStateIdForNode(currentNode, nodeIndex);
  const states = useMemo(
    () => geographyNodes.filter((node) => node.kind === "state"),
    [geographyNodes],
  );
  const regions = useMemo(
    () =>
      geographyNodes.filter(
        (node) => node.kind === "sa4" && node.parent_id === selectedStateId,
      ),
    [geographyNodes, selectedStateId],
  );
  const selectedRegionId = currentNode?.kind === "sa4" ? currentNode.id : "";

  const majorGroups = useMemo(
    () => Array.from(new Set(occupations.map((occupation) => occupation.major_group))),
    [occupations],
  );

  const deferredOccupationQuery = useDeferredValue(
    occupationQuery.trim().toLowerCase(),
  );
  const filteredOccupations = useMemo(() => {
    return occupations.filter((occupation) => {
      const matchesQuery =
        deferredOccupationQuery.length === 0 ||
        occupation.label.toLowerCase().includes(deferredOccupationQuery) ||
        occupation.anzsco_code.includes(deferredOccupationQuery);
      const matchesGroup =
        selectedMajorGroup === "all" || occupation.major_group === selectedMajorGroup;
      const matchesSkill =
        selectedSkillLevel === "all" ||
        String(occupation.skill_level) === selectedSkillLevel;
      return matchesQuery && matchesGroup && matchesSkill;
    });
  }, [
    occupations,
    deferredOccupationQuery,
    selectedMajorGroup,
    selectedSkillLevel,
  ]);

  useEffect(() => {
    let active = true;
    setIsBootLoading(true);
    Promise.all([fetchGeographyTree(), fetchOccupations()])
      .then(([tree, occupationResponse]) => {
        if (!active) return;
        setGeographyNodes(tree.nodes);
        setOccupations(occupationResponse.occupations);
        setCurrentNodeId(tree.root_id);
        setSelectedOccupationId(occupationResponse.occupations[0]?.id ?? "");
      })
      .finally(() => {
        if (active) setIsBootLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!currentNode || currentNode.supported_view_modes.length === 0) return;
    if (currentNode.supported_view_modes.includes(selectedViewMode)) return;
    startTransition(() => {
      setSelectedViewMode(currentNode.supported_view_modes[0] ?? "all");
    });
  }, [currentNode, selectedViewMode]);

  useEffect(() => {
    if (!selectedOccupationId || currentNodeId.length === 0) return;
    let active = true;
    setIsMapLoading(true);
    setMapError(null);
    fetchMapLayer({
      focusId: currentNodeId,
      occupationId: selectedOccupationId,
      viewMode: selectedViewMode,
    })
      .then((response) => {
        if (!active) return;
        setMapLayer(response);
      })
      .catch((error: Error) => {
        if (!active) return;
        setMapError(error.message);
      })
      .finally(() => {
        if (active) setIsMapLoading(false);
      });
    return () => {
      active = false;
    };
  }, [currentNodeId, selectedOccupationId, selectedViewMode]);

  useEffect(() => {
    if (!selectedOccupationId || currentNodeId.length === 0) return;
    let active = true;
    setIsPanelLoading(true);
    setPanelError(null);
    fetchDetailPanel({
      geographyId: currentNodeId,
      occupationId: selectedOccupationId,
      visaMode: selectedVisaMode,
      viewMode: selectedViewMode,
    })
      .then((response) => {
        if (!active) return;
        setPanelData(response);
      })
      .catch((error: Error) => {
        if (!active) return;
        setPanelError(error.message);
      })
      .finally(() => {
        if (active) setIsPanelLoading(false);
      });
    return () => {
      active = false;
    };
  }, [currentNodeId, selectedOccupationId, selectedVisaMode, selectedViewMode]);

  function toggleShortageCategory(category: ShortageCategory) {
    setSelectedShortageCategories((current) => {
      if (current.includes(category)) {
        const next = current.filter((value) => value !== category);
        return next.length === 0 ? ALL_SHORTAGE_CATEGORIES : next;
      }
      return [...current, category];
    });
  }

  const mapItems = useMemo(() => {
    const items = mapLayer?.items ?? [];
    return items.filter((item) =>
      selectedShortageCategories.includes(item.shortage_category),
    );
  }, [mapLayer, selectedShortageCategories]);

  const focusLabel = mapLayer?.focus.display_name ?? "Australia";
  const breadcrumb = mapLayer?.breadcrumb ?? [];

  const filteredOccupationOptions = filteredOccupations.length
    ? filteredOccupations
    : occupations;

  useEffect(() => {
    if (filteredOccupationOptions.length === 0) return;
    const stillAvailable = filteredOccupationOptions.some(
      (occupation) => occupation.id === selectedOccupationId,
    );
    if (stillAvailable) return;
    setSelectedOccupationId(filteredOccupationOptions[0].id);
  }, [filteredOccupationOptions, selectedOccupationId]);

  useEffect(() => {
    if (deferredOccupationQuery.length === 0) return;
    if (filteredOccupations.length === 0) return;
    const firstMatch = filteredOccupations[0];
    if (firstMatch.id === selectedOccupationId) return;
    setSelectedOccupationId(firstMatch.id);
  }, [deferredOccupationQuery, filteredOccupations, selectedOccupationId]);

  if (isBootLoading) {
    return <section className="panel">Loading foundation explorer...</section>;
  }

  return (
    <section className="workspace">
      <FilterBar
        occupationQuery={occupationQuery}
        onOccupationQueryChange={setOccupationQuery}
        occupations={filteredOccupationOptions}
        selectedOccupationId={selectedOccupationId}
        onOccupationChange={setSelectedOccupationId}
        selectedVisaMode={selectedVisaMode}
        onVisaModeChange={setSelectedVisaMode}
        selectedViewMode={selectedViewMode}
        onViewModeChange={setSelectedViewMode}
        selectedStateId={selectedStateId}
        onStateChange={(stateId) => setCurrentNodeId(stateId || "au")}
        selectedRegionId={selectedRegionId}
        onRegionChange={(regionId) => {
          setCurrentNodeId(regionId || selectedStateId || "au");
        }}
        states={states}
        regions={regions}
        selectedMajorGroup={selectedMajorGroup}
        onMajorGroupChange={setSelectedMajorGroup}
        majorGroups={majorGroups}
        selectedSkillLevel={selectedSkillLevel}
        onSkillLevelChange={setSelectedSkillLevel}
        selectedShortageCategories={selectedShortageCategories}
        onShortageCategoryToggle={toggleShortageCategory}
      />

      <div className="content-grid">
        <section className="left-pane">
          <div className="panel breadcrumb-bar">
            <div className="breadcrumb">
              {breadcrumb.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  className={node.id === currentNodeId ? "crumb active" : "crumb"}
                  onClick={() => setCurrentNodeId(node.id)}
                >
                  {node.display_name}
                </button>
              ))}
            </div>
            {currentNode?.kind !== "country" && (
              <button
                type="button"
                className="back-link"
                onClick={() => setCurrentNodeId("au")}
              >
                Back to state boundaries
              </button>
            )}
          </div>

          {mapError ? (
            <section className="panel">
              <p className="error-text">{mapError}</p>
            </section>
          ) : isMapLoading ? (
            <section className="panel">
              <p>Loading map layer...</p>
            </section>
          ) : (
            <MapSurface
              items={mapItems}
              selectedId={currentNodeId}
              focusLabel={focusLabel}
              onSelect={(nextId) => {
                startTransition(() => {
                  setCurrentNodeId(nextId);
                });
              }}
            />
          )}
        </section>

        <DetailPanel
          data={panelData}
          isLoading={isPanelLoading}
          errorMessage={panelError}
        />
      </div>
    </section>
  );
}
