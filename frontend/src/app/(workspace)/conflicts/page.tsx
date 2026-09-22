"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Shield,
  AlertTriangle,
  MapPin,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { demoConflicts, type DemoConflict } from "@/lib/demo-data";

const typeFilters = ["all", "boundary", "area", "attribute", "temporal", "topology"] as const;
const stateFilters = ["all", "OPEN", "HUMAN_REVIEW", "AUTO_RESOLVE", "RESOLVED", "IRRECONCILABLE"] as const;

function SeverityBadge({ severity }: { severity: DemoConflict["severity"] }) {
  const styles = {
    high: "bg-error/15 text-error",
    medium: "bg-warning/15 text-warning",
    low: "bg-neutral-light text-neutral-dark",
  };
  return (
    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${styles[severity]}`}>
      {severity}
    </span>
  );
}

function StateBadge({ state }: { state: DemoConflict["state"] }) {
  const styles: Record<string, string> = {
    OPEN: "bg-error/10 text-error",
    HUMAN_REVIEW: "bg-warning/10 text-warning",
    AUTO_RESOLVE: "bg-info/10 text-info",
    RESOLVED: "bg-success/10 text-success",
    IRRECONCILABLE: "bg-neutral-light text-neutral-dark",
  };
  return (
    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${styles[state] || styles.OPEN}`}>
      {state.replace("_", " ")}
    </span>
  );
}

export default function ConflictsPage() {
  const [typeFilter, setTypeFilter] = useState<typeof typeFilters[number]>("all");
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
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-1">Conflict Radar</h1>
        <p className="text-sm text-neutral-dark mb-8">{demoConflicts.length} conflicts detected across data sources</p>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {Object.entries(counts).map(([type, count], i) => (
          <motion.button
            key={type}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setTypeFilter(typeFilter === type ? "all" : type as any)}
            className={`p-4 rounded-xl border text-center transition-all ${
              typeFilter === type ? "border-primary bg-primary/5" : "border-border bg-surface-card hover:border-primary/20"
            }`}
          >
            <div className="text-2xl font-bold">{count}</div>
            <div className="text-xs text-neutral-dark capitalize font-medium">{type}</div>
          </motion.button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-neutral-dark" />
          <span className="text-xs font-semibold text-neutral-dark uppercase tracking-wider">State:</span>
        </div>
        <div className="flex gap-1.5">
          {stateFilters.map((s) => (
            <button
              key={s}
              onClick={() => setStateFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                stateFilter === s ? "bg-primary text-white" : "bg-surface border border-border hover:bg-primary/5"
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
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="p-5 rounded-xl border border-border bg-surface-card hover:border-primary/20 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-error" />
                <span className="text-sm font-semibold capitalize">{c.type} Conflict</span>
                <SeverityBadge severity={c.severity} />
                <StateBadge state={c.state} />
              </div>
              <Link
                href="/map"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <MapPin className="w-3 h-3" />
                {c.parcel_id}
              </Link>
            </div>

            <p className="text-sm text-neutral-dark mb-3">{c.description}</p>

            <div className="flex items-center gap-3 text-xs">
              <div className="px-3 py-1.5 rounded-lg bg-surface border border-border">
                <span className="text-neutral-dark">{c.source_a.name}:</span>{" "}
                <span className="font-semibold">{c.source_a.value}</span>
              </div>
              <span className="text-neutral font-medium">vs</span>
              <div className="px-3 py-1.5 rounded-lg bg-surface border border-border">
                <span className="text-neutral-dark">{c.source_b.name}:</span>{" "}
                <span className="font-semibold">{c.source_b.value}</span>
              </div>
              <div className="ml-auto px-3 py-1.5 rounded-lg bg-error/5 border border-error/15 text-error font-semibold">
                Δ {c.difference}
              </div>
            </div>

            <div className="mt-3 text-xs text-neutral">
              Created: {new Date(c.created_at).toISOString().replace("T", ", ").slice(0, 19)}
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-neutral-dark">
            <Shield className="w-8 h-8 mx-auto mb-3 text-neutral" />
            <p className="text-sm font-medium">No conflicts match the current filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
