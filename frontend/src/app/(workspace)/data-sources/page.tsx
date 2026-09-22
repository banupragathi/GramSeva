"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Database,
  File,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  MapPin,
  Layers,
  X,
  FileUp,
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
          <p className="text-sm text-neutral-dark">{demoDatasets.length} datasets loaded</p>
        </div>
        <button
          onClick={() => setUploadOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Upload className="w-4 h-4" />
          Upload Dataset
        </button>
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
