"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileText,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  MapPin,
  Shield,
  Eye,
} from "lucide-react";
import { demoParcels } from "@/lib/demo-data";

function ConfidenceDot({ value }: { value: number }) {
  const color = value >= 90 ? "bg-success" : value >= 80 ? "bg-warning" : value >= 70 ? "bg-[#b87940]" : "bg-error";
  return <div className={`w-2 h-2 rounded-full ${color}`} title={`${value}% confidence`} />;
}

function StateBadge({ state }: { state: string }) {
  const styles: Record<string, string> = {
    MATCHED: "bg-success/15 text-success",
    LIKELY_MATCH: "bg-warning/15 text-warning",
    REVIEW_REQUIRED: "bg-[#b87940]/15 text-[#b87940]",
    NOT_MATCHED: "bg-neutral-light text-neutral-dark",
  };
  return (
    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${styles[state] || styles.MATCHED}`}>
      {state.replace(/_/g, " ")}
    </span>
  );
}

export default function RecordsPage() {
  const parcels = demoParcels.features.map((f) => f.properties);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-1">Unified Land Records</h1>
        <p className="text-sm text-neutral-dark mb-8">{parcels.length} parcels in harmonized registry</p>
      </motion.div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral" />
        <input
          type="text"
          placeholder="Search by ID, survey number, or owner..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-surface-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
        />
      </div>

      {/* Records Table */}
      <div className="rounded-xl border border-border bg-surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-dark uppercase tracking-wider">Parcel</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-dark uppercase tracking-wider">Survey No.</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-dark uppercase tracking-wider">Area</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-dark uppercase tracking-wider">Land Use</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-dark uppercase tracking-wider">Owner</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-neutral-dark uppercase tracking-wider">Confidence</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-dark uppercase tracking-wider">State</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-neutral-dark uppercase tracking-wider">Sources</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {parcels.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border last:border-0 hover:bg-surface/30 transition-colors"
                >
                  <td className="px-5 py-3 font-semibold">{p.id}</td>
                  <td className="px-5 py-3 text-neutral-dark">{p.survey_number}</td>
                  <td className="px-5 py-3">{p.area_sqm} sq.m</td>
                  <td className="px-5 py-3 text-neutral-dark">{p.land_use}</td>
                  <td className="px-5 py-3 text-neutral-dark">{p.owner_name}</td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <ConfidenceDot value={p.confidence} />
                      <span className="font-semibold">{p.confidence}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <StateBadge state={p.match_state} />
                  </td>
                  <td className="px-5 py-3 text-center text-neutral-dark">{p.sources.length}</td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/records/${p.id}`}
                      className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors inline-flex"
                    >
                      <ArrowRight className="w-4 h-4 text-primary" />
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
