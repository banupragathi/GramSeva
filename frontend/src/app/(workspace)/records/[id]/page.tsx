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

function ConfidenceBar({ label, value }: { label: string; value: number }) {
  const color = value >= 90 ? "bg-success" : value >= 80 ? "bg-warning" : value >= 70 ? "bg-[#b87940]" : "bg-error";
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-neutral-dark w-28 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      <span className="text-xs font-semibold w-8 text-right">{value}%</span>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wider">{title}</h3>
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
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back + Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Link href="/records" className="inline-flex items-center gap-1 text-sm text-neutral-dark hover:text-primary mb-4 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to records
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Unified Land Record</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-lg font-semibold text-primary">{parcel.id}</span>
              <span className="text-neutral">•</span>
              <span className="text-sm text-neutral-dark">{parcel.survey_number}</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold text-primary">{parcel.confidence}%</div>
            <div className="text-xs text-neutral-dark">{parcel.match_state.replace(/_/g, " ")}</div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Identity */}
        <Section title="Identity" icon={MapPin}>
          <div className="space-y-3">
            {[
              { label: "Parcel ID", value: parcel.id },
              { label: "Survey Number", value: parcel.survey_number },
              { label: "Owner", value: parcel.owner_name },
              { label: "Last Updated", value: parcel.last_updated },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <span className="text-neutral-dark">{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Land Attributes */}
        <Section title="Land Attributes" icon={Layers}>
          <div className="space-y-3">
            {[
              { label: "Area", value: `${parcel.area_sqm} sq.m` },
              { label: "Land Use", value: parcel.land_use },
              { label: "Road Access", value: parcel.road_access ? "Yes" : "No" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <span className="text-neutral-dark">{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
            <div className="text-xs text-neutral mt-2 italic">Harmonized / Derived values — refer to sources for originals</div>
          </div>
        </Section>

        {/* Building */}
        <Section title="Building Info" icon={Building2}>
          <div className="space-y-3">
            {[
              { label: "Building Count", value: parcel.building_count.toString() },
              { label: "Total Building Area", value: `${parcel.building_area_sqm} sq.m` },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <span className="text-neutral-dark">{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Sources */}
        <Section title="Sources" icon={FileText}>
          <div className="flex flex-wrap gap-2 mb-3">
            {parcel.sources.map((s) => (
              <span key={s} className="px-3 py-1.5 rounded-lg bg-secondary/60 border border-secondary-dark/30 text-xs font-medium">{s}</span>
            ))}
          </div>
          <div className="text-xs text-neutral">
            {parcel.sources.length} sources contributed to this unified record
          </div>
        </Section>

        {/* Confidence + Matching */}
        {evidence && (
          <Section title="Match Evidence" icon={BarChart3}>
            <div className="space-y-2.5 mb-4">
              <ConfidenceBar label="Spatial Match" value={evidence.spatial_match} />
              <ConfidenceBar label="Geometry Match" value={evidence.geometry_match} />
              <ConfidenceBar label="Visual Match" value={evidence.visual_match} />
              <ConfidenceBar label="Attribute Match" value={evidence.attribute_match} />
              <ConfidenceBar label="Temporal" value={evidence.temporal_consistency} />
            </div>
            <div className="space-y-1.5">
              {evidence.reasons.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-neutral-dark">
                  <CheckCircle2 className="w-3 h-3 text-success mt-0.5 flex-shrink-0" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Conflicts */}
        <Section title={`Conflicts (${conflicts.length})`} icon={Shield}>
          {conflicts.length > 0 ? (
            <div className="space-y-3">
              {conflicts.map((c) => (
                <div key={c.id} className="p-3 rounded-lg border border-error/15 bg-error/5">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-3 h-3 text-error" />
                    <span className="text-xs font-semibold capitalize">{c.type}</span>
                    <span className="text-[10px] text-neutral-dark">Δ {c.difference}</span>
                  </div>
                  <p className="text-xs text-neutral-dark">{c.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-dark">No conflicts detected</p>
          )}
        </Section>

        {/* Changes */}
        <Section title={`Changes (${changes.length})`} icon={Clock}>
          {changes.length > 0 ? (
            <div className="space-y-3">
              {changes.map((ch) => (
                <div key={ch.id} className="p-3 rounded-lg border border-info/15 bg-info/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold">{ch.type.replace(/_/g, " ")}</span>
                    <span className="text-xs text-info font-semibold">{ch.confidence}%</span>
                  </div>
                  <p className="text-xs text-neutral-dark">
                    {ch.before_value} → {ch.after_value}
                  </p>
                  <p className="text-[10px] text-neutral mt-1">Detected by: {ch.detected_by} • Demonstration Inference</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-dark">No temporal changes detected</p>
          )}
        </Section>

        {/* Provenance */}
        <Section title="Provenance" icon={GitBranch}>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-neutral-dark">Processing Version</span><span className="font-medium">v1.0.0-demo</span></div>
            <div className="flex justify-between"><span className="text-neutral-dark">Model Version</span><span className="font-medium">evidence-fusion-v1</span></div>
            <div className="flex justify-between"><span className="text-neutral-dark">Normalized CRS</span><span className="font-medium">EPSG:4326</span></div>
            <div className="flex justify-between"><span className="text-neutral-dark">Data Label</span><span className="font-medium text-warning">Synthetic Demonstration</span></div>
          </div>
        </Section>

        {/* Review Status */}
        <Section title="Review Status" icon={Eye}>
          <div className="text-sm">
            {parcel.review_state ? (
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                  parcel.review_state === "APPROVED" ? "bg-success/15 text-success" :
                  parcel.review_state === "PENDING" ? "bg-warning/15 text-warning" :
                  "bg-neutral-light text-neutral-dark"
                }`}>
                  {parcel.review_state}
                </span>
              </div>
            ) : (
              <span className="text-neutral-dark">Not in review queue</span>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}
