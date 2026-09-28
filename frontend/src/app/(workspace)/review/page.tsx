"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit3,
  ArrowUpRight,
  ClipboardList,
} from "lucide-react";
import { HudBadge, LiveRadarBeacon } from "@/components/ui/geospatial";

interface ReviewItem {
  id: string;
  parcel_id: string;
  issue: string;
  confidence: number;
  sources: string[];
  created_at: string;
  type: "low_confidence" | "boundary" | "attribute" | "area" | "temporal";
}

const reviewItems: ReviewItem[] = [
  { id: "RV-001", parcel_id: "TN-1022", issue: "Multi-source boundary disagreement + area mismatch >10%", confidence: 72, sources: ["Cadastral", "Municipal", "Revenue"], created_at: "2024-08-12T08:45:00Z", type: "boundary" },
  { id: "RV-002", parcel_id: "TN-1011", issue: "Boundary shifted 2.3m east in municipal data", confidence: 78, sources: ["Cadastral", "Municipal"], created_at: "2024-08-18T14:22:00Z", type: "boundary" },
  { id: "RV-003", parcel_id: "TN-1042", issue: "Area mismatch 5.58% between cadastral and municipal", confidence: 94, sources: ["Cadastral", "Municipal", "Drone", "Revenue"], created_at: "2024-08-20T09:51:00Z", type: "area" },
  { id: "RV-004", parcel_id: "TN-1021", issue: "Land use: Agricultural (Revenue) vs Residential (Municipal)", confidence: 85, sources: ["Cadastral", "Municipal"], created_at: "2024-08-15T11:30:00Z", type: "attribute" },
];

const typeFilters = ["all", "low_confidence", "boundary", "attribute", "area", "temporal"] as const;

export default function ReviewPage() {
  const [filter, setFilter] = useState<typeof typeFilters[number]>("all");
  const [activeReview, setActiveReview] = useState<ReviewItem | null>(null);
  const [notes, setNotes] = useState("");

  const filtered = reviewItems.filter((r) => filter === "all" || r.type === filter);

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
            <HudBadge variant="warning">Human-in-the-Loop</HudBadge>
            <span className="font-mono text-[10px] text-neutral">Adjudication Queue</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Review & Adjudication Queue</h1>
          <p className="text-xs text-neutral-dark mt-0.5">
            {reviewItems.length} spatial records require authoritative validation or evidence override
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-warning/10 border border-warning/30 self-start sm:self-auto">
          <ClipboardList className="w-4 h-4 text-warning" />
          <span className="font-mono text-xs font-bold text-warning">{filtered.length} Pending</span>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {typeFilters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap ${
              filter === f
                ? "bg-primary text-white font-semibold"
                : "bg-surface border border-border text-neutral-dark hover:bg-surface-card"
            }`}
          >
            {f === "all" ? "All Queue" : f.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Review List */}
        <div className="flex-1 space-y-3">
          {filtered.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setActiveReview(item)}
              className={`w-full text-left p-5 rounded-xl border transition-all ${
                activeReview?.id === item.id
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-surface-card hover:border-primary/30"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <span className="text-xs font-mono font-bold">{item.parcel_id}</span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border bg-warning/10 text-warning border-warning/30">
                    {item.type.replace("_", " ")}
                  </span>
                </div>
                <div className="font-mono text-xs font-bold text-primary">{item.confidence}% Conf</div>
              </div>
              <p className="text-xs text-neutral-dark mb-3 leading-relaxed">{item.issue}</p>
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral">
                <div className="flex gap-1.5">
                  {item.sources.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded bg-surface border border-border text-foreground/70">{s}</span>
                  ))}
                </div>
                <span>{new Date(item.created_at).toISOString().split('T')[0]}</span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Review Detail Panel */}
        <AnimatePresence>
          {activeReview && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full lg:w-96 flex-shrink-0 rounded-xl border border-border bg-surface-card p-5 shadow-sm space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-primary uppercase tracking-widest">Inspection Target</span>
                  <span className="font-mono text-xs font-bold text-primary">{activeReview.confidence}% Conf</span>
                </div>
                <h3 className="text-base font-bold tracking-tight">Parcel {activeReview.parcel_id}</h3>
                <p className="text-xs text-neutral-dark mt-1">{activeReview.issue}</p>
              </div>

              {/* AI Evidence */}
              <div className="p-3.5 rounded-xl bg-surface border border-border space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-dark font-sans">Confidence:</span>
                  <span className="font-bold text-primary">{activeReview.confidence}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-dark font-sans">Issue Category:</span>
                  <span className="capitalize">{activeReview.type.replace("_", " ")}</span>
                </div>
                <div className="pt-2 border-t border-border text-[11px]">
                  <span className="text-neutral-dark font-sans">Compared Layers:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {activeReview.sources.map((s) => (
                      <span key={s} className="px-1.5 py-0.5 rounded bg-surface-card border border-border text-neutral-dark">{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reviewer Notes */}
              <div>
                <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-dark mb-2">Adjudication Notes</h4>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record justification, field survey remarks, or official override reason..."
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs font-mono resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
                />
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-1">
                <button className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-success text-white text-xs font-semibold hover:opacity-90 transition-opacity">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Accept Harmonization
                </button>
                <button className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-error text-error text-xs font-semibold hover:bg-error/5 transition-colors">
                  <XCircle className="w-3.5 h-3.5" />
                  Reject Match
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-border text-xs font-medium hover:bg-surface transition-colors">
                    <Edit3 className="w-3.5 h-3.5 text-neutral" />
                    Modify
                  </button>
                  <button className="flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-border text-xs font-medium hover:bg-surface transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5 text-neutral" />
                    Escalate
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
