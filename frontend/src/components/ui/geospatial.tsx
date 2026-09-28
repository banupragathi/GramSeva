"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  HUD BADGE — High precision telemetry indicator                      */
/*  Inherits existing GramSeva colors (primary, success, warning, etc.) */
/* ------------------------------------------------------------------ */
export interface HudBadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "info" | "error";
  dot?: boolean;
  className?: string;
  title?: string;
}

export function HudBadge({
  children,
  variant = "default",
  dot = false,
  className = "",
  title,
}: HudBadgeProps) {
  const variantStyles = {
    default: "border-border bg-surface/80 text-foreground/80",
    primary: "border-primary/25 bg-primary/8 text-primary",
    secondary: "border-secondary-dark/40 bg-secondary/30 text-foreground",
    success: "border-success/25 bg-success/10 text-success",
    warning: "border-warning/25 bg-warning/10 text-warning",
    info: "border-info/25 bg-info/10 text-info",
    error: "border-error/25 bg-error/10 text-error",
  };

  const dotColors = {
    default: "bg-neutral-dark",
    primary: "bg-primary",
    secondary: "bg-secondary-dark",
    success: "bg-success",
    warning: "bg-warning",
    info: "bg-info",
    error: "bg-error",
  };

  return (
    <span
      title={title}
      className={`hud-badge ${variantStyles[variant]} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} flex-shrink-0 animate-pulse`}
        />
      )}
      <span className="truncate">{children}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  CONFIDENCE GAUGE — Circular or bar meter using existing colors    */
/* ------------------------------------------------------------------ */
export interface ConfidenceGaugeProps {
  value: number; // 0 - 100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function ConfidenceGauge({
  value,
  size = "md",
  showLabel = true,
  className = "",
}: ConfidenceGaugeProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));

  // Inherit existing GramSeva confidence tokens:
  // >90: success (#2d8a56), 75-89: warning (#c0862e), <75: error (#b84040)
  const getColor = (val: number) => {
    if (val >= 90) return "var(--color-success)";
    if (val >= 75) return "var(--color-warning)";
    return "var(--color-error)";
  };

  const strokeColor = getColor(clamped);

  const dim = size === "sm" ? 32 : size === "lg" ? 56 : 42;
  const strokeWidth = size === "sm" ? 3 : size === "lg" ? 4.5 : 3.5;
  const radius = (dim - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className="relative inline-flex items-center justify-center" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="transform -rotate-90">
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            stroke="var(--color-border)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeOpacity={0.6}
          />
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span
          className="absolute font-mono font-bold tracking-tight"
          style={{
            fontSize: size === "sm" ? "0.625rem" : size === "lg" ? "0.875rem" : "0.6875rem",
            color: strokeColor,
          }}
        >
          {clamped}%
        </span>
      </div>
      {showLabel && (
        <div className="flex flex-col">
          <span className="text-[10px] text-neutral-dark uppercase font-semibold tracking-wider">
            Confidence
          </span>
          <span className="text-xs font-semibold" style={{ color: strokeColor }}>
            {clamped >= 90 ? "High Match" : clamped >= 75 ? "Review Flagged" : "Conflict Alert"}
          </span>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TELEMETRY ROW — Monospace GIS data readout                        */
/* ------------------------------------------------------------------ */
export interface TelemetryRowProps {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  badge?: string;
  className?: string;
}

export function TelemetryRow({
  label,
  value,
  icon: Icon,
  badge,
  className = "",
}: TelemetryRowProps) {
  return (
    <div
      className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg border border-border/60 bg-surface/40 hover:bg-surface transition-colors ${className}`}
    >
      <div className="flex items-center gap-2 min-w-0">
        {Icon && <Icon className="w-3.5 h-3.5 text-neutral-dark flex-shrink-0" />}
        <span className="text-xs text-neutral-dark font-medium truncate">{label}</span>
      </div>
      <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
        <span className="font-mono text-xs font-semibold text-foreground tracking-tight">{value}</span>
        {badge && (
          <span className="text-[9px] font-mono px-1 py-0.2 rounded border border-border bg-surface-card text-neutral-dark">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  LIVE RADAR BEACON — Satellite / Sensor sync indicator             */
/* ------------------------------------------------------------------ */
export function LiveRadarBeacon({
  label = "LIVE SATELLITE",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-border/80 bg-surface/70 ${className}`}>
      <span className="radar-dot" />
      <span className="font-mono text-[10px] font-semibold tracking-wider uppercase text-neutral-dark">
        {label}
      </span>
    </div>
  );
}
