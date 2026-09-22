"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Clock,
  Building2,
  TreePine,
  MapPin,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { demoChanges, type DemoChange } from "@/lib/demo-data";

const timelineYears = [2019, 2021, 2023, 2025];

function ChangeIcon({ type }: { type: DemoChange["type"] }) {
  const icons: Record<string, React.ElementType> = {
    new_building: Building2,
    building_expanded: Building2,
    building_demolished: Building2,
    land_use_change: TreePine,
    boundary_change: MapPin,
  };
  const Icon = icons[type] || Clock;
  return <Icon className="w-4 h-4" />;
}

function ChangeTypeBadge({ type }: { type: DemoChange["type"] }) {
  const styles: Record<string, string> = {
    new_building: "bg-success/15 text-success",
    building_expanded: "bg-warning/15 text-warning",
    building_demolished: "bg-error/15 text-error",
    land_use_change: "bg-info/15 text-info",
    boundary_change: "bg-primary/15 text-primary",
  };
  return (
    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${styles[type] || "bg-neutral-light text-neutral-dark"}`}>
      {type.replace(/_/g, " ")}
    </span>
  );
}

export default function ChangesPage() {
  const [timelinePos, setTimelinePos] = useState(2);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-1">Land Time Machine</h1>
        <p className="text-sm text-neutral-dark mb-8">{demoChanges.length} changes detected through temporal analysis</p>
      </motion.div>

      {/* Timeline Slider */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-10 p-6 rounded-2xl border border-border bg-surface-card"
      >
        <h2 className="text-sm font-semibold mb-5 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Timeline
        </h2>

        <div className="relative mx-8">
          {/* Track */}
          <div className="h-1 bg-border rounded-full relative">
            <motion.div
              className="absolute h-full bg-gradient-primary rounded-full"
              animate={{ width: `${(timelinePos / (timelineYears.length - 1)) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Year markers */}
          <div className="flex justify-between mt-3">
            {timelineYears.map((year, i) => (
              <button
                key={year}
                onClick={() => setTimelinePos(i)}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  i <= timelinePos ? "text-primary" : "text-neutral"
                }`}
              >
                <div className={`w-3 h-3 rounded-full border-2 transition-colors ${
                  i <= timelinePos ? "bg-primary border-primary" : "bg-surface-card border-neutral"
                } ${i === timelinePos ? "ring-4 ring-primary/20" : ""}`} />
                <span className="text-xs font-semibold">{year}</span>
              </button>
            ))}
          </div>

          {/* Slider controls */}
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={() => setTimelinePos(Math.max(0, timelinePos - 1))}
              disabled={timelinePos === 0}
              className="p-1.5 rounded-lg border border-border hover:bg-surface disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-primary px-4 py-1 rounded-lg bg-primary/5">
              {timelineYears[timelinePos]}
            </span>
            <button
              onClick={() => setTimelinePos(Math.min(timelineYears.length - 1, timelinePos + 1))}
              disabled={timelinePos === timelineYears.length - 1}
              className="p-1.5 rounded-lg border border-border hover:bg-surface disabled:opacity-30 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Changes List */}
      <div className="space-y-3">
        {demoChanges.map((ch, i) => (
          <motion.div
            key={ch.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="p-5 rounded-xl border border-border bg-surface-card hover:border-primary/20 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ChangeIcon type={ch.type} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{ch.description}</span>
                    <ChangeTypeBadge type={ch.type} />
                  </div>
                  <span className="text-xs text-neutral-dark">{ch.parcel_id}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/5">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="text-xs font-semibold text-primary">{ch.confidence}%</span>
              </div>
            </div>

            {/* Before → After */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <div className="p-3 rounded-lg bg-surface border border-border">
                <div className="text-[10px] font-semibold text-neutral uppercase tracking-wider mb-1">Before ({ch.before_date})</div>
                <div className="text-sm font-medium">{ch.before_value}</div>
              </div>
              <div className="flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-primary" />
              </div>
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/15">
                <div className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1">After ({ch.after_date})</div>
                <div className="text-sm font-medium">{ch.after_value}</div>
              </div>
            </div>

            <div className="mt-3 text-xs text-neutral">
              Detected by: <span className="font-medium text-foreground/60">{ch.detected_by}</span>
              <span className="ml-2">• Demonstration Inference</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
