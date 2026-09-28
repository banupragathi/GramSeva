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
        <h1 className="text-3xl font-extrabold text-purple-950 mb-1">Review Queue</h1>
        <p className="text-sm font-medium text-purple-800 mb-8">{reviewItems.length} items require human review</p>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-1.5 mb-6 flex-wrap">
        {typeFilters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors shadow-sm border ${
              filter === f ? "bg-purple-600 text-white border-purple-600" : "bg-white border-purple-900/10 hover:bg-emerald-50 text-purple-800"
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
                  ? "border-purple-600 bg-emerald-50 shadow-md ring-1 ring-purple-600/20"
                  : "border-purple-900/10 bg-white hover:border-purple-600/30 hover:shadow-md"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-bold text-purple-950">{item.parcel_id}</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    {item.type.replace("_", " ")}
                  </span>
                </div>
                <div className="text-sm font-black text-purple-700">{item.confidence}%</div>
              </div>
              <p className="text-sm font-medium text-purple-800 mb-2">{item.issue}</p>
              <div className="flex items-center justify-between text-xs text-purple-600 font-medium">
                <div className="flex gap-1.5">
                  {item.sources.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded bg-emerald-100 text-purple-900 font-bold">{s}</span>
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
              className="w-96 flex-shrink-0 rounded-xl border border-purple-900/10 bg-white p-5 shadow-sm"
            >
              <h3 className="text-lg font-extrabold text-purple-950 mb-1">Review: {activeReview.parcel_id}</h3>
              <p className="text-sm font-medium text-purple-800 mb-5">{activeReview.issue}</p>

              {/* AI Evidence */}
              <div className="mb-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-800 mb-2">AI Evidence</h4>
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-purple-900 font-medium space-y-1 shadow-sm">
                  <div>Confidence: <span className="font-bold text-purple-700">{activeReview.confidence}%</span></div>
                  <div>Sources compared: {activeReview.sources.join(", ")}</div>
                  <div>Issue type: {activeReview.type.replace("_", " ")}</div>
                </div>
              </div>

              {/* Reviewer Notes */}
              <div className="mb-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-800 mb-2">Reviewer Notes</h4>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your review notes here..."
                  className="w-full px-3 py-2 rounded-lg border border-purple-900/10 bg-[#F8FAFC] text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-purple-600/30 text-purple-950 font-medium placeholder:text-purple-700/50"
                />
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 transition-colors shadow-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Accept Harmonization
                </button>
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-rose-600 text-rose-600 text-sm font-bold hover:bg-rose-50 transition-colors">
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex items-center justify-center gap-2 py-2 rounded-lg border border-purple-900/10 text-sm font-bold text-purple-800 hover:bg-emerald-50 transition-colors">
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button className="flex items-center justify-center gap-2 py-2 rounded-lg border border-purple-900/10 text-sm font-bold text-purple-800 hover:bg-emerald-50 transition-colors">
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

