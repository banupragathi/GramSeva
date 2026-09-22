"use client";

import { useState, createContext, useContext } from "react";
import Link from "next/link";
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
        flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
        ${isActive
          ? "bg-primary/10 text-primary"
          : "text-foreground/60 hover:bg-primary/5 hover:text-foreground/80"
        }
        ${collapsed ? "justify-center" : ""}
      `}
      title={collapsed ? item.label : undefined}
    >
      <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? "text-primary" : ""}`} />
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
      <div className="h-screen flex flex-col overflow-hidden bg-background">
        {/* ========== TOP BAR ========== */}
        <header className="h-14 border-b border-border bg-surface-card flex items-center px-4 gap-4 z-40 flex-shrink-0">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 mr-4">
            <div className="w-7 h-7 rounded-lg bg-gradient-primary flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight hidden sm:block">GramSeva</span>
            <span className="text-[10px] text-neutral hidden sm:block">SIH26013</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral" />
              <input
                type="text"
                placeholder="Ask GramSeva about this map..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-neutral"
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 relative">
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-lg hover:bg-surface transition-colors relative" 
                title="Notifications"
              >
                <Bell className="w-4 h-4 text-neutral-dark" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
              </button>
              
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-72 bg-surface-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="p-3 border-b border-border font-semibold text-sm flex justify-between items-center">
                      <span>Notifications</span>
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">2 New</span>
                    </div>
                    <div className="p-3 text-xs border-b border-border hover:bg-surface transition-colors cursor-pointer">
                      <div className="font-semibold mb-0.5">Automated Match Found</div>
                      <div className="text-neutral-dark">Survey no. 245 successfully matched with high confidence.</div>
                      <div className="text-neutral text-[10px] mt-1">10 mins ago</div>
                    </div>
                    <div className="p-3 text-xs hover:bg-surface transition-colors cursor-pointer">
                      <div className="font-semibold mb-0.5 text-warning">New Conflict Detected</div>
                      <div className="text-neutral-dark">Boundary conflict reported on Survey no. 88.</div>
                      <div className="text-neutral text-[10px] mt-1">1 hour ago</div>
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
              className={`p-2 rounded-lg transition-colors ${viewMode3D ? 'bg-primary/10 text-primary' : 'hover:bg-surface text-neutral-dark'}`}
              title="Toggle 2D/3D"
            >
              <Layers className="w-4 h-4" />
            </button>

            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors">
              <User className="w-3.5 h-3.5 text-primary" />
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* ========== LEFT SIDEBAR ========== */}
          <aside
            className={`
              border-r border-border bg-surface-card flex flex-col transition-all duration-300 flex-shrink-0
              ${collapsed ? "w-14" : "w-56"}
            `}
          >
            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
              {mainNav.map((item) => (
                <SidebarItem key={item.href} item={item} collapsed={collapsed} />
              ))}
            </nav>

            {/* System Status */}
            {!collapsed && (
              <div className="px-3 py-3 border-t border-border">
                <div className="text-[10px] font-semibold text-neutral uppercase tracking-wider mb-2">System</div>
                <div className="space-y-1">
                  {systemStatuses.map((s) => (
                    <div key={s.label} className="flex items-center gap-2 text-xs text-neutral-dark">
                      <div className="w-1.5 h-1.5 rounded-full bg-success pulse-status" />
                      <span>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Collapse toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-3 border-t border-border hover:bg-surface transition-colors flex items-center justify-center"
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4 text-neutral-dark" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-neutral-dark" />
              )}
            </button>
          </aside>

          {/* ========== MAIN CONTENT ========== */}
          <main className="flex-1 overflow-auto">
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
