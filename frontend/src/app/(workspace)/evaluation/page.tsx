"use client";

import { motion } from "framer-motion";
import {
  FlaskConical,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Cpu,
} from "lucide-react";

interface MetricRow {
  metric: string;
  baseline: string | null;
  modelA: string | null;
  modelB: string | null;
  modelC: string | null;
  full: string | null;
}

function MetricTable({
  title,
  metrics,
  pending,
}: {
  title: string;
  metrics: MetricRow[];
  pending: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-surface-card overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        {pending && (
          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-warning/15 text-warning">
            Evaluation Pending
          </span>
        )}
      </div>

      {pending ? (
        <div className="p-8 text-center">
          <AlertCircle className="w-6 h-6 text-neutral mx-auto mb-2" />
          <p className="text-sm text-neutral-dark">Evaluation pending — no results computed yet</p>
          <p className="text-xs text-neutral mt-1">Run evaluation pipeline to generate metrics</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface/50">
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-neutral-dark uppercase tracking-wider">Metric</th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-neutral-dark uppercase tracking-wider">Baseline</th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-neutral-dark uppercase tracking-wider">Model A</th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-neutral-dark uppercase tracking-wider">Model B</th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-neutral-dark uppercase tracking-wider">Model C</th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-neutral-dark uppercase tracking-wider bg-primary/5">Full</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((row) => (
                <tr key={row.metric} className="border-t border-border">
                  <td className="px-5 py-2.5 font-medium text-xs">{row.metric}</td>
                  <td className="px-4 py-2.5 text-center text-xs">{row.baseline || "—"}</td>
                  <td className="px-4 py-2.5 text-center text-xs">{row.modelA || "—"}</td>
                  <td className="px-4 py-2.5 text-center text-xs">{row.modelB || "—"}</td>
                  <td className="px-4 py-2.5 text-center text-xs">{row.modelC || "—"}</td>
                  <td className="px-4 py-2.5 text-center text-xs font-semibold bg-primary/5">{row.full || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}

export default function EvaluationPage() {
  // All evaluation metrics are labeled as pending for honest representation
  // In a full system, these would be populated from actual evaluation runs

  const entityMatchingMetrics: MetricRow[] = [
    { metric: "Precision", baseline: null, modelA: null, modelB: null, modelC: null, full: null },
    { metric: "Recall", baseline: null, modelA: null, modelB: null, modelC: null, full: null },
    { metric: "F1", baseline: null, modelA: null, modelB: null, modelC: null, full: null },
    { metric: "ROC-AUC", baseline: null, modelA: null, modelB: null, modelC: null, full: null },
  ];

  const segmentationMetrics: MetricRow[] = [
    { metric: "IoU", baseline: null, modelA: null, modelB: null, modelC: null, full: null },
    { metric: "Precision", baseline: null, modelA: null, modelB: null, modelC: null, full: null },
    { metric: "Recall", baseline: null, modelA: null, modelB: null, modelC: null, full: null },
    { metric: "F1", baseline: null, modelA: null, modelB: null, modelC: null, full: null },
    { metric: "Dice", baseline: null, modelA: null, modelB: null, modelC: null, full: null },
  ];

  const geometryMetrics: MetricRow[] = [
    { metric: "IoU", baseline: null, modelA: null, modelB: null, modelC: null, full: null },
    { metric: "Hausdorff Distance", baseline: null, modelA: null, modelB: null, modelC: null, full: null },
    { metric: "Centroid Distance", baseline: null, modelA: null, modelB: null, modelC: null, full: null },
    { metric: "Area Error (%)", baseline: null, modelA: null, modelB: null, modelC: null, full: null },
  ];

  const conflictMetrics: MetricRow[] = [
    { metric: "Precision", baseline: null, modelA: null, modelB: null, modelC: null, full: null },
    { metric: "Recall", baseline: null, modelA: null, modelB: null, modelC: null, full: null },
    { metric: "F1", baseline: null, modelA: null, modelB: null, modelC: null, full: null },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-1">Evaluation</h1>
        <p className="text-sm text-neutral-dark mb-4">
          Model and pipeline evaluation metrics
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-warning/10 border border-warning/20 mb-8">
          <AlertCircle className="w-3.5 h-3.5 text-warning" />
          <span className="text-xs font-medium text-warning">
            Evaluation pending — metrics will be populated from actual evaluation runs on benchmark data
          </span>
        </div>
      </motion.div>

      {/* Comparison Configurations */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {[
          { name: "Baseline", desc: "Geometry only", color: "#A9ACAD" },
          { name: "Model A", desc: "Geometry + Attributes", color: "#4a7fb5" },
          { name: "Model B", desc: "Geometry + Visual", color: "#2d8a56" },
          { name: "Model C", desc: "Geo + Visual + Attr", color: "#c0862e" },
          { name: "Full", desc: "All evidence channels", color: "#860F61" },
        ].map((cfg, i) => (
          <motion.div
            key={cfg.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-3 rounded-xl border border-border bg-surface-card text-center"
          >
            <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: cfg.color }} />
            <div className="text-xs font-semibold">{cfg.name}</div>
            <div className="text-[10px] text-neutral-dark">{cfg.desc}</div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-6">
        <MetricTable title="Entity Matching" metrics={entityMatchingMetrics} pending={true} />
        <MetricTable title="Segmentation (SegFormer-B2)" metrics={segmentationMetrics} pending={true} />
        <MetricTable title="Geometry Quality" metrics={geometryMetrics} pending={true} />
        <MetricTable title="Conflict Detection" metrics={conflictMetrics} pending={true} />
      </div>
    </div>
  );
}
