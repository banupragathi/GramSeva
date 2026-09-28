"use client";

import { use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Building2,
  Clock,
  Shield,
  FileText,
  Eye,
  BarChart3,
  GitBranch,
  Layers,
} from "lucide-react";
import { demoParcels, demoMatchEvidence, demoConflicts, demoChanges } from "@/lib/demo-data";
import { HudBadge, LiveRadarBeacon } from "@/components/ui/geospatial";

function ConfidenceBar({ label, value }: { label: string; value: number }) {
  const color = value >= 90 ? "bg-success" : value >= 80 ? "bg-warning" : value >= 70 ? "bg-[#b87940]" : "bg-error";
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-mono text-neutral-dark w-28 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      <span className="text-xs font-mono font-bold w-10 text-right">{value}%</span>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface-card p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
        <Icon className="w-4 h-4 text-primary" />
        <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-neutral-dark">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function RecordDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const parcel = demoParcels.features.find((f) => f.properties.id === id)?.properties;

  if (!parcel) {
    return (
      <div className="p-6 text-center">
        <p className="text-neutral-dark">Parcel not found</p>
        <Link href="/records" className="text-primary text-sm mt-2 inline-block">← Back to records</Link>
      </div>
    );
  }

  const evidence = demoMatchEvidence[id] || null;
  const conflicts = demoConflicts.filter((c) => c.parcel_id === id);
  const changes = demoChanges.filter((c) => c.parcel_id === id);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Back + Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Link href="/records" className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-dark hover:text-primary mb-4 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to records registry
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <LiveRadarBeacon />
              <HudBadge variant="info">Harmonized Ledger</HudBadge>
              <span className="font-mono text-[10px] text-neutral">EPSG:4326</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Parcel {parcel.id}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="font-mono text-xs font-semibold text-primary">{parcel.survey_number}</span>
              <span className="text-neutral">•</span>
              <span className="text-xs text-neutral-dark">{parcel.owner_name}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-surface p-3 rounded-xl border border-border">
            <div className="text-right">
              <div className="font-mono text-2xl font-bold text-primary tabular-nums">{parcel.confidence}%</div>
              <div className="font-mono text-[10px] text-neutral-dark uppercase tracking-wider">{parcel.match_state.replace(/_/g, " ")}</div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Identity */}
        <Section title="Identity & Cadastral" icon={MapPin}>
          <div className="space-y-3 font-mono text-xs">
            {[
              { label: "Parcel ID", value: parcel.id },
              { label: "Survey Number", value: parcel.survey_number },
              { label: "Owner Entity", value: parcel.owner_name },
              { label: "Last Sync", value: parcel.last_updated },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-neutral-dark font-sans">{item.label}</span>
                <span className="font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Land Attributes */}
        <Section title="Spatial Attributes" icon={Layers}>
          <div className="space-y-3 font-mono text-xs">
            {[
              { label: "Area", value: `${parcel.area_sqm.toLocaleString()} sq.m` },
              { label: "Land Use", value: parcel.land_use },
              { label: "Road Access", value: parcel.road_access ? "Verified (Direct)" : "No Access" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-neutral-dark font-sans">{item.label}</span>
                <span className="font-semibold">{item.value}</span>
              </div>
            ))}
            <div className="text-[11px] font-sans text-neutral mt-2 italic">Harmonized / Derived values — refer to sources for originals</div>
          </div>
        </Section>

        {/* Building */}
        <Section title="Building & Structural" icon={Building2}>
          <div className="space-y-3 font-mono text-xs">
            {[
              { label: "Building Count", value: parcel.building_count.toString() },
              { label: "Building Footprint", value: `${parcel.building_area_sqm} sq.m` },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-neutral-dark font-sans">{item.label}</span>
                <span className="font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Sources */}
        <Section title="Contributing Data Sources" icon={FileText}>
          <div className="flex flex-wrap gap-2 mb-3">
            {parcel.sources.map((s) => (
              <span key={s} className="px-2.5 py-1 rounded-lg bg-surface border border-border text-xs font-mono font-medium">{s}</span>
            ))}
          </div>
          <div className="text-xs text-neutral-dark">
            {parcel.sources.length} active pipelines contributed to this harmonized record
          </div>
        </Section>

        {/* Confidence + Matching */}
        {evidence && (
          <Section title="Match Evidence Breakdown" icon={BarChart3}>
            <div className="space-y-2.5 mb-4">
              <ConfidenceBar label="Spatial Match" value={evidence.spatial_match} />
              <ConfidenceBar label="Geometry Match" value={evidence.geometry_match} />
              <ConfidenceBar label="Visual Match" value={evidence.visual_match} />
              <ConfidenceBar label="Attribute Match" value={evidence.attribute_match} />
              <ConfidenceBar label="Temporal" value={evidence.temporal_consistency} />
            </div>
            <div className="space-y-1.5 pt-2 border-t border-border">
              {evidence.reasons.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-neutral-dark">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success mt-0.5 flex-shrink-0" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Conflicts */}
        <Section title={`Conflicts Detected (${conflicts.length})`} icon={Shield}>
          {conflicts.length > 0 ? (
            <div className="space-y-3">
              {conflicts.map((c) => (
                <div key={c.id} className="p-3 rounded-lg border border-error/15 bg-error/5">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-error" />
                    <span className="text-xs font-mono font-semibold capitalize">{c.type}</span>
                    <span className="font-mono text-[10px] text-neutral-dark">Δ {c.difference}</span>
                  </div>
                  <p className="text-xs text-neutral-dark">{c.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-dark">No boundary or attribute conflicts detected for this parcel.</p>
          )}
        </Section>

        {/* Changes */}
        <Section title={`Temporal Evolution (${changes.length})`} icon={Clock}>
          {changes.length > 0 ? (
            <div className="space-y-3">
              {changes.map((ch) => (
                <div key={ch.id} className="p-3 rounded-lg border border-info/15 bg-info/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-semibold">{ch.type.replace(/_/g, " ")}</span>
                    <span className="font-mono text-xs text-info font-semibold">{ch.confidence}%</span>
                  </div>
                  <p className="text-xs text-neutral-dark">
                    {ch.before_value} → {ch.after_value}
                  </p>
                  <p className="font-mono text-[10px] text-neutral mt-1">Detector: {ch.detected_by}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-dark">No historical shifts detected.</p>
          )}
        </Section>

        {/* Provenance */}
        <Section title="Ledger Provenance" icon={GitBranch}>
          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between"><span className="text-neutral-dark font-sans">Processing Version</span><span className="font-medium">v1.0.0-demo</span></div>
            <div className="flex justify-between"><span className="text-neutral-dark font-sans">Model Engine</span><span className="font-medium">evidence-fusion-v1</span></div>
            <div className="flex justify-between"><span className="text-neutral-dark font-sans">Normalized CRS</span><span className="font-medium">EPSG:4326</span></div>
            <div className="flex justify-between"><span className="text-neutral-dark font-sans">Ledger State</span><span className="font-medium text-success">Verified</span></div>
          </div>
        </Section>

        {/* Review Status */}
        <Section title="Validation Status" icon={Eye}>
          <div className="text-xs">
            {parcel.review_state ? (
              <div className="flex items-center gap-2">
                <span className={`font-mono text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
                  parcel.review_state === "APPROVED" ? "bg-success/15 text-success border-success/30" :
                  parcel.review_state === "PENDING" ? "bg-warning/15 text-warning border-warning/30" :
                  "bg-neutral/10 text-neutral-dark border-border"
                }`}>
                  {parcel.review_state}
                </span>
              </div>
            ) : (
              <span className="text-neutral-dark font-mono">Not in review queue</span>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}
