"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  AlertTriangle,
  MapPin,
  Filter,
  ShieldAlert,
} from "lucide-react";
import { demoConflicts, type DemoConflict } from "@/lib/demo-data";
import { HudBadge, LiveRadarBeacon } from "@/components/ui/geospatial";

type TypeFilter = "all" | "boundary" | "area" | "attribute" | "temporal" | "topology";
const stateFilters = ["all", "OPEN", "HUMAN_REVIEW", "AUTO_RESOLVE", "RESOLVED", "IRRECONCILABLE"] as const;

function SeverityBadge({ severity }: { severity: DemoConflict["severity"] }) {
  const styles = {
    high: "bg-error/15 text-error border-error/30",
    medium: "bg-warning/15 text-warning border-warning/30",
    low: "bg-neutral/10 text-neutral-dark border-border",
  };
  return (
    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${styles[severity]}`}>
      {severity}
    </span>
  );
}

function StateBadge({ state }: { state: DemoConflict["state"] }) {
  const styles: Record<string, string> = {
    OPEN: "bg-error/10 text-error border-error/30",
    HUMAN_REVIEW: "bg-warning/10 text-warning border-warning/30",
    AUTO_RESOLVE: "bg-info/10 text-info border-info/30",
    RESOLVED: "bg-success/10 text-success border-success/30",
    IRRECONCILABLE: "bg-neutral/10 text-neutral-dark border-border",
  };
  return (
    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${styles[state] || styles.OPEN}`}>
      {state.replace("_", " ")}
    </span>
  );
}

export default function ConflictsPage() {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [stateFilter, setStateFilter] = useState<typeof stateFilters[number]>("all");

  const filtered = demoConflicts.filter((c) => {
    if (typeFilter !== "all" && c.type !== typeFilter) return false;
    if (stateFilter !== "all" && c.state !== stateFilter) return false;
    return true;
  });

  const counts = {
    boundary: demoConflicts.filter((c) => c.type === "boundary").length,
    area: demoConflicts.filter((c) => c.type === "area").length,
    attribute: demoConflicts.filter((c) => c.type === "attribute").length,
    temporal: demoConflicts.filter((c) => c.type === "temporal").length,
    topology: demoConflicts.filter((c) => c.type === "topology").length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border"
      >
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <LiveRadarBeacon />
            <HudBadge variant="error">Anomaly Radar</HudBadge>
            <span className="font-mono text-[10px] text-neutral">Spatial Integrity Engine</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Geospatial Conflict Radar</h1>
          <p className="text-xs text-neutral-dark mt-0.5">
            {demoConflicts.length} active discrepancies detected across cadastral and sensor data layers
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-error/5 border border-error/20 self-start sm:self-auto">
          <ShieldAlert className="w-4 h-4 text-error" />
          <span className="font-mono text-xs font-bold text-error">{filtered.length} Active</span>
        </div>
      </motion.div>

      {/* Summary count cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {Object.entries(counts).map(([type, count], i) => (
          <motion.button
            key={type}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => setTypeFilter(typeFilter === type ? "all" : (type as TypeFilter))}
            className={`p-4 rounded-xl border text-left transition-all ${
              typeFilter === type
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-surface-card hover:border-primary/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase text-neutral-dark tracking-wider">{type}</span>
              {count > 0 && <span className="w-1.5 h-1.5 rounded-full bg-warning" />}
            </div>
            <div className="text-2xl font-bold font-mono text-foreground mt-1">{count}</div>
          </motion.button>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-dark flex-shrink-0">
          <Filter className="w-3.5 h-3.5" />
          <span>Status:</span>
        </div>
        <div className="flex gap-1.5">
          {stateFilters.map((s) => (
            <button
              key={s}
              onClick={() => setStateFilter(s)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors whitespace-nowrap ${
                stateFilter === s
                  ? "bg-primary text-white font-semibold"
                  : "bg-surface border border-border text-neutral-dark hover:bg-surface-card"
              }`}
            >
              {s === "all" ? "All" : s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Conflict List */}
      <div className="space-y-3">
        {filtered.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="p-5 rounded-xl border border-border bg-surface-card shadow-sm hover:border-primary/30 transition-all space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-error" />
                <span className="text-xs font-bold capitalize">{c.type} Discrepancy</span>
                <SeverityBadge severity={c.severity} />
                <StateBadge state={c.state} />
              </div>
              <Link
                href={`/records/${c.parcel_id}`}
                className="font-mono text-xs text-primary hover:underline flex items-center gap-1 bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/20"
              >
                <MapPin className="w-3 h-3" />
                <span>{c.parcel_id}</span>
              </Link>
            </div>

            <p className="text-xs text-neutral-dark leading-relaxed">{c.description}</p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1 font-mono text-xs">
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-lg bg-surface border border-border">
                  <span className="text-neutral-dark">{c.source_a.name}:</span>{" "}
                  <span className="font-semibold text-foreground">{c.source_a.value}</span>
                </div>
                <span className="text-neutral font-medium">vs</span>
                <div className="px-3 py-1.5 rounded-lg bg-surface border border-border">
                  <span className="text-neutral-dark">{c.source_b.name}:</span>{" "}
                  <span className="font-semibold text-foreground">{c.source_b.value}</span>
                </div>
              </div>

              <div className="sm:ml-auto px-3 py-1 rounded-lg bg-error/10 border border-error/20 text-error font-semibold text-xs">
                Δ {c.difference}
              </div>
            </div>

            <div className="text-[10px] font-mono text-neutral pt-2 border-t border-border flex items-center justify-between">
              <span>Timestamp: {new Date(c.created_at).toISOString().replace("T", ", ").slice(0, 19)}</span>
              <span>Resolution: {c.state === "OPEN" ? "Awaiting Reviewer Action" : "In Progress"}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
