"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Search,
  SlidersHorizontal,
  Layers,
  Database,
} from "lucide-react";
import { demoParcels } from "@/lib/demo-data";
import { HudBadge, LiveRadarBeacon } from "@/components/ui/geospatial";

function StateBadge({ state }: { state: string }) {
  const styles: Record<string, string> = {
    MATCHED: "bg-success/10 text-success border-success/30",
    LIKELY_MATCH: "bg-warning/10 text-warning border-warning/30",
    REVIEW_REQUIRED: "bg-[#b87940]/10 text-[#b87940] border-[#b87940]/30",
    NOT_MATCHED: "bg-neutral/10 text-neutral-dark border-border",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${styles[state] || styles.MATCHED}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {state.replace(/_/g, " ")}
    </span>
  );
}

export default function RecordsPage() {
  const allParcels = demoParcels.features.map((f) => f.properties);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState<string>("ALL");

  const filteredParcels = allParcels.filter((p) => {
    const matchesSearch =
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.survey_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.land_use.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterState === "ALL" || p.match_state === filterState;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* HUD Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border"
      >
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <LiveRadarBeacon />
            <HudBadge variant="info">Registry Ledger v2.4</HudBadge>
            <span className="font-mono text-[10px] text-neutral">EPSG:4326 · WGS84</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Unified Land Records</h1>
          <p className="text-xs text-neutral-dark mt-0.5">
            Harmonized cadastral, satellite, and municipal parcel ledger
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border">
            <Database className="w-3.5 h-3.5 text-primary" />
            <span className="font-mono text-xs font-semibold">{filteredParcels.length}</span>
            <span className="text-[11px] text-neutral-dark">/ {allParcels.length} records</span>
          </div>
        </div>
      </motion.div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, survey #, land use, owner..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-surface-card text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:font-sans placeholder:text-neutral"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <SlidersHorizontal className="w-3.5 h-3.5 text-neutral mr-1 flex-shrink-0" />
          {[
            { key: "ALL", label: "All" },
            { key: "MATCHED", label: "Matched" },
            { key: "LIKELY_MATCH", label: "Likely" },
            { key: "REVIEW_REQUIRED", label: "Review" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterState(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap ${
                filterState === tab.key
                  ? "bg-primary text-white font-semibold"
                  : "bg-surface hover:bg-surface-card border border-border text-neutral-dark"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Records Table */}
      <div className="rounded-xl border border-border bg-surface-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-surface/60">
                <th className="px-4 py-3 font-mono text-[10px] font-semibold text-neutral-dark uppercase tracking-wider">Parcel ID</th>
                <th className="px-4 py-3 font-mono text-[10px] font-semibold text-neutral-dark uppercase tracking-wider">Survey No.</th>
                <th className="px-4 py-3 font-mono text-[10px] font-semibold text-neutral-dark uppercase tracking-wider">Area (m²)</th>
                <th className="px-4 py-3 font-mono text-[10px] font-semibold text-neutral-dark uppercase tracking-wider">Land Use</th>
                <th className="px-4 py-3 font-mono text-[10px] font-semibold text-neutral-dark uppercase tracking-wider">Owner Entity</th>
                <th className="px-4 py-3 font-mono text-[10px] font-semibold text-neutral-dark uppercase tracking-wider text-center">Confidence</th>
                <th className="px-4 py-3 font-mono text-[10px] font-semibold text-neutral-dark uppercase tracking-wider">Match Status</th>
                <th className="px-4 py-3 font-mono text-[10px] font-semibold text-neutral-dark uppercase tracking-wider text-center">Sources</th>
                <th className="px-4 py-3 font-mono text-[10px] font-semibold text-neutral-dark uppercase tracking-wider text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredParcels.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="hover:bg-primary/[0.02] transition-colors group"
                >
                  <td className="px-4 py-3 font-mono font-semibold text-primary">
                    {p.id}
                  </td>
                  <td className="px-4 py-3 font-mono text-neutral-dark">
                    {p.survey_number}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    {p.area_sqm.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-surface border border-border text-[11px] font-medium">
                      {p.land_use}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-dark max-w-[160px] truncate">
                    {p.owner_name}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-border rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            p.confidence >= 90
                              ? "bg-success"
                              : p.confidence >= 80
                              ? "bg-warning"
                              : "bg-error"
                          }`}
                          style={{ width: `${p.confidence}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] font-bold tabular-nums">
                        {p.confidence}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StateBadge state={p.match_state} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex items-center gap-1 font-mono text-[11px] text-neutral-dark bg-surface px-2 py-0.5 rounded border border-border">
                      <Layers className="w-3 h-3 text-neutral" />
                      {p.sources.length}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/records/${p.id}`}
                      className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors inline-flex items-center gap-1 group-hover:translate-x-0.5"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
