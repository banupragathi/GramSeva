"use client";

import { motion } from "framer-motion";
import { Settings, User, Globe, Database, Cpu, Bell, Shield, Download } from "lucide-react";

function SettingSection({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-purple-900/10 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-purple-600" />
        <h3 className="text-sm font-bold text-purple-950">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold text-purple-950 mb-1">Settings</h1>
        <p className="text-sm font-medium text-purple-800 mb-8">Platform and workspace configuration</p>
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
                <span className="text-sm font-medium text-purple-800">{w.label}</span>
                <input
                  type="text"
                  defaultValue={w.value}
                  className="w-20 px-3 py-1.5 rounded-lg border border-purple-900/10 bg-[#F8FAFC] text-sm text-right focus:outline-none focus:ring-2 focus:ring-purple-600/30 text-purple-950 font-bold"
                />
              </div>
            ))}
            <p className="text-xs text-purple-600 font-medium italic">
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
                <span className="text-sm font-medium text-purple-800">{t.label}</span>
                <input
                  type="text"
                  defaultValue={t.value}
                  className="w-20 px-3 py-1.5 rounded-lg border border-purple-900/10 bg-[#F8FAFC] text-sm text-right focus:outline-none focus:ring-2 focus:ring-purple-600/30 text-purple-950 font-bold"
                />
              </div>
            ))}
          </div>
        </SettingSection>

        <SettingSection title="Map Settings" icon={Globe}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-purple-800">Default CRS</span>
              <span className="text-sm font-bold text-purple-950">EPSG:4326 (WGS84)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-purple-800">Map Style</span>
              <select className="px-3 py-1.5 rounded-lg border border-purple-900/10 bg-[#F8FAFC] text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/30 text-purple-950 font-bold">
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
              <span className="text-sm font-medium text-purple-800">Default Export Format</span>
              <select className="px-3 py-1.5 rounded-lg border border-purple-900/10 bg-[#F8FAFC] text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/30 text-purple-950 font-bold">
                <option>GeoJSON</option>
                <option>CSV</option>
                <option>JSON</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-purple-800">Include Provenance</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-purple-600 rounded" />
            </div>
          </div>
        </SettingSection>
      </div>
    </div>
  );
}

