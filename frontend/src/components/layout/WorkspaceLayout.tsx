"use client";

import { useState, createContext, useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  LayoutDashboard,
  Database,
  Map,
  Shield,
  Clock,
  ClipboardCheck,
  FileText,
  BarChart3,
  FlaskConical,
  Settings,
  Globe,
  Cpu,
  HardDrive,
  GitBranch,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  User,
  Layers,
  LucideIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  SIDEBAR CONTEXT                                                     */
/* ------------------------------------------------------------------ */
const SidebarContext = createContext<{
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}>({ collapsed: false, setCollapsed: () => {} });

export const useSidebar = () => useContext(SidebarContext);

/* ------------------------------------------------------------------ */
/*  NAV ITEMS                                                           */
/* ------------------------------------------------------------------ */
interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

const mainNav: NavItem[] = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: Database, label: "Data Sources", href: "/data-sources" },
  { icon: Map, label: "Land Map", href: "/map" },
  { icon: Shield, label: "Conflicts", href: "/conflicts" },
  { icon: Clock, label: "Changes", href: "/changes" },
  { icon: ClipboardCheck, label: "Review Queue", href: "/review" },
  { icon: FileText, label: "Unified Records", href: "/records" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: FlaskConical, label: "Evaluation", href: "/evaluation" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

interface SystemStatus {
  label: string;
  icon: LucideIcon;
  status: "operational" | "ready" | "connected" | "healthy";
}

const systemStatuses: SystemStatus[] = [
  { label: "GIS Engine", icon: Globe, status: "operational" },
  { label: "AI Engine", icon: Cpu, status: "ready" },
  { label: "PostGIS", icon: HardDrive, status: "connected" },
  { label: "Data Pipeline", icon: GitBranch, status: "healthy" },
];

/* ------------------------------------------------------------------ */
/*  SIDEBAR ITEM                                                        */
/* ------------------------------------------------------------------ */
function SidebarItem({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

  return (
    <Link
      href={item.href}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
        ${isActive
          ? "bg--[#21700F] text-white shadow-sm shadow--[#860F61]/20 font-semibold"
          : "text--[#860F61]/75 hover:bg--[#5E0A44]/10 hover:text--[#860F61]"
        }
        ${collapsed ? "justify-center" : ""}
      `}
      title={collapsed ? item.label : undefined}
    >
      <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? "text-white" : "text--[#21700F]"}`} />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  WORKSPACE LAYOUT                                                    */
/* ------------------------------------------------------------------ */
export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [viewMode3D, setViewMode3D] = useState(false);
  const collapsed = sidebarCollapsed;
  const setCollapsed = setSidebarCollapsed;
  const pathname = usePathname();

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <div className="h-screen flex flex-col overflow-hidden bg-[#F4E9D8] text--[#860F61]">
        {/* ========== TOP BAR ========== */}
        <header className="h-14 border-b border--[#860F61]/10 bg-white/95 backdrop-blur-md flex items-center px-4 gap-4 z-40 flex-shrink-0 shadow-sm shadow--[#860F61]/5">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 mr-4">
            <Image
              src="/logo.png"
              alt="GramSeva Logo"
              width={130}
              height={36}
              className="object-contain"
            />
            <div className="flex flex-col">
              <span className="text-[10px] text--[#21700F]/80 font-medium hidden sm:block">SIH26013</span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text--[#21700F]/60" />
              <input
                type="text"
                placeholder="Ask GramSeva about land parcels, conflicts, or layers..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border--[#860F61]/15 bg-[#FFFFFF] text-sm text--[#860F61] focus:outline-none focus:ring-2 focus:ring--[#21700F]/30 focus:border--[#21700F] transition-all placeholder:text--[#860F61]/40 shadow-inner"
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 relative">
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-lg hover:bg--[#FBF6EE] text--[#5E0A44] transition-colors relative" 
                title="Notifications"
              >
                <Bell className="w-4.5 h-4.5 text--[#5E0A44]" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg--[#21700F] rounded-full ring-2 ring-white" />
              </button>
              
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-72 bg-white border border--[#860F61]/15 rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="p-3 border-b border--[#860F61]/10 font-semibold text-sm text--[#860F61] flex justify-between items-center bg--[#FBF6EE]/50">
                      <span>Notifications</span>
                      <span className="text-[10px] bg--[#F3E3EC] text--[#5E0A44] font-bold px-2 py-0.5 rounded-full">2 New</span>
                    </div>
                    <div className="p-3 text-xs border-b border--[#860F61]/10 hover:bg--[#FBF6EE]/60 transition-colors cursor-pointer">
                      <div className="font-semibold text--[#860F61] mb-0.5">Automated Match Found</div>
                      <div className="text--[#5E0A44]/80">Survey no. 245 successfully matched with high confidence.</div>
                      <div className="text--[#21700F] text-[10px] mt-1">10 mins ago</div>
                    </div>
                    <div className="p-3 text-xs hover:bg--[#FBF6EE]/60 transition-colors cursor-pointer">
                      <div className="font-semibold mb-0.5 text-amber-700">New Conflict Detected</div>
                      <div className="text--[#5E0A44]/80">Boundary conflict reported on Survey no. 88.</div>
                      <div className="text--[#21700F] text-[10px] mt-1">1 hour ago</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={() => {
                setViewMode3D(!viewMode3D);
                alert(viewMode3D ? "Switched to standard 2D view." : "3D Cesium Integration Pending.");
              }}
              className={`p-2 rounded-lg transition-colors ${viewMode3D ? 'bg--[#F3E3EC] text--[#5E0A44] font-semibold' : 'hover:bg--[#FBF6EE] text--[#5E0A44]'}`}
              title="Toggle 2D/3D"
            >
              <Layers className="w-4.5 h-4.5" />
            </button>

            <div className="w-8 h-8 rounded-full bg--[#F3E3EC] border border--[#F3E3EC]/50 flex items-center justify-center cursor-pointer hover:bg--[#F3E3EC] transition-colors">
              <User className="w-4 h-4 text--[#5E0A44]" />
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* ========== LEFT SIDEBAR ========== */}
          <aside
            className={`
              border-r border--[#860F61]/10 bg-[#FBF6EE] flex flex-col transition-all duration-300 flex-shrink-0 shadow-sm
              ${collapsed ? "w-14" : "w-56"}
            `}
          >
            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
              {mainNav.map((item) => (
                <SidebarItem key={item.href} item={item} collapsed={collapsed} />
              ))}
            </nav>

            {/* System Status */}
            {!collapsed && (
              <div className="px-3 py-3 border-t border--[#860F61]/10 bg--[#860F61]/5">
                <div className="text-[10px] font-bold text--[#5E0A44]/80 uppercase tracking-wider mb-2">System Status</div>
                <div className="space-y-1.5">
                  {systemStatuses.map((s) => (
                    <div key={s.label} className="flex items-center gap-2 text-xs text--[#860F61] font-medium">
                      <div className="w-2 h-2 rounded-full bg--[#FBF6EE]0 ring-2 ring--[#F3E3EC] animate-pulse" />
                      <span>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Collapse toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-3 border-t border--[#860F61]/10 hover:bg--[#5E0A44]/10 transition-colors flex items-center justify-center text--[#5E0A44]"
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </aside>

          {/* ========== MAIN CONTENT ========== */}
          <main className="flex-1 overflow-auto bg-[#F4E9D8]">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}

