"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  X,
  Layers,
  ChevronRight,
  Eye,
  EyeOff,
  MapPin,
  Building2,
  TreePine,
  Shield,
  Clock,
  BarChart3,
  ExternalLink,
  Maximize2,
  Minus,
  Plus,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import {
  demoParcels,
  demoBuildings,
  demoRoads,
  demoMatchEvidence,
  demoConflicts,
  type ParcelProperties,
  type MatchEvidence,
} from "@/lib/demo-data";

/* ------------------------------------------------------------------ */
/*  CONFIDENCE BAR                                                      */
/* ------------------------------------------------------------------ */
function ConfidenceBar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 90 ? "bg-success" : value >= 80 ? "bg-warning" : value >= 70 ? "bg-[#b87940]" : "bg-error";

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-neutral-dark w-28 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      <span className="text-xs font-semibold w-8 text-right">{value}%</span>
    </div>
  );
}

/* ================================================================== */
/*  MAP WORKSPACE                                                       */
/* ================================================================== */
export default function MapWorkspace() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState<ParcelProperties | null>(null);
  const [layerPanel, setLayerPanel] = useState(false);
  const [layers, setLayers] = useState({
    parcels: true,
    buildings: true,
    roads: true,
    conflicts: true,
    confidence: false,
    satellite: false,
  });

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const BASE_LNG = 79.85;
    const BASE_LAT = 12.97;

    const m = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [
          {
            id: "osm-tiles",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [BASE_LNG + 0.008, BASE_LAT + 0.002],
      zoom: 15,
      maxZoom: 20,
      minZoom: 10,
    });

    m.addControl(new maplibregl.NavigationControl(), "bottom-right");

    m.on("load", () => {
      // Add parcels source
      m.addSource("parcels", {
        type: "geojson",
        data: demoParcels as any,
      });

      // Parcel fill
      m.addLayer({
        id: "parcels-fill",
        type: "fill",
        source: "parcels",
        paint: {
          "fill-color": [
            "case",
            ["get", "has_conflict"],
            "rgba(184, 64, 64, 0.15)",
            [
              "match",
              ["get", "match_state"],
              "MATCHED", "rgba(134, 15, 97, 0.12)",
              "LIKELY_MATCH", "rgba(192, 134, 46, 0.15)",
              "REVIEW_REQUIRED", "rgba(184, 121, 64, 0.2)",
              "rgba(169, 172, 173, 0.1)",
            ],
          ],
          "fill-opacity": 0.8,
        },
      });

      // Parcel outline
      m.addLayer({
        id: "parcels-outline",
        type: "line",
        source: "parcels",
        paint: {
          "line-color": [
            "case",
            ["get", "has_conflict"],
            "#b84040",
            [
              "match",
              ["get", "match_state"],
              "MATCHED", "#860F61",
              "LIKELY_MATCH", "#c0862e",
              "REVIEW_REQUIRED", "#b87940",
              "#A9ACAD",
            ],
          ],
          "line-width": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            3,
            1.5,
          ],
          "line-opacity": 0.9,
        },
      });

      // Parcel labels
      m.addLayer({
        id: "parcels-labels",
        type: "symbol",
        source: "parcels",
        layout: {
          "text-field": ["get", "id"],
          "text-size": 10,
          "text-anchor": "center",
          "text-allow-overlap": false,
        },
        paint: {
          "text-color": "#1a1a1e",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1.5,
        },
        minzoom: 15,
      });

      // Buildings source
      m.addSource("buildings", {
        type: "geojson",
        data: demoBuildings as any,
      });

      m.addLayer({
        id: "buildings-fill",
        type: "fill",
        source: "buildings",
        paint: {
          "fill-color": "rgba(134, 15, 97, 0.25)",
          "fill-opacity": 0.9,
        },
      });

      m.addLayer({
        id: "buildings-outline",
        type: "line",
        source: "buildings",
        paint: {
          "line-color": "#860F61",
          "line-width": 1,
          "line-opacity": 0.7,
        },
      });

      // Roads source
      m.addSource("roads", {
        type: "geojson",
        data: demoRoads as any,
      });

      m.addLayer({
        id: "roads-line",
        type: "line",
        source: "roads",
        paint: {
          "line-color": "#F4E9D8",
          "line-width": [
            "match",
            ["get", "type"],
            "secondary", 4,
            "tertiary", 3,
            2,
          ],
          "line-opacity": 0.8,
        },
      });

      // Click handler for parcels
      m.on("click", "parcels-fill", (e) => {
        if (e.features && e.features.length > 0) {
          const props = e.features[0].properties as any;
          // Parse sources arrays from JSON strings
          const parsed: ParcelProperties = {
            ...props,
            sources: typeof props.sources === "string" ? JSON.parse(props.sources) : props.sources,
            conflict_types: typeof props.conflict_types === "string" ? JSON.parse(props.conflict_types) : props.conflict_types,
            change_types: typeof props.change_types === "string" ? JSON.parse(props.change_types) : props.change_types,
          };
          setSelectedParcel(parsed);

          // Fly to parcel
          const coords = (e.features[0].geometry as any).coordinates[0];
          const bounds = coords.reduce(
            (b: any, c: number[]) => b.extend(c),
            new maplibregl.LngLatBounds(coords[0], coords[0])
          );
          m.fitBounds(bounds, { padding: 100, duration: 1200, maxZoom: 17 });
        }
      });

      // Hover effects
      m.on("mouseenter", "parcels-fill", () => {
        m.getCanvas().style.cursor = "pointer";
      });
      m.on("mouseleave", "parcels-fill", () => {
        m.getCanvas().style.cursor = "";
      });

      setMapLoaded(true);
    });

    map.current = m;

    return () => {
      m.remove();
      map.current = null;
    };
  }, []);

  // Toggle layers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    const m = map.current;

    const toggleLayerVisibility = (ids: string[], visible: boolean) => {
      ids.forEach((id) => {
        if (m.getLayer(id)) {
          m.setLayoutProperty(id, "visibility", visible ? "visible" : "none");
        }
      });
    };

    toggleLayerVisibility(["parcels-fill", "parcels-outline", "parcels-labels"], layers.parcels);
    toggleLayerVisibility(["buildings-fill", "buildings-outline"], layers.buildings);
    toggleLayerVisibility(["roads-line"], layers.roads);

    // Dynamic Paint Overrides based on toggles
    if (m.getLayer("parcels-fill")) {
      m.setPaintProperty("parcels-fill", "fill-color", [
        "case",
        ["all", ["get", "has_conflict"], ["boolean", layers.conflicts, true]],
        "rgba(184, 64, 64, 0.25)",
        ["all", ["has", "confidence"], ["boolean", layers.confidence, true]],
        [
          "interpolate",
          ["linear"],
          ["get", "confidence"],
          0, "rgba(255,0,0,0.2)",
          50, "rgba(255,165,0,0.2)",
          100, "rgba(0,128,0,0.2)"
        ],
        [
          "match",
          ["get", "match_state"],
          "MATCHED", "rgba(134, 15, 97, 0.12)",
          "LIKELY_MATCH", "rgba(192, 134, 46, 0.15)",
          "REVIEW_REQUIRED", "rgba(184, 121, 64, 0.2)",
          "rgba(169, 172, 173, 0.1)",
        ]
      ]);
    }
  }, [layers, mapLoaded]);

  const matchEvidence = selectedParcel
    ? demoMatchEvidence[selectedParcel.id] || null
    : null;

  const parcelConflicts = selectedParcel
    ? demoConflicts.filter((c) => c.parcel_id === selectedParcel.id)
    : [];

  return (
    <div className="h-full flex relative w-full overflow-hidden">
      {/* ========== MAP ========== */}
      <div className="flex-1 relative h-full w-full">
        <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

        {/* Map controls overlay */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <button
            onClick={() => setLayerPanel(!layerPanel)}
            className="p-2.5 rounded-lg bg-surface-card border border-border shadow-md hover:shadow-lg transition-shadow"
            title="Layer Manager"
          >
            <Layers className="w-4 h-4 text-foreground/70" />
          </button>
        </div>

        {/* Layer Panel */}
        <AnimatePresence>
          {layerPanel && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-4 left-14 z-10 w-56 rounded-xl bg-surface-card border border-border shadow-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Layers</h3>
                <button onClick={() => setLayerPanel(false)}>
                  <X className="w-3.5 h-3.5 text-neutral" />
                </button>
              </div>
              <div className="space-y-2">
                {[
                  { key: "parcels", label: "Parcels", icon: MapPin },
                  { key: "buildings", label: "Buildings", icon: Building2 },
                  { key: "roads", label: "Roads", icon: Compass },
                  { key: "conflicts", label: "Conflicts", icon: Shield },
                  { key: "confidence", label: "Confidence", icon: BarChart3 },
                ].map((layer) => (
                  <label
                    key={layer.key}
                    className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-surface transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={layers[layer.key as keyof typeof layers]}
                      onChange={(e) => setLayers((prev) => ({ ...prev, [layer.key]: e.target.checked }))}
                      className="w-3.5 h-3.5 rounded accent-primary"
                    />
                    <layer.icon className="w-3.5 h-3.5 text-neutral-dark" />
                    <span className="text-xs font-medium">{layer.label}</span>
                  </label>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map loading skeleton */}
        {!mapLoaded && (
          <div className="absolute inset-0 bg-surface flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-3 mx-auto" />
              <span className="text-sm text-neutral-dark font-medium">Loading geospatial mapping engine...</span>
            </div>
          </div>
        )}
      </div>

      {/* ========== RIGHT INTELLIGENCE PANEL ========== */}
      <AnimatePresence>
        {selectedParcel && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 380, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-l border-border bg-surface-card overflow-y-auto flex-shrink-0"
          >
            <div className="p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold">PARCEL {selectedParcel.id}</h2>
                  <p className="text-xs text-neutral-dark mt-0.5">{selectedParcel.survey_number}</p>
                </div>
                <button
                  onClick={() => setSelectedParcel(null)}
                  className="p-1.5 rounded-lg hover:bg-surface transition-colors"
                >
                  <X className="w-4 h-4 text-neutral-dark" />
                </button>
              </div>

              {/* Basic Info */}
              <div className="space-y-2 mb-5">
                {[
                  { label: "Survey Number", value: selectedParcel.survey_number },
                  { label: "Area", value: `${selectedParcel.area_sqm} sq.m` },
                  { label: "Land Use", value: selectedParcel.land_use },
                  { label: "Buildings", value: `${selectedParcel.building_count} (${selectedParcel.building_area_sqm} sq.m)` },
                  { label: "Owner", value: selectedParcel.owner_name },
                  { label: "Sources", value: selectedParcel.sources.join(", ") },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <span className="text-neutral-dark">{item.label}</span>
                    <span className="font-medium text-right max-w-[180px] truncate">{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Confidence */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/15 mb-5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">Confidence</span>
                  <span className="text-2xl font-bold text-primary">{selectedParcel.confidence}%</span>
                </div>
                <div className="text-xs text-neutral-dark">
                  {selectedParcel.match_state.replace("_", " ")}
                </div>
              </div>

              {/* Match Evidence */}
              {matchEvidence && (
                <div className="mb-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-dark mb-3">Match Evidence</h3>
                  <div className="space-y-2.5">
                    <ConfidenceBar label="Spatial Match" value={matchEvidence.spatial_match} />
                    <ConfidenceBar label="Geometry Match" value={matchEvidence.geometry_match} />
                    <ConfidenceBar label="Visual Match" value={matchEvidence.visual_match} />
                    <ConfidenceBar label="Attribute Match" value={matchEvidence.attribute_match} />
                    <ConfidenceBar label="Temporal" value={matchEvidence.temporal_consistency} />
                  </div>

                  {/* Why this match? */}
                  <div className="mt-4 p-3 rounded-lg bg-surface border border-border">
                    <h4 className="text-xs font-semibold mb-2">Why This Match?</h4>
                    <div className="space-y-1.5">
                      {matchEvidence.reasons.map((r, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-neutral-dark">
                          <CheckCircle2 className="w-3 h-3 text-success mt-0.5 flex-shrink-0" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Conflicts */}
              {parcelConflicts.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-dark mb-3">
                    Conflicts ({parcelConflicts.length})
                  </h3>
                  <div className="space-y-2">
                    {parcelConflicts.map((c) => (
                      <div
                        key={c.id}
                        className="p-3 rounded-lg border border-error/20 bg-error/5"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <AlertTriangle className="w-3 h-3 text-error" />
                          <span className="text-xs font-semibold capitalize">{c.type} Conflict</span>
                          <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full ${
                            c.severity === "high" ? "bg-error/15 text-error" :
                            c.severity === "medium" ? "bg-warning/15 text-warning" :
                            "bg-neutral-light text-neutral-dark"
                          }`}>
                            {c.severity}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-dark mb-2">{c.description}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="px-2 py-0.5 rounded bg-surface border border-border font-medium">
                            {c.source_a.name}: {c.source_a.value}
                          </span>
                          <span className="text-neutral">vs</span>
                          <span className="px-2 py-0.5 rounded bg-surface border border-border font-medium">
                            {c.source_b.name}: {c.source_b.value}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sources */}
              <div className="mb-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-dark mb-3">Sources</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedParcel.sources.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 rounded-full bg-secondary/60 border border-secondary-dark/30 text-xs font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Last Updated */}
              <div className="text-xs text-neutral text-center pt-3 border-t border-border">
                Last updated: {selectedParcel.last_updated}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
