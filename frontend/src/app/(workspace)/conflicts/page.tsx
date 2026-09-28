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
    high: "bg-rose-100 text-rose-700",
    medium: "bg-amber-100 text-amber-700",
    low: "bg-slate-100 text-slate-700",
  };
  return (
    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${styles[severity]}`}>
      {severity}
    </span>
  );
}

function StateBadge({ state }: { state: DemoConflict["state"] }) {
  const styles: Record<string, string> = {
    OPEN: "bg-rose-50 text-rose-700 border border-rose-200",
    HUMAN_REVIEW: "bg-amber-50 text-amber-700 border border-amber-200",
    AUTO_RESOLVE: "bg-blue-50 text-blue-700 border border-blue-200",
    RESOLVED: "bg--[#FBF6EE] text--[#21700F] border border--[#F3E3EC]",
    IRRECONCILABLE: "bg-slate-100 text-slate-700 border border-slate-200",
  };
  return (
    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${styles[state] || styles.OPEN}`}>
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
        <h1 className="text-3xl font-extrabold text--[#860F61] mb-1">Conflict Radar</h1>
        <p className="text-sm font-medium text--[#5E0A44] mb-8">{demoConflicts.length} conflicts detected across data sources</p>
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
            className={`p-4 rounded-xl border text-center transition-all shadow-sm ${
              typeFilter === type ? "border--[#21700F] bg--[#FBF6EE] shadow-md ring-1 ring--[#21700F]/20" : "border--[#860F61]/10 bg-white hover:border--[#21700F]/30 hover:bg--[#FBF6EE]/30"
            }`}
          >
            <div className={`text-2xl font-black ${typeFilter === type ? 'text--[#21700F]' : 'text--[#860F61]'}`}>{count}</div>
            <div className={`text-xs capitalize font-bold ${typeFilter === type ? 'text--[#5E0A44]' : 'text--[#5E0A44]/70'}`}>{type}</div>
          </motion.button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text--[#5E0A44]" />
          <span className="text-xs font-bold text--[#860F61] uppercase tracking-wider">State:</span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {stateFilters.map((s) => (
            <button
              key={s}
              onClick={() => setStateFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors shadow-sm border ${
                stateFilter === s ? "bg--[#21700F] text-white border--[#21700F]" : "bg-white border--[#860F61]/10 text--[#5E0A44] hover:bg--[#FBF6EE]"
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
            className="p-5 rounded-xl border border--[#860F61]/10 bg-white hover:border--[#21700F]/30 hover:shadow-md transition-all shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span className="text-sm font-bold text--[#860F61] capitalize">{c.type} Conflict</span>
                <SeverityBadge severity={c.severity} />
                <StateBadge state={c.state} />
              </div>
              <Link
                href="/map"
                className="text-xs text--[#21700F] font-bold hover:underline flex items-center gap-1"
              >
                <MapPin className="w-3 h-3" />
                {c.parcel_id}
              </Link>
            </div>

            <p className="text-sm font-medium text--[#5E0A44] mb-3">{c.description}</p>

            <div className="flex items-center gap-3 text-xs">
              <div className="px-3 py-1.5 rounded-lg bg--[#FBF6EE]/50 border border--[#860F61]/10">
                <span className="text--[#5E0A44] font-medium">{c.source_a.name}:</span>{" "}
                <span className="font-bold text--[#860F61]">{c.source_a.value}</span>
              </div>
              <span className="text--[#21700F] font-bold">vs</span>
              <div className="px-3 py-1.5 rounded-lg bg--[#FBF6EE]/50 border border--[#860F61]/10">
                <span className="text--[#5E0A44] font-medium">{c.source_b.name}:</span>{" "}
                <span className="font-bold text--[#860F61]">{c.source_b.value}</span>
              </div>
              <div className="ml-auto px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-bold shadow-sm">
                Δ {c.difference}
              </div>
            </div>

            <div className="mt-3 text-xs font-medium text--[#21700F]">
              Created: {new Date(c.created_at).toISOString().replace("T", ", ").slice(0, 19)}
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text--[#5E0A44]">
            <Shield className="w-8 h-8 mx-auto mb-3 text--[#21700F]" />
            <p className="text-sm font-bold">No conflicts match the current filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

