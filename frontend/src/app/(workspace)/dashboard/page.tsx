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
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  STAT CARD                                                           */
/* ------------------------------------------------------------------ */
function StatCard({
  icon: Icon,
  label,
  value,
  change,
  color,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  change?: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="p-5 rounded-xl border border-border bg-surface-card hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-4.5 h-4.5" style={{ color }} />
        </div>
        {change && (
          <span className="text-xs font-medium text-success flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            {change}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold mb-0.5">{value}</div>
      <div className="text-xs text-neutral-dark font-medium">{label}</div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  QUICK ACTION                                                       */
/* ------------------------------------------------------------------ */
function QuickAction({
  icon: Icon,
  label,
  description,
  href,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  href: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Link
        href={href}
        className="group flex items-center gap-4 p-4 rounded-xl border border-border bg-surface-card hover:border-primary/30 hover:shadow-md transition-all"
      >
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold">{label}</div>
          <div className="text-xs text-neutral-dark">{description}</div>
        </div>
        <ArrowRight className="w-4 h-4 text-neutral group-hover:text-primary transition-colors" />
      </Link>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  RECENT ACTIVITY ITEM                                               */
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
    upload: "bg-info/15 text-info",
    conflict: "bg-error/15 text-error",
    review: "bg-warning/15 text-warning",
    process: "bg-primary/15 text-primary",
    match: "bg-success/15 text-success",
  };

  const icons = {
    upload: Database,
    conflict: AlertTriangle,
    review: ClipboardCheck,
    process: Activity,
    match: CheckCircle2,
  };

  const StatusIcon = icons[type];

  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${colors[type]}`}>
        <StatusIcon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-foreground/80">{description}</div>
        <div className="text-xs text-neutral mt-0.5">{time}</div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  DASHBOARD PAGE                                                      */
/* ================================================================== */
export default function DashboardPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold mb-1">Overview</h1>
        <p className="text-sm text-neutral-dark">
          GramSeva intelligence summary • <span className="text-warning text-xs font-medium">Demo Dataset</span>
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard icon={Database} label="Total Sources" value="6" color="#860F61" delay={0} />
        <StatCard icon={Layers} label="Parcels" value="1,247" color="#4a7fb5" delay={0.05} />
        <StatCard icon={GitMerge} label="Matched Entities" value="1,089" change="+87%" color="#2d8a56" delay={0.1} />
        <StatCard icon={Shield} label="Conflicts" value="43" color="#b84040" delay={0.15} />
        <StatCard icon={Clock} label="Changes Detected" value="28" color="#c0862e" delay={0.2} />
        <StatCard icon={ClipboardCheck} label="Review Required" value="15" color="#b87940" delay={0.25} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold text-neutral-dark uppercase tracking-wider mb-3">Quick Actions</h2>
          <QuickAction
            icon={Map}
            label="Open Land Map"
            description="Interactive GIS workspace with all layers"
            href="/map"
            delay={0.1}
          />
          <QuickAction
            icon={Database}
            label="Upload Dataset"
            description="Add a new geospatial data source"
            href="/data-sources"
            delay={0.15}
          />
          <QuickAction
            icon={Shield}
            label="View Conflicts"
            description="43 conflicts require attention"
            href="/conflicts"
            delay={0.2}
          />
          <QuickAction
            icon={ClipboardCheck}
            label="Review Queue"
            description="15 items waiting for human review"
            href="/review"
            delay={0.25}
          />
          <QuickAction
            icon={BarChart3}
            label="Analytics"
            description="Processing statistics and insights"
            href="/analytics"
            delay={0.3}
          />
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-sm font-semibold text-neutral-dark uppercase tracking-wider mb-3">Recent Activity</h2>
          <div className="rounded-xl border border-border bg-surface-card p-4 divide-y divide-border">
            <ActivityItem time="09:54" description="Reviewer resolved boundary conflict — TN-1042" type="review" />
            <ActivityItem time="09:51" description="Conflict detected — area mismatch 5.58%" type="conflict" />
            <ActivityItem time="09:49" description="Harmonization completed — batch 3" type="process" />
            <ActivityItem time="09:47" description="Geometry validated — 234 records" type="match" />
            <ActivityItem time="09:45" description="CRS normalized EPSG:32644 → EPSG:4326" type="process" />
            <ActivityItem time="09:44" description="CRS detected — EPSG:32644 (UTM Zone 44N)" type="process" />
            <ActivityItem time="09:42" description="Dataset uploaded — cadastral_tn_2024.geojson" type="upload" />
          </div>
        </div>
      </div>
    </div>
  );
}
