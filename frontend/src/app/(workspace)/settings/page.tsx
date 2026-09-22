"use client";

import { motion } from "framer-motion";
import { Settings, User, Globe, Database, Cpu, Bell, Shield, Download } from "lucide-react";

function SettingSection({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-1">Settings</h1>
        <p className="text-sm text-neutral-dark mb-8">Platform and workspace configuration</p>
      </motion.div>

      <div className="space-y-5">
        <SettingSection title="Matching Engine" icon={Cpu}>
          <div className="space-y-4">
            {[
              { label: "Geometry Weight", value: "40%", key: "geo" },
              { label: "Attributes Weight", value: "20%", key: "attr" },
              { label: "Visual Weight", value: "20%", key: "vis" },
              { label: "Temporal Weight", value: "10%", key: "temp" },
              { label: "Context Weight", value: "10%", key: "ctx" },
            ].map((w) => (
              <div key={w.key} className="flex items-center justify-between">
                <span className="text-sm text-neutral-dark">{w.label}</span>
                <input
                  type="text"
                  defaultValue={w.value}
                  className="w-20 px-3 py-1.5 rounded-lg border border-border bg-surface text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            ))}
            <p className="text-xs text-neutral italic">
              Prototype weights — not scientifically validated. Configurable for experimentation.
            </p>
          </div>
        </SettingSection>

        <SettingSection title="Match Thresholds" icon={Shield}>
          <div className="space-y-3">
            {[
              { label: "Matched (≥)", value: "90%" },
              { label: "Likely Match (≥)", value: "80%" },
              { label: "Review Required (≥)", value: "60%" },
              { label: "Not Matched (<)", value: "60%" },
            ].map((t) => (
              <div key={t.label} className="flex items-center justify-between">
                <span className="text-sm text-neutral-dark">{t.label}</span>
                <input
                  type="text"
                  defaultValue={t.value}
                  className="w-20 px-3 py-1.5 rounded-lg border border-border bg-surface text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            ))}
          </div>
        </SettingSection>

        <SettingSection title="Map Settings" icon={Globe}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-dark">Default CRS</span>
              <span className="text-sm font-medium">EPSG:4326 (WGS84)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-dark">Map Style</span>
              <select className="px-3 py-1.5 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option>OpenStreetMap</option>
                <option>Satellite</option>
                <option>Dark</option>
              </select>
            </div>
          </div>
        </SettingSection>

        <SettingSection title="Export" icon={Download}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-dark">Default Export Format</span>
              <select className="px-3 py-1.5 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option>GeoJSON</option>
                <option>CSV</option>
                <option>JSON</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-dark">Include Provenance</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" />
            </div>
          </div>
        </SettingSection>
      </div>
    </div>
  );
}
