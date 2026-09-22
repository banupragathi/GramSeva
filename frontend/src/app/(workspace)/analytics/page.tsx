"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Database,
  GitMerge,
  Shield,
  Clock,
  CheckCircle2,
  PieChart,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  MINI CHART (Bar chart simulation)                                   */
/* ------------------------------------------------------------------ */
function BarChartVisual({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((v, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${(v / max) * 100}%` }}
          transition={{ delay: i * 0.05, duration: 0.4 }}
          className="flex-1 rounded-t"
          style={{ backgroundColor: color, opacity: 0.7 + (i / data.length) * 0.3 }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DONUT CHART (CSS-based)                                             */
/* ------------------------------------------------------------------ */
function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  let cumulative = 0;

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          {segments.map((seg, i) => {
            const pct = (seg.value / total) * 100;
            const offset = cumulative;
            cumulative += pct;
            return (
              <motion.circle
                key={seg.label}
                cx="18" cy="18" r="14"
                fill="none"
                stroke={seg.color}
                strokeWidth="4"
                strokeDasharray={`${pct} ${100 - pct}`}
                strokeDashoffset={-offset}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold">{total}</span>
        </div>
      </div>
      <div className="space-y-1.5">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: seg.color }} />
            <span className="text-neutral-dark">{seg.label}</span>
            <span className="font-semibold ml-auto">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  ANALYTICS PAGE                                                      */
/* ================================================================== */
export default function AnalyticsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-1">Analytics</h1>
        <p className="text-sm text-neutral-dark mb-8">
          Processing statistics and insights • <span className="text-warning text-xs font-medium">Demo Dataset</span>
        </p>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Database, label: "Parcels Processed", value: "1,247", color: "#860F61" },
          { icon: GitMerge, label: "Entities Matched", value: "1,089", color: "#2d8a56" },
          { icon: Shield, label: "Conflicts Detected", value: "43", color: "#b84040" },
          { icon: CheckCircle2, label: "Conflicts Resolved", value: "28", color: "#4a7fb5" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="p-5 rounded-xl border border-border bg-surface-card"
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${stat.color}15` }}>
              <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-neutral-dark font-medium">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confidence Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-xl border border-border bg-surface-card"
        >
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Matching Confidence Distribution
          </h3>
          <BarChartVisual
            data={[12, 25, 48, 180, 320, 504]}
            color="#860F61"
          />
          <div className="flex justify-between text-[10px] text-neutral-dark mt-2">
            <span>&lt;50%</span>
            <span>50-60%</span>
            <span>60-70%</span>
            <span>70-80%</span>
            <span>80-90%</span>
            <span>90-100%</span>
          </div>
        </motion.div>

        {/* Conflict Type Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-5 rounded-xl border border-border bg-surface-card"
        >
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Conflict Type Distribution
          </h3>
          <DonutChart
            segments={[
              { label: "Boundary", value: 15, color: "#b84040" },
              { label: "Area", value: 12, color: "#c0862e" },
              { label: "Attribute", value: 9, color: "#4a7fb5" },
              { label: "Temporal", value: 4, color: "#860F61" },
              { label: "Topology", value: 3, color: "#A9ACAD" },
            ]}
          />
        </motion.div>

        {/* Source Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-xl border border-border bg-surface-card"
        >
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            Source Coverage
          </h3>
          <div className="space-y-3">
            {[
              { name: "Cadastral", records: 487, coverage: 82 },
              { name: "Municipal GIS", records: 523, coverage: 88 },
              { name: "Revenue", records: 412, coverage: 69 },
              { name: "Drone Imagery", records: 1, coverage: 45 },
              { name: "OpenStreetMap", records: 1892, coverage: 94 },
              { name: "GNSS", records: 34, coverage: 12 },
            ].map((src) => (
              <div key={src.name}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium">{src.name}</span>
                  <span className="text-neutral-dark">{src.records} records • {src.coverage}%</span>
                </div>
                <div className="h-1.5 bg-border rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${src.coverage}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Processing Performance */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-5 rounded-xl border border-border bg-surface-card"
        >
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Processing Performance
          </h3>
          <div className="space-y-3">
            {[
              { label: "Avg. CRS Normalization", value: "0.3s / record" },
              { label: "Avg. Geometry Validation", value: "0.1s / record" },
              { label: "Avg. Entity Matching", value: "2.1s / pair" },
              { label: "Avg. Conflict Detection", value: "0.4s / record" },
              { label: "Total Processing Time", value: "12m 34s" },
              { label: "Records / Second", value: "~42" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <span className="text-neutral-dark">{item.label}</span>
                <span className="font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-neutral italic">Demonstration values — actual performance depends on hardware and data volume</div>
        </motion.div>
      </div>
    </div>
  );
}
