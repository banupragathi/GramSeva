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
  const color = value >= 90 ? "bg--[#21700F]" : value >= 80 ? "bg-amber-500" : value >= 70 ? "bg-orange-500" : "bg-rose-600";
  return <div className={`w-2 h-2 rounded-full ${color} shadow-sm`} title={`${value}% confidence`} />;
}

function StateBadge({ state }: { state: string }) {
  const styles: Record<string, string> = {
    MATCHED: "bg--[#F3E3EC] text--[#21700F]",
    LIKELY_MATCH: "bg-amber-100 text-amber-700",
    REVIEW_REQUIRED: "bg-orange-100 text-orange-700",
    NOT_MATCHED: "bg-slate-100 text-slate-700",
  };
  return (
    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${styles[state] || styles.MATCHED}`}>
      {state.replace(/_/g, " ")}
    </span>
  );
}

export default function RecordsPage() {
  const parcels = demoParcels.features.map((f) => f.properties);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold text--[#860F61] mb-1">Unified Land Records</h1>
        <p className="text-sm font-medium text--[#5E0A44] mb-8">{parcels.length} parcels in harmonized registry</p>
      </motion.div>

      {/* Search */}
      <div className="relative max-w-md mb-6 shadow-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text--[#21700F]" />
        <input
          type="text"
          placeholder="Search by ID, survey number, or owner..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border--[#860F61]/10 bg-white text-sm focus:outline-none focus:ring-2 focus:ring--[#21700F]/20 focus:border--[#21700F]/40 transition-all font-medium text--[#860F61] placeholder:text--[#21700F]/50"
        />
      </div>

      {/* Records Table */}
      <div className="rounded-xl border border--[#860F61]/10 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border--[#860F61]/10 bg--[#FBF6EE]">
                <th className="text-left px-5 py-3 text-xs font-bold text--[#860F61] uppercase tracking-wider">Parcel</th>
                <th className="text-left px-5 py-3 text-xs font-bold text--[#860F61] uppercase tracking-wider">Survey No.</th>
                <th className="text-left px-5 py-3 text-xs font-bold text--[#860F61] uppercase tracking-wider">Area</th>
                <th className="text-left px-5 py-3 text-xs font-bold text--[#860F61] uppercase tracking-wider">Land Use</th>
                <th className="text-left px-5 py-3 text-xs font-bold text--[#860F61] uppercase tracking-wider">Owner</th>
                <th className="text-center px-5 py-3 text-xs font-bold text--[#860F61] uppercase tracking-wider">Confidence</th>
                <th className="text-left px-5 py-3 text-xs font-bold text--[#860F61] uppercase tracking-wider">State</th>
                <th className="text-center px-5 py-3 text-xs font-bold text--[#860F61] uppercase tracking-wider">Sources</th>
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
                  className="border-b border--[#860F61]/10 last:border-0 hover:bg--[#FBF6EE]/50 transition-colors"
                >
                  <td className="px-5 py-3 font-bold text--[#860F61]">{p.id}</td>
                  <td className="px-5 py-3 text--[#5E0A44] font-medium">{p.survey_number}</td>
                  <td className="px-5 py-3 text--[#860F61] font-medium">{p.area_sqm} sq.m</td>
                  <td className="px-5 py-3 text--[#5E0A44] font-medium">{p.land_use}</td>
                  <td className="px-5 py-3 text--[#5E0A44] font-medium">{p.owner_name}</td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <ConfidenceDot value={p.confidence} />
                      <span className="font-bold text--[#860F61]">{p.confidence}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <StateBadge state={p.match_state} />
                  </td>
                  <td className="px-5 py-3 text-center text--[#5E0A44] font-bold">{p.sources.length}</td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/records/${p.id}`}
                      className="p-1.5 rounded-lg hover:bg--[#F3E3EC] transition-colors inline-flex group"
                    >
                      <ArrowRight className="w-4 h-4 text--[#21700F] group-hover:text--[#5E0A44]" />
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

