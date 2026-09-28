"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Database,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
  Layers,
  X,
  FileUp,
  Sparkles,
  ArrowRight,
  Search,
  Bot,
  Tag,
  Loader2,
} from "lucide-react";
import { demoDatasets, type DemoDataset } from "@/lib/demo-data";

/* ------------------------------------------------------------------ */
/*  UPLOAD MODAL                                                        */
/* ------------------------------------------------------------------ */
function UploadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState(0);

  const stages = [
    "Uploading file…",
    "Detecting format…",
    "Validating geometry…",
    "Detecting CRS…",
    "Normalizing CRS…",
    "Processing geometry…",
    "Loading into PostGIS…",
    "Ready",
  ];

  const handleUpload = () => {
    setUploading(true);
    setUploadStage(0);
    const interval = setInterval(() => {
      setUploadStage((prev) => {
        if (prev >= stages.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 800);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-surface-card rounded-2xl border border-border shadow-2xl p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">Upload Dataset</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface transition-colors">
            <X className="w-4 h-4 text-neutral-dark" />
          </button>
        </div>

        {!uploading ? (
          <>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(); }}
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
                dragOver ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <FileUp className="w-10 h-10 text-neutral mx-auto mb-3" />
              <p className="text-sm font-medium mb-1">Drag and drop your dataset here</p>
              <p className="text-xs text-neutral-dark mb-4">or click to browse files</p>
              <button
                onClick={handleUpload}
                className="px-4 py-2 rounded-lg bg-gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Browse Files
              </button>
            </div>

            <div className="mt-4">
              <p className="text-xs text-neutral-dark mb-2 font-medium">Supported formats:</p>
              <div className="flex flex-wrap gap-1.5">
                {["GeoJSON", "Shapefile", "GeoPackage", "GeoTIFF", "CSV", "JSON", "KML"].map((f) => (
                  <span key={f} className="px-2 py-0.5 rounded bg-secondary/50 text-xs font-medium text-foreground/60">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold mb-4">Processing Dataset</h3>
            {stages.map((stage, i) => (
              <div key={stage} className="flex items-center gap-3">
                {i < uploadStage ? (
                  <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                ) : i === uploadStage ? (
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-border flex-shrink-0" />
                )}
                <span className={`text-sm ${i <= uploadStage ? "text-foreground" : "text-neutral"}`}>{stage}</span>
              </div>
            ))}
            {uploadStage >= stages.length - 1 && (
              <button
                onClick={onClose}
                className="w-full mt-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  STATUS BADGE                                                        */
/* ------------------------------------------------------------------ */
function StatusBadge({ status }: { status: DemoDataset["status"] }) {
  const styles = {
    ready: "bg-success/15 text-success",
    processing: "bg-primary/15 text-primary",
    validating: "bg-warning/15 text-warning",
    error: "bg-error/15 text-error",
  };
  const icons = { ready: CheckCircle2, processing: Clock, validating: Clock, error: AlertCircle };
  const Icon = icons[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${styles[status]}`}>
      <Icon className="w-2.5 h-2.5" />
      {status}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  SBERT LAND-USE SEMANTIC MATCHER PANEL                             */
/* ------------------------------------------------------------------ */
interface SbertResult {
  source_value: string;
  canonical_land_use: string | null;
  semantic_similarity: number;
  match_status: "MATCH" | "HUMAN_REVIEW";
  matching_method: string;
  matched_variant: string;
}

function SbertMatcherPanel() {
  const [query, setQuery] = useState("commercial showroom complex");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SbertResult | null>({
    source_value: "commercial showroom complex",
    canonical_land_use: "Commercial",
    semantic_similarity: 0.9412,
    match_status: "MATCH",
    matching_method: "SBERT",
    matched_variant: "commercial complex",
  });

  const sampleQueries = [
    "resi layout",
    "commercial showroom",
    "agricultural paddy",
    "heavy industry shed",
    "govt primary school",
    "vacant open plot",
  ];

  const handleMatch = async (textToMatch?: string) => {
    const term = textToMatch || query;
    if (!term.trim()) return;
    if (textToMatch) setQuery(textToMatch);
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/ml/match-land-use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ land_use: term.trim() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.warn("API request failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 p-6 rounded-2xl border border-info/20 bg-gradient-to-r from-info/5 via-surface-card to-surface-card shadow-lg"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-info/15 text-info">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold">Sentence-BERT Land-Use Semantic Matcher (Task 1)</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/20 text-success flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                Backend API Live
              </span>
            </div>
            <p className="text-xs text-neutral-dark">
              sentence-transformers/all-MiniLM-L6-v2 • 272 Indian Land-Use Variants Pre-embedded • Production Threshold: 0.40
            </p>
          </div>
        </div>
        <a
          href="http://localhost:8000/docs#/default/match_land_use_endpoint_api_ml_match_land_use_post"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-primary font-medium hover:underline flex items-center gap-1 self-start md:self-auto"
        >
          <span>Swagger Docs</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
        {/* Left: Interactive Query Tester */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <label className="text-xs font-semibold text-neutral-dark flex items-center justify-between">
              <span>Interactive Land-Use Query Tester</span>
              <span className="text-[11px] text-neutral">Endpoint: POST /api/ml/match-land-use</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleMatch()}
                  placeholder="Enter raw land-use string (e.g. 'resi area', 'paddy field')..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-info/20 focus:border-info transition-all"
                />
              </div>
              <button
                onClick={() => handleMatch()}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-info text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
                <span>Match</span>
              </button>
            </div>

            {/* Preset Query Chips */}
            <div>
              <span className="text-[11px] text-neutral-dark font-medium mr-2">Try quick examples:</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {sampleQueries.map((sample) => (
                  <button
                    key={sample}
                    onClick={() => handleMatch(sample)}
                    className="px-2.5 py-1 rounded-lg border border-border bg-surface hover:bg-surface-card hover:border-info/40 text-[11px] text-neutral-dark hover:text-foreground transition-all"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Model Architecture Specs */}
          <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-border">
            <div className="p-2.5 rounded-lg border border-border bg-surface/40">
              <span className="text-[10px] text-neutral uppercase font-medium">Model</span>
              <div className="text-xs font-bold truncate">all-MiniLM-L6-v2</div>
              <div className="text-[10px] text-neutral-dark">384 Dimensions</div>
            </div>
            <div className="p-2.5 rounded-lg border border-border bg-surface/40">
              <span className="text-[10px] text-neutral uppercase font-medium">Accuracy</span>
              <div className="text-xs font-bold text-success">99.5% F1 Score</div>
              <div className="text-[10px] text-neutral-dark">100% Precision</div>
            </div>
            <div className="p-2.5 rounded-lg border border-border bg-surface/40">
              <span className="text-[10px] text-neutral uppercase font-medium">Vocabulary</span>
              <div className="text-xs font-bold">272 Variants</div>
              <div className="text-[10px] text-neutral-dark">Pre-embedded</div>
            </div>
          </div>
        </div>

        {/* Right: Live Result Card */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="flex-1 p-4 rounded-xl border border-border bg-surface/60 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-dark uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-info" />
                  Semantic Match Result
                </span>
                {result && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      result.match_status === "MATCH"
                        ? "bg-success/20 text-success"
                        : "bg-warning/20 text-warning"
                    }`}
                  >
                    {result.match_status}
                  </span>
                )}
              </div>

              {result ? (
                <div className="space-y-2.5">
                  <div className="p-3 rounded-lg bg-surface-card border border-border">
                    <div className="text-[10px] text-neutral-dark uppercase tracking-wider">Canonical Category</div>
                    <div className="text-base font-bold text-foreground mt-0.5">
                      {result.canonical_land_use || "Unresolved (Needs Review)"}
                    </div>
                    <div className="text-[11px] text-neutral mt-0.5 flex items-center gap-1">
                      <span>Source:</span>
                      <span className="font-mono text-neutral-dark">&quot;{result.source_value}&quot;</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-dark">Cosine Similarity</span>
                      <span className="font-bold text-foreground">
                        {(result.semantic_similarity * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-info h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, result.semantic_similarity * 100))}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-surface border border-border">
                      <div className="text-[10px] text-neutral">Stage</div>
                      <div className="font-semibold text-info">{result.matching_method}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-surface border border-border">
                      <div className="text-[10px] text-neutral">Closest Variant</div>
                      <div className="font-semibold truncate">{result.matched_variant || "—"}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-neutral text-xs">
                  Enter a land-use term and click Match to test SBERT inference.
                </div>
              )}
            </div>

            <div className="text-[10px] text-neutral-dark pt-3 mt-2 border-t border-border flex items-center justify-between">
              <span>Pipeline: Exact ➔ Normalized ➔ SBERT ➔ Review</span>
              <span className="text-success font-medium">Ready</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ================================================================== */
/*  DATA SOURCES PAGE                                                   */
/* ================================================================== */
export default function DataSourcesPage() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold mb-1">Data Sources</h1>
          <p className="text-sm text-neutral-dark">{demoDatasets.length} datasets loaded • SegFormer-B2 & SBERT Semantic Matching Enabled</p>
        </div>
        <button
          onClick={() => setUploadOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Upload className="w-4 h-4" />
          Upload Dataset
        </button>
      </motion.div>

      {/* SBERT Land-Use Semantic Matcher Live Panel */}
      <SbertMatcherPanel />

      {/* SegFormer AI Building Segmentation Live Panel */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-6 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-surface-card to-surface-card shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/15 text-primary">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">SegFormer-B2 Building Segmentation (Task 2)</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/20 text-success">
                  Backend API Live
                </span>
              </div>
              <p className="text-xs text-neutral-dark">
                NVIDIA SegFormer-B2 finetuned on SpaceNet-2 Paris dataset • IoU 73.6% • Output CRS EPSG:4326
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl border border-border bg-surface/50">
            <span className="text-xs text-neutral-dark font-medium">Pretrained Architecture</span>
            <div className="text-sm font-bold mt-1">SegFormer-B2 (ADE20K Base)</div>
            <div className="text-[11px] text-neutral-dark mt-0.5">Input: 512×512 RGB Satellite Rasters</div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface/50">
            <span className="text-xs text-neutral-dark font-medium">Validation Metrics</span>
            <div className="flex items-center gap-3 mt-1 text-xs font-semibold">
              <span className="text-success">IoU: 73.6%</span>
              <span className="text-primary">Dice/F1: 84.8%</span>
              <span>Recall: 86.6%</span>
            </div>
            <div className="text-[11px] text-neutral-dark mt-0.5">Polygon Area Calculation: Geodetic WGS84</div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface/50 flex flex-col justify-between">
            <div>
              <span className="text-xs text-neutral-dark font-medium">API Endpoint</span>
              <div className="text-xs font-mono text-primary font-semibold mt-1 truncate">
                POST /api/ml/segment
              </div>
            </div>
            <a
              href="http://localhost:8000/docs#/default/segment_buildings_api_ml_segment_post"
              target="_blank"
              rel="noreferrer"
              className="mt-2 text-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-white hover:opacity-90 transition-opacity"
            >
              Test Endpoint via Swagger UI
            </a>
          </div>
        </div>
      </motion.div>

      {/* Dataset List */}
      <div className="space-y-3">
        {demoDatasets.map((ds, i) => (
          <motion.div
            key={ds.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border bg-surface-card overflow-hidden"
          >
            {/* Summary row */}
            <button
              onClick={() => setExpanded(expanded === ds.id ? null : ds.id)}
              className="w-full px-5 py-4 flex items-center gap-4 hover:bg-surface/50 transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Database className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold truncate">{ds.name}</span>
                  <StatusBadge status={ds.status} />
                </div>
                <div className="text-xs text-neutral-dark">
                  {ds.source_type} • {ds.format} • {ds.record_count.toLocaleString("en-US")} records • {ds.file_size}
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-neutral-dark transition-transform ${expanded === ds.id ? "rotate-180" : ""}`} />
            </button>

            {/* Expanded metadata */}
            <AnimatePresence>
              {expanded === ds.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-4 pt-0 border-t border-border">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      {[
                        { label: "Source Type", value: ds.source_type },
                        { label: "Source ID", value: ds.id },
                        { label: "Format", value: ds.format },
                        { label: "Records", value: ds.record_count.toLocaleString("en-US") },
                        { label: "Geometry", value: ds.geometry_type },
                        { label: "Original CRS", value: ds.original_crs },
                        { label: "Normalized CRS", value: ds.normalized_crs },
                        { label: "File Size", value: ds.file_size },
                        { label: "Validity", value: `${ds.validity}%` },
                        { label: "Missing Attributes", value: ds.missing_attributes.toString() },
                        { label: "Duplicates", value: ds.duplicates.toString() },
                        { label: "Uploaded", value: new Date(ds.uploaded_at).toISOString().split('T')[0] },
                      ].map((item) => (
                        <div key={item.label}>
                          <span className="text-[10px] font-semibold text-neutral uppercase tracking-wider">{item.label}</span>
                          <div className="text-sm font-medium mt-0.5">{item.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* CRS Transformation info */}
                    {ds.original_crs !== ds.normalized_crs && ds.original_crs !== "N/A" && (
                      <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/15">
                        <div className="text-xs font-semibold text-primary mb-1">CRS Transformation Applied</div>
                        <div className="text-xs text-neutral-dark">
                          {ds.original_crs} → {ds.normalized_crs} (e.g., UTM Zone 44N → WGS84)
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
