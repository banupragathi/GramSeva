"use client";

import { motion } from "framer-motion";
import { Settings, User, Globe, Database, Cpu, Bell, Shield, Download } from "lucide-react";

function SettingSection({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border--[#860F61]/10 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text--[#21700F]" />
        <h3 className="text-sm font-bold text--[#860F61]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold text--[#860F61] mb-1">Settings</h1>
        <p className="text-sm font-medium text--[#5E0A44] mb-8">Platform and workspace configuration</p>
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
                <span className="text-sm font-medium text--[#5E0A44]">{w.label}</span>
                <input
                  type="text"
                  defaultValue={w.value}
                  className="w-20 px-3 py-1.5 rounded-lg border border--[#860F61]/10 bg-[#F8FAFC] text-sm text-right focus:outline-none focus:ring-2 focus:ring--[#21700F]/30 text--[#860F61] font-bold"
                />
              </div>
            ))}
            <p className="text-xs text--[#21700F] font-medium italic">
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
                <span className="text-sm font-medium text--[#5E0A44]">{t.label}</span>
                <input
                  type="text"
                  defaultValue={t.value}
                  className="w-20 px-3 py-1.5 rounded-lg border border--[#860F61]/10 bg-[#F8FAFC] text-sm text-right focus:outline-none focus:ring-2 focus:ring--[#21700F]/30 text--[#860F61] font-bold"
                />
              </div>
            ))}
          </div>
        </SettingSection>

        <SettingSection title="Map Settings" icon={Globe}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text--[#5E0A44]">Default CRS</span>
              <span className="text-sm font-bold text--[#860F61]">EPSG:4326 (WGS84)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text--[#5E0A44]">Map Style</span>
              <select className="px-3 py-1.5 rounded-lg border border--[#860F61]/10 bg-[#F8FAFC] text-sm focus:outline-none focus:ring-2 focus:ring--[#21700F]/30 text--[#860F61] font-bold">
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
              <span className="text-sm font-medium text--[#5E0A44]">Default Export Format</span>
              <select className="px-3 py-1.5 rounded-lg border border--[#860F61]/10 bg-[#F8FAFC] text-sm focus:outline-none focus:ring-2 focus:ring--[#21700F]/30 text--[#860F61] font-bold">
                <option>GeoJSON</option>
                <option>CSV</option>
                <option>JSON</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text--[#5E0A44]">Include Provenance</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent--[#21700F] rounded" />
            </div>
          </div>
        </SettingSection>
      </div>
    </div>
  );
}

