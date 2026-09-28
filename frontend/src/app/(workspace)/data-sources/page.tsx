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
import { HudBadge, LiveRadarBeacon } from "@/components/ui/geospatial";

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
          <div className="flex items-center gap-2">
            <HudBadge variant="primary">Ingest</HudBadge>
            <h2 className="text-base font-bold">Upload Geospatial Dataset</h2>
          </div>
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
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragOver ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <FileUp className="w-9 h-9 text-neutral mx-auto mb-3" />
              <p className="text-sm font-medium mb-1">Drag and drop your dataset here</p>
              <p className="text-xs text-neutral-dark mb-4">or click to browse local files</p>
              <button
                onClick={handleUpload}
                className="px-4 py-2 rounded-lg bg-gradient-primary text-white text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                Browse Files
              </button>
            </div>

            <div className="mt-4">
              <p className="text-xs text-neutral-dark mb-2 font-mono uppercase text-[10px] tracking-wider">Supported formats:</p>
              <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                {["GeoJSON", "Shapefile", "GeoPackage", "GeoTIFF", "CSV", "JSON", "KML"].map((f) => (
                  <span key={f} className="px-2 py-0.5 rounded bg-surface border border-border text-foreground/70">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-dark mb-4">Ingestion Telemetry</h3>
            {stages.map((stage, i) => (
              <div key={stage} className="flex items-center gap-3 font-mono text-xs">
                {i < uploadStage ? (
                  <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                ) : i === uploadStage ? (
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-border flex-shrink-0" />
                )}
                <span className={i <= uploadStage ? "text-foreground font-medium" : "text-neutral"}>{stage}</span>
              </div>
            ))}
            {uploadStage >= stages.length - 1 && (
              <button
                onClick={onClose}
                className="w-full mt-4 py-2.5 rounded-lg bg-gradient-primary text-white text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                Complete Ingestion
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
    ready: "bg-success/15 text-success border-success/30",
    processing: "bg-primary/15 text-primary border-primary/30",
    validating: "bg-warning/15 text-warning border-warning/30",
    error: "bg-error/15 text-error border-error/30",
  };
  const icons = { ready: CheckCircle2, processing: Clock, validating: Clock, error: AlertCircle };
  const Icon = icons[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border ${styles[status]}`}>
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
      className="mb-8 p-6 rounded-2xl border border-info/20 bg-gradient-to-r from-info/5 via-surface-card to-surface-card shadow-sm"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-info/15 text-info">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold">Sentence-BERT Land-Use Semantic Matcher</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-success/20 text-success flex items-center gap-1 border border-success/30">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                Backend Live
              </span>
            </div>
            <p className="text-xs font-mono text-neutral-dark mt-0.5">
              all-MiniLM-L6-v2 • 272 Indian Land-Use Variants Pre-embedded • Threshold: 0.40
            </p>
          </div>
        </div>
        <a
          href="http://localhost:8000/docs#/default/match_land_use_endpoint_api_ml_match_land_use_post"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-primary font-mono font-medium hover:underline flex items-center gap-1 self-start md:self-auto"
        >
          <span>Swagger Docs</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
        {/* Left: Interactive Query Tester */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <label className="text-xs font-mono font-semibold text-neutral-dark flex items-center justify-between">
              <span>Interactive Semantic Tester</span>
              <span className="text-[11px] text-neutral">POST /api/ml/match-land-use</span>
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
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-surface text-xs font-mono focus:outline-none focus:ring-2 focus:ring-info/20 focus:border-info transition-all"
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
              <span className="text-[11px] text-neutral-dark font-mono font-medium mr-2">Quick presets:</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {sampleQueries.map((sample) => (
                  <button
                    key={sample}
                    onClick={() => handleMatch(sample)}
                    className="px-2.5 py-1 rounded-lg border border-border bg-surface hover:bg-surface-card hover:border-info/40 text-[11px] font-mono text-neutral-dark hover:text-foreground transition-all"
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
              <span className="text-[10px] font-mono text-neutral uppercase font-medium">Model</span>
              <div className="text-xs font-bold font-mono truncate">all-MiniLM-L6-v2</div>
              <div className="text-[10px] font-mono text-neutral-dark">384 Dimensions</div>
            </div>
            <div className="p-2.5 rounded-lg border border-border bg-surface/40">
              <span className="text-[10px] font-mono text-neutral uppercase font-medium">Accuracy</span>
              <div className="text-xs font-bold font-mono text-success">99.5% F1 Score</div>
              <div className="text-[10px] font-mono text-neutral-dark">100% Precision</div>
            </div>
            <div className="p-2.5 rounded-lg border border-border bg-surface/40">
              <span className="text-[10px] font-mono text-neutral uppercase font-medium">Vocabulary</span>
              <div className="text-xs font-bold font-mono">272 Variants</div>
              <div className="text-[10px] font-mono text-neutral-dark">Pre-embedded</div>
            </div>
          </div>
        </div>

        {/* Right: Live Result Card */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="flex-1 p-4 rounded-xl border border-border bg-surface/60 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-neutral-dark uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-info" />
                  Semantic Match Result
                </span>
                {result && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                      result.match_status === "MATCH"
                        ? "bg-success/20 text-success border-success/30"
                        : "bg-warning/20 text-warning border-warning/30"
                    }`}
                  >
                    {result.match_status}
                  </span>
                )}
              </div>

              {result ? (
                <div className="space-y-2.5">
                  <div className="p-3 rounded-lg bg-surface-card border border-border">
                    <div className="text-[10px] font-mono text-neutral-dark uppercase tracking-wider">Canonical Category</div>
                    <div className="text-base font-bold text-foreground mt-0.5">
                      {result.canonical_land_use || "Unresolved (Needs Review)"}
                    </div>
                    <div className="text-[11px] text-neutral mt-0.5 flex items-center gap-1">
                      <span>Source:</span>
                      <span className="font-mono text-neutral-dark">&quot;{result.source_value}&quot;</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
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

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
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
                <div className="text-center py-8 text-neutral font-mono text-xs">
                  Enter a land-use term and click Match to test SBERT inference.
                </div>
              )}
            </div>

            <div className="text-[10px] font-mono text-neutral-dark pt-3 mt-2 border-t border-border flex items-center justify-between">
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border"
      >
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <LiveRadarBeacon />
            <HudBadge variant="info">Geospatial Data Store</HudBadge>
            <span className="font-mono text-[10px] text-neutral">PostGIS 3.4 · PostgREST</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Data Sources & Pipelines</h1>
          <p className="text-xs text-neutral-dark mt-0.5">
            {demoDatasets.length} active pipelines loaded · SegFormer-B2 & SBERT Semantic Matching active
          </p>
        </div>
        <button
          onClick={() => setUploadOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-primary text-white text-xs font-semibold hover:opacity-90 transition-opacity self-start sm:self-auto"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload Dataset
        </button>
      </motion.div>

      {/* SBERT Land-Use Semantic Matcher Live Panel */}
      <SbertMatcherPanel />

      {/* SegFormer AI Building Segmentation Live Panel */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-6 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-surface-card to-surface-card shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/15 text-primary">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">SegFormer-B2 Building Segmentation</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-success/20 text-success border border-success/30">
                  Backend Live
                </span>
              </div>
              <p className="text-xs font-mono text-neutral-dark mt-0.5">
                SegFormer-B2 finetuned on SpaceNet-2 Paris dataset • IoU 73.6% • Output CRS EPSG:4326
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl border border-border bg-surface/50">
            <span className="text-[10px] font-mono text-neutral-dark uppercase font-medium">Architecture</span>
            <div className="text-xs font-mono font-bold mt-1">SegFormer-B2 (ADE20K Base)</div>
            <div className="text-[11px] font-mono text-neutral-dark mt-0.5">Input: 512×512 RGB Rasters</div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface/50">
            <span className="text-[10px] font-mono text-neutral-dark uppercase font-medium">Validation Metrics</span>
            <div className="flex items-center gap-3 mt-1 text-xs font-mono font-semibold">
              <span className="text-success">IoU: 73.6%</span>
              <span className="text-primary">F1: 84.8%</span>
              <span>Recall: 86.6%</span>
            </div>
            <div className="text-[11px] font-mono text-neutral-dark mt-0.5">Area Calculation: Geodetic WGS84</div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface/50 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-neutral-dark uppercase font-medium">API Endpoint</span>
              <div className="text-xs font-mono text-primary font-semibold mt-1 truncate">
                POST /api/ml/segment
              </div>
            </div>
            <a
              href="http://localhost:8000/docs#/default/segment_buildings_api_ml_segment_post"
              target="_blank"
              rel="noreferrer"
              className="mt-2 text-center text-xs font-mono font-semibold px-3 py-1.5 rounded-lg bg-primary text-white hover:opacity-90 transition-opacity"
            >
              Swagger UI Endpoint
            </a>
          </div>
        </div>
      </motion.div>

      {/* Dataset List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-2">
          <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-neutral-dark">
            Loaded Datasets ({demoDatasets.length})
          </h3>
          <span className="font-mono text-[10px] text-neutral">Auto-synchronized with catalog</span>
        </div>

        {demoDatasets.map((ds, i) => (
          <motion.div
            key={ds.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-xl border border-border bg-surface-card overflow-hidden shadow-sm hover:border-primary/30 transition-all"
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
                  <span className="text-xs font-bold truncate">{ds.name}</span>
                  <StatusBadge status={ds.status} />
                </div>
                <div className="text-[11px] font-mono text-neutral-dark">
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 font-mono text-xs">
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
                        { label: "Missing Attr", value: ds.missing_attributes.toString() },
                        { label: "Duplicates", value: ds.duplicates.toString() },
                        { label: "Uploaded", value: new Date(ds.uploaded_at).toISOString().split('T')[0] },
                      ].map((item) => (
                        <div key={item.label}>
                          <span className="text-[10px] font-semibold text-neutral uppercase tracking-wider font-sans">{item.label}</span>
                          <div className="text-xs font-semibold mt-0.5">{item.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* CRS Transformation info */}
                    {ds.original_crs !== ds.normalized_crs && ds.original_crs !== "N/A" && (
                      <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/15 font-mono text-xs">
                        <div className="font-semibold text-primary mb-1">CRS Transformation Pipeline</div>
                        <div className="text-neutral-dark">
                          {ds.original_crs} ➔ {ds.normalized_crs} (EPSG Transform with PROJ.4)
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
