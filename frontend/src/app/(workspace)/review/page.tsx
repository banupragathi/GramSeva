"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardCheck,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit3,
  ArrowUpRight,
  Shield,
  BarChart3,
  Eye,
  MessageSquare,
} from "lucide-react";
import { demoConflicts, demoParcels, demoMatchEvidence } from "@/lib/demo-data";

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
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-1">Review Queue</h1>
        <p className="text-sm text-neutral-dark mb-8">{reviewItems.length} items require human review</p>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-1.5 mb-6 flex-wrap">
        {typeFilters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f ? "bg-primary text-white" : "bg-surface border border-border hover:bg-primary/5"
            }`}
          >
            {f === "all" ? "All" : f.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Review List */}
        <div className="flex-1 space-y-3">
          {filtered.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setActiveReview(item)}
              className={`w-full text-left p-5 rounded-xl border transition-all ${
                activeReview?.id === item.id
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border bg-surface-card hover:border-primary/20 hover:shadow-md"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <span className="text-sm font-semibold">{item.parcel_id}</span>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-warning/15 text-warning">
                    {item.type.replace("_", " ")}
                  </span>
                </div>
                <div className="text-sm font-bold text-primary">{item.confidence}%</div>
              </div>
              <p className="text-sm text-neutral-dark mb-2">{item.issue}</p>
              <div className="flex items-center justify-between text-xs text-neutral">
                <div className="flex gap-1.5">
                  {item.sources.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded bg-secondary/50 text-foreground/60 font-medium">{s}</span>
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
              className="w-96 flex-shrink-0 rounded-xl border border-border bg-surface-card p-5"
            >
              <h3 className="text-lg font-bold mb-1">Review: {activeReview.parcel_id}</h3>
              <p className="text-sm text-neutral-dark mb-5">{activeReview.issue}</p>

              {/* AI Evidence */}
              <div className="mb-5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-dark mb-2">AI Evidence</h4>
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/15 text-xs text-neutral-dark space-y-1">
                  <div>Confidence: <span className="font-semibold text-primary">{activeReview.confidence}%</span></div>
                  <div>Sources compared: {activeReview.sources.join(", ")}</div>
                  <div>Issue type: {activeReview.type.replace("_", " ")}</div>
                </div>
              </div>

              {/* Reviewer Notes */}
              <div className="mb-5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-dark mb-2">Reviewer Notes</h4>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your review notes here..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-success text-white text-sm font-semibold hover:opacity-90 transition-opacity">
                  <CheckCircle2 className="w-4 h-4" />
                  Accept Harmonization
                </button>
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-error text-error text-sm font-semibold hover:bg-error/5 transition-colors">
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex items-center justify-center gap-2 py-2 rounded-lg border border-border text-sm font-medium hover:bg-surface transition-colors">
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button className="flex items-center justify-center gap-2 py-2 rounded-lg border border-border text-sm font-medium hover:bg-surface transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5" />
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
