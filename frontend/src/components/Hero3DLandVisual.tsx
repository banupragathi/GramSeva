"use client";

import { useState, useRef, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Compass } from "lucide-react";
import {
  demoParcels,
  demoBuildings,
  demoRoads,
  type ParcelProperties,
} from "@/lib/demo-data";

/* ------------------------------------------------------------------ */
/*  COORDINATE PROJECTION (Real GPS to Normalized Screen Coords)      */
/* ------------------------------------------------------------------ */
const MIN_LNG = 79.848;
const MAX_LNG = 79.872;
const MIN_LAT = 12.965;
const MAX_LAT = 12.982;

const VIEW_W = 380;
const VIEW_H = 270;

function project(lng: number, lat: number): [number, number] {
  const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * (VIEW_W - 40) + 20;
  const y = VIEW_H - (((lat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * (VIEW_H - 40) + 20);
  return [Number(x.toFixed(1)), Number(y.toFixed(1))];
}

function coordsToSvgPoints(coords: number[][]): string {
  return coords.map(([lng, lat]) => project(lng, lat).join(",")).join(" ");
}

/* ------------------------------------------------------------------ */
/*  HERO 3D LAND INTELLIGENCE VISUALIZATION                           */
/* ------------------------------------------------------------------ */
export default function Hero3DLandVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // 3D Parallax Tilt state
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [activeTier, setActiveTier] = useState<"all" | "harmonized" | "sources" | "cadastre">("all");
  const [hoveredParcel, setHoveredParcel] = useState<ParcelProperties | null>(null);

  // Mouse move handler for gentle 3D parallax
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (prefersReducedMotion || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      setTilt({
        x: relX * 10, // subtle natural tilt
        y: -relY * 8,
      });
    },
    [prefersReducedMotion]
  );

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setHoveredParcel(null);
  }, []);

  // Find key featured parcel TN-1042
  const featuredParcel = demoParcels.features.find((f) => f.properties.id === "TN-1042");
  const featuredCoords = featuredParcel ? featuredParcel.geometry.coordinates[0] : [];

  // Centroid for featured parcel label
  const featuredCentroid = featuredCoords.length
    ? (() => {
        let sumX = 0;
        let sumY = 0;
        featuredCoords.forEach(([lng, lat]) => {
          const [px, py] = project(lng, lat);
          sumX += px;
          sumY += py;
        });
        return [
          Number((sumX / featuredCoords.length).toFixed(1)),
          Number((sumY / featuredCoords.length).toFixed(1)),
        ];
      })()
    : [240, 180];

  // Elevation Z heights based on activeTier
  const zCadastre = activeTier === "all" ? 18 : activeTier === "cadastre" ? 36 : 8;
  const zSources = activeTier === "all" ? 44 : activeTier === "sources" ? 48 : 14;
  const zHarmonized = activeTier === "all" ? 72 : activeTier === "harmonized" ? 54 : 20;

  // Base rotation angles
  const rotateX = 54 + tilt.y;
  const rotateZ = -24 + tilt.x;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="aspect-[4/3] rounded-xl bg-gradient-to-b from-[#182319] via-[#131b14] to-[#0c120d] relative overflow-hidden select-none border border-white/10"
      style={{ perspective: "1100px" }}
    >
      {/* Aerial Terrain Texture Backdrop */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#2d4a32_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-primary/10 pointer-events-none" />

      {/* TOP HUD: 3D Layer Stack Pills */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 shadow-sm">
          <span className="px-2 py-0.5 font-mono text-[9px] font-bold text-primary tracking-wider uppercase flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            3D STACK
          </span>
          {(
            [
              { id: "all", label: "Multi-Tier" },
              { id: "harmonized", label: "Land Use" },
              { id: "sources", label: "Sources" },
              { id: "cadastre", label: "Cadastre" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTier(t.id)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                activeTier === t.id
                  ? "bg-primary text-white font-semibold shadow-xs"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/50 border border-white/10 text-[9px] font-mono text-white/70">
          <Compass className="w-3 h-3 text-primary animate-spin" style={{ animationDuration: "12s" }} />
          <span>79.85°E · 12.97°N</span>
        </div>
      </div>

      {/* 3D PERSPECTIVE SCENE CONTAINER */}
      <div
        className="w-full h-full flex items-center justify-center transition-transform duration-300 ease-out"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotateX}deg) rotateZ(${rotateZ}deg) scale(0.92)`,
        }}
      >
        {/* ========================================================== */}
        {/* TIER 0: SATELLITE BASE & GEOGRAPHIC CONTEXT (Z = 0)        */}
        {/* ========================================================== */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            transform: "translateZ(0px)",
            transformStyle: "preserve-3d",
          }}
        >
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="w-[88%] h-[88%] overflow-visible drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)]"
          >
            {/* Aerial ground terrain plane with parcel fields */}
            <rect
              x="10"
              y="10"
              width={VIEW_W - 20}
              height={VIEW_H - 20}
              rx="12"
              fill="#1b281c"
              stroke="#2e4230"
              strokeWidth="1.5"
            />

            {/* Simulated agricultural soil & canal patterns */}
            <path
              d="M20,60 Q120,45 220,70 T360,50"
              fill="none"
              stroke="#283a2a"
              strokeWidth="24"
              strokeLinecap="round"
            />
            <path
              d="M30,190 Q150,210 270,180 T350,210"
              fill="none"
              stroke="#223324"
              strokeWidth="32"
              strokeLinecap="round"
            />

            {/* Real Roads from demoRoads */}
            {demoRoads.features.map((rf, idx) => {
              /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
              const geom = rf.geometry as any;
              if (geom.type !== "LineString") return null;
              const points = geom.coordinates
                .map(([lng, lat]: [number, number]) => project(lng, lat).join(","))
                .join(" ");

              return (
                <g key={`road-${idx}`}>
                  {/* Road Casing */}
                  <polyline
                    points={points}
                    fill="none"
                    stroke="#111311"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  {/* Road Surface */}
                  <polyline
                    points={points}
                    fill="none"
                    stroke="#d4c8b6"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeOpacity="0.85"
                  />
                  {/* Road Dashed Centerline */}
                  <polyline
                    points={points}
                    fill="none"
                    stroke="#860F61"
                    strokeWidth="0.8"
                    strokeDasharray="4 3"
                    strokeOpacity="0.7"
                  />
                </g>
              );
            })}

            {/* 3D Extruded Buildings from demoBuildings */}
            {demoBuildings.features.map((bf) => {
              /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
              const geom = bf.geometry as any;
              const coords = geom.coordinates[0];
              const pts = coords
                .map(([lng, lat]: [number, number]) => project(lng, lat).join(","))
                .join(" ");

              // Simple 3D building roof isometric offset
              const roofPts = coords
                .map(([lng, lat]: [number, number]) => {
                  const [px, py] = project(lng, lat);
                  return `${px - 2},${py - 4}`;
                })
                .join(" ");

              return (
                <g key={bf.properties.id}>
                  {/* Building Base footprint */}
                  <polygon points={pts} fill="rgba(0,0,0,0.4)" />
                  {/* Building Roof */}
                  <polygon
                    points={roofPts}
                    fill="#e0d6c5"
                    stroke="#860F61"
                    strokeWidth="0.75"
                    opacity="0.95"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* ========================================================== */}
        {/* TIER 1: CADASTRAL PARCEL SURVEY BOUNDARIES                 */}
        {/* ========================================================== */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-out"
          style={{
            transform: `translateZ(${zCadastre}px)`,
            transformStyle: "preserve-3d",
          }}
        >
          <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-[88%] h-[88%] overflow-visible">
            {demoParcels.features.map((pf) => {
              const coords = pf.geometry.coordinates[0];
              const pts = coordsToSvgPoints(coords);
              const isSelected = pf.properties.id === "TN-1042";
              const isHover = hoveredParcel?.id === pf.properties.id;

              return (
                <g
                  key={`cadastre-${pf.properties.id}`}
                  className="cursor-pointer pointer-events-auto"
                  onMouseEnter={() => setHoveredParcel(pf.properties)}
                  onMouseLeave={() => setHoveredParcel(null)}
                >
                  {/* Cadastral Polygon Fill */}
                  <polygon
                    points={pts}
                    fill={
                      isSelected
                        ? "rgba(134, 15, 97, 0.22)"
                        : isHover
                        ? "rgba(134, 15, 97, 0.35)"
                        : pf.properties.has_conflict
                        ? "rgba(184, 64, 64, 0.14)"
                        : "rgba(244, 233, 216, 0.05)"
                    }
                    stroke={
                      isSelected
                        ? "#F4E9D8"
                        : pf.properties.has_conflict
                        ? "#b84040"
                        : pf.properties.match_state === "MATCHED"
                        ? "#860F61"
                        : "#c0862e"
                    }
                    strokeWidth={isSelected ? "2.2" : isHover ? "1.8" : "1.2"}
                    strokeDasharray={pf.properties.has_conflict ? "4 2" : "none"}
                    className="transition-colors duration-200"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* ========================================================== */}
        {/* TIER 2: MULTI-SOURCE RECORDS LAYER (Floating Elevated)     */}
        {/* ========================================================== */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out ${
            activeTier === "cadastre" ? "opacity-25" : "opacity-90"
          }`}
          style={{
            transform: `translateZ(${zSources}px)`,
            transformStyle: "preserve-3d",
          }}
        >
          <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-[88%] h-[88%] overflow-visible pointer-events-none">
            {demoParcels.features.map((pf) => {
              const coords = pf.geometry.coordinates[0];
              const pts = coordsToSvgPoints(coords);
              const isFeatured = pf.properties.id === "TN-1042";

              return (
                <polygon
                  key={`source-${pf.properties.id}`}
                  points={pts}
                  fill={isFeatured ? "rgba(74, 127, 181, 0.22)" : "rgba(74, 127, 181, 0.08)"}
                  stroke="#4a7fb5"
                  strokeWidth={isFeatured ? "1.5" : "0.9"}
                  strokeOpacity={isFeatured ? "0.9" : "0.5"}
                  strokeDasharray="5 3"
                />
              );
            })}
          </svg>
        </div>

        {/* ========================================================== */}
        {/* TIER 3: HARMONIZED LAND USE LAYER (Top Floating Tier)      */}
        {/* ========================================================== */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out ${
            activeTier === "sources" || activeTier === "cadastre" ? "opacity-30" : "opacity-100"
          }`}
          style={{
            transform: `translateZ(${zHarmonized}px)`,
            transformStyle: "preserve-3d",
          }}
        >
          <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-[88%] h-[88%] overflow-visible pointer-events-none">
            {demoParcels.features.map((pf) => {
              const coords = pf.geometry.coordinates[0];
              const pts = coordsToSvgPoints(coords);
              const isFeatured = pf.properties.id === "TN-1042";

              // Color token based on land use
              const landUseColor =
                pf.properties.land_use === "Agricultural"
                  ? "#2d8a56"
                  : pf.properties.land_use === "Commercial"
                  ? "#c0862e"
                  : pf.properties.land_use === "Residential"
                  ? "#860F61"
                  : "#4a7fb5";

              return (
                <g key={`harmonized-${pf.properties.id}`}>
                  <polygon
                    points={pts}
                    fill={landUseColor}
                    fillOpacity={isFeatured ? 0.38 : 0.18}
                    stroke={landUseColor}
                    strokeWidth={isFeatured ? "2.2" : "1.2"}
                    strokeOpacity={isFeatured ? 1 : 0.75}
                  />

                  {/* Corner Vertices Highlights */}
                  {isFeatured &&
                    coords.slice(0, 4).map(([lng, lat], ci) => {
                      const [cx, cy] = project(lng, lat);
                      return (
                        <circle
                          key={`vertex-${ci}`}
                          cx={cx}
                          cy={cy}
                          r="2.5"
                          fill="#ffffff"
                          stroke="#860F61"
                          strokeWidth="1.5"
                        />
                      );
                    })}
                </g>
              );
            })}
          </svg>
        </div>

        {/* ========================================================== */}
        {/* VERTICAL SPATIAL PROJECTORS & CONNECTING CORNER RAYS       */}
        {/* (Draws vertical dashed rays connecting Tier 0 to Tier 3)   */}
        {/* ========================================================== */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ transformStyle: "preserve-3d" }}
        >
          {featuredCoords.slice(0, 4).map(([lng, lat], vi) => {
            const [vx, vy] = project(lng, lat);
            return (
              <div
                key={`pillar-${vi}`}
                className="absolute"
                style={{
                  left: `${(vx / VIEW_W) * 88 + 6}%`,
                  top: `${(vy / VIEW_H) * 88 + 6}%`,
                  width: "1px",
                  height: `${zHarmonized}px`,
                  transformOrigin: "bottom center",
                  transform: "rotateX(-90deg)",
                  background:
                    "linear-gradient(to top, rgba(134,15,97,0.2), rgba(244,233,216,0.8), #860F61)",
                  boxShadow: "0 0 4px rgba(134,15,97,0.5)",
                }}
              />
            );
          })}
        </div>

        {/* ========================================================== */}
        {/* FLOATING 3D HUD PIN & LABEL OVER FEATURED PARCEL           */}
        {/* ========================================================== */}
        <div
          className="absolute pointer-events-none transition-all duration-300"
          style={{
            left: `${(featuredCentroid[0] / VIEW_W) * 88 + 2}%`,
            top: `${(featuredCentroid[1] / VIEW_H) * 88 - 8}%`,
            transform: `translateZ(${zHarmonized + 14}px) rotateZ(${
              -rotateZ
            }deg) rotateX(${-rotateX}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          <div className="px-2.5 py-1.5 rounded-lg bg-black/85 backdrop-blur-md border border-primary/50 shadow-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold text-white tracking-wide">
                  TN-1042
                </span>
                <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-primary/20 text-primary-light font-semibold border border-primary/30">
                  94% MATCH
                </span>
              </div>
              <span className="text-[8px] font-mono text-white/70">
                Residential · 1,200 m²
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* HOVER TOOLTIP CARD (When user hovers any parcel)           */}
      {/* ========================================================== */}
      {hoveredParcel && hoveredParcel.id !== "TN-1042" && (
        <div className="absolute top-12 left-3 z-30 pointer-events-none">
          <div className="px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/20 shadow-lg text-[10px] font-mono text-white flex items-center gap-2">
            <span className="font-bold text-primary">{hoveredParcel.id}</span>
            <span className="text-white/60">·</span>
            <span>{hoveredParcel.land_use}</span>
            <span className="text-white/60">·</span>
            <span>{hoveredParcel.area_sqm.toLocaleString()} m²</span>
            {hoveredParcel.has_conflict && (
              <span className="px-1 py-0.2 rounded bg-error/20 text-error border border-error/30 text-[9px] font-bold">
                CONFLICT
              </span>
            )}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* BOTTOM STATUS BAR (Preserving existing metrics)            */}
      {/* "4 sources harmonized • 94% confidence"                    */}
      {/* ========================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="absolute bottom-3 left-3 right-3 z-30 flex items-center justify-between px-3 py-2 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 shadow-lg"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success pulse-status" />
          <span className="text-xs text-white/90 font-medium">
            4 sources harmonized • 94% confidence
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[9px] text-white/60">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="hidden sm:inline">3D Spatial Depth</span>
        </div>
      </motion.div>
    </div>
  );
}
