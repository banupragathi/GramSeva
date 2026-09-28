"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Database,
  Map,
  GitMerge,
  Shield,
  Clock,
  ClipboardCheck,
  ArrowRight,
  TrendingUp,
  Layers,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Activity,
  Cpu,
  Zap,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  TELEMETRY STAT CARD — HUD style                                     */
/* ------------------------------------------------------------------ */
function StatCard({
  icon: Icon,
  label,
  value,
  change,
  color,
  delay,
  mono,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  change?: string;
  color: string;
  delay: number;
  mono?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: "easeOut" }}
      className="relative p-4 rounded-xl border border-border bg-surface-card hover:border-primary/25 hover:shadow-lg transition-all group overflow-hidden"
    >
      {/* Corner accent */}
      <div
        className="absolute top-0 left-0 w-0.5 h-10 rounded-b-full opacity-60"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-start justify-between mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}18` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        {change && (
          <span className="text-[10px] font-semibold text-success flex items-center gap-0.5 bg-success/10 px-1.5 py-0.5 rounded-md border border-success/20">
            <TrendingUp className="w-2.5 h-2.5" />
            {change}
          </span>
        )}
      </div>

      <div className="text-[26px] font-bold tracking-tight leading-none mb-1">{value}</div>

      <div className="flex items-center justify-between">
        <div className="text-[11px] text-neutral-dark font-medium">{label}</div>
        {mono && (
          <span className="font-mono text-[9px] text-neutral tracking-wider">{mono}</span>
        )}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  QUICK ACTION — refined card                                         */
/* ------------------------------------------------------------------ */
function QuickAction({
  icon: Icon,
  label,
  description,
  href,
  delay,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  href: string;
  delay: number;
  badge?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3, ease: "easeOut" }}
    >
      <Link
        href={href}
        className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-surface-card hover:border-primary/30 hover:bg-primary/3 hover:shadow-md transition-all"
      >
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/18 transition-colors">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold">{label}</span>
            {badge && (
              <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/8 text-primary/80 border border-primary/15">
                {badge}
              </span>
            )}
          </div>
          <div className="text-[11px] text-neutral-dark mt-0.5">{description}</div>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-neutral group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
      </Link>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  ACTIVITY ITEM                                                        */
/* ------------------------------------------------------------------ */
function ActivityItem({
  time,
  description,
  type,
}: {
  time: string;
  description: string;
  type: "upload" | "conflict" | "review" | "process" | "match";
}) {
  const colors = {
    upload:   { bg: "bg-info/12 text-info",      dot: "bg-info" },
    conflict: { bg: "bg-error/12 text-error",     dot: "bg-error" },
    review:   { bg: "bg-warning/12 text-warning", dot: "bg-warning" },
    process:  { bg: "bg-primary/12 text-primary", dot: "bg-primary" },
    match:    { bg: "bg-success/12 text-success", dot: "bg-success" },
  };

  const icons = {
    upload:   Database,
    conflict: AlertTriangle,
    review:   ClipboardCheck,
    process:  Activity,
    match:    CheckCircle2,
  };

  const StatusIcon = icons[type];

  return (
    <div className="flex items-start gap-2.5 py-2.5 group">
      <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${colors[type].bg}`}>
        <StatusIcon className="w-3 h-3" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] text-foreground/80 leading-snug">{description}</div>
        <div className="font-mono text-[10px] text-neutral mt-0.5 tracking-wider">{time}</div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  DASHBOARD PAGE                                                      */
/* ================================================================== */
export default function DashboardPage() {
  return (
    <div className="p-5 max-w-7xl mx-auto space-y-6">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="radar-dot" />
            <span className="font-mono text-[10px] text-primary/70 tracking-widest uppercase">Live Dashboard</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Geospatial Command Overview</h1>
          <p className="text-[12px] text-neutral-dark mt-0.5">
            GramSeva intelligence summary •{" "}
            <span className="text-warning font-semibold font-mono text-[10px]">DEMO DATASET</span>
          </p>
        </div>
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface-card">
          <Cpu className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] font-semibold text-primary">AI ACTIVE</span>
          <Zap className="w-3 h-3 text-warning" />
        </div>
      </motion.div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard icon={Database}       label="Total Sources"    value="6"     color="#860F61" delay={0}    mono="SRC" />
        <StatCard icon={Layers}         label="Parcels"          value="1,247" color="#4a7fb5" delay={0.04} mono="GEO" />
        <StatCard icon={GitMerge}       label="Matched Entities" value="1,089" change="+87%"  color="#2d8a56" delay={0.08} mono="ENT" />
        <StatCard icon={Shield}         label="Conflicts"        value="43"    color="#b84040" delay={0.12} mono="ERR" />
        <StatCard icon={Clock}          label="Changes"          value="28"    color="#c0862e" delay={0.16} mono="CHG" />
        <StatCard icon={ClipboardCheck} label="Review Required"  value="15"    color="#b87940" delay={0.20} mono="REV" />
      </div>

      {/* ── Main content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[10px] font-semibold text-neutral uppercase tracking-widest">Command Links</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <QuickAction icon={Map}           label="Open Land Map"    description="Interactive GIS workspace with all layers"   href="/map"          delay={0.08} />
          <QuickAction icon={Database}      label="Upload Dataset"   description="Add a new geospatial data source"            href="/data-sources" delay={0.12} />
          <QuickAction icon={Shield}        label="View Conflicts"   description="43 conflicts require attention"              href="/conflicts"    delay={0.16} badge="43" />
          <QuickAction icon={ClipboardCheck} label="Review Queue"   description="15 items waiting for human review"          href="/review"       delay={0.20} badge="15" />
          <QuickAction icon={BarChart3}     label="Analytics"        description="Processing statistics and insights"          href="/analytics"    delay={0.24} />
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[10px] font-semibold text-neutral uppercase tracking-widest">Event Log</span>
            <div className="flex-1 h-px bg-border" />
            <span className="radar-dot" />
          </div>
          <div className="rounded-xl border border-border bg-surface-card px-4 py-1 divide-y divide-border/60">
            <ActivityItem time="09:54" description="Reviewer resolved boundary conflict — TN-1042" type="review" />
            <ActivityItem time="09:51" description="Conflict detected — area mismatch 5.58%" type="conflict" />
            <ActivityItem time="09:49" description="Harmonization completed — batch 3" type="process" />
            <ActivityItem time="09:47" description="Geometry validated — 234 records" type="match" />
            <ActivityItem time="09:45" description="CRS normalized EPSG:32644 → EPSG:4326" type="process" />
            <ActivityItem time="09:44" description="CRS detected — EPSG:32644 (UTM 44N)" type="process" />
            <ActivityItem time="09:42" description="Dataset uploaded — cadastral_tn_2024.geojson" type="upload" />
          </div>
        </div>
      </div>
    </div>
  );
}
