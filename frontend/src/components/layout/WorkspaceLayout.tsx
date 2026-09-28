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
  Activity,
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
  badge?: string;
}

const mainNav: NavItem[] = [
  { icon: LayoutDashboard, label: "Overview",         href: "/dashboard" },
  { icon: Database,        label: "Data Sources & AI", href: "/data-sources" },
  { icon: Map,             label: "Land Map",           href: "/map" },
  { icon: Shield,          label: "Conflicts",          href: "/conflicts",  badge: "43" },
  { icon: Clock,           label: "Changes",            href: "/changes",    badge: "28" },
  { icon: ClipboardCheck,  label: "Review Queue",       href: "/review",     badge: "15" },
  { icon: FileText,        label: "Unified Records",    href: "/records" },
  { icon: BarChart3,       label: "Analytics",          href: "/analytics" },
  { icon: FlaskConical,    label: "Model Evaluation",   href: "/evaluation" },
  { icon: Settings,        label: "Settings",           href: "/settings" },
];

interface SystemStatus {
  label: string;
  icon: LucideIcon;
  mono: string;
}

const systemStatuses: SystemStatus[] = [
  { label: "GIS Engine",    icon: Globe,     mono: "OPERATIONAL" },
  { label: "AI Engine",     icon: Cpu,       mono: "READY" },
  { label: "PostGIS",       icon: HardDrive, mono: "CONNECTED" },
  { label: "Data Pipeline", icon: GitBranch, mono: "HEALTHY" },
];

/* ------------------------------------------------------------------ */
/*  SIDEBAR ITEM — upgraded with active indicator and badge            */
/* ------------------------------------------------------------------ */
function SidebarItem({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname();
  const isActive =
    pathname === item.href ||
    (item.href !== "/dashboard" && pathname.startsWith(item.href));

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={`
        relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium
        transition-all duration-150 group
        ${isActive
          ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(134,15,97,0.15)]"
          : "text-foreground/55 hover:bg-primary/5 hover:text-foreground/80"
        }
        ${collapsed ? "justify-center" : ""}
      `}
    >
      {/* Active left-edge accent */}
      {isActive && !collapsed && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-primary" />
      )}

      <item.icon
        className={`flex-shrink-0 transition-colors ${
          isActive ? "text-primary" : "text-neutral-dark group-hover:text-foreground/70"
        }`}
        size={16}
      />

      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge && (
            <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-primary/8 text-primary/80 border border-primary/15 leading-none">
              {item.badge}
            </span>
          )}
        </>
      )}

      {/* Collapsed badge dot */}
      {collapsed && item.badge && (
        <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-primary" />
      )}
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

        {/* ===== TOP BAR ===== */}
        <header className="h-12 border-b border-border bg-surface-card/90 backdrop-blur-sm flex items-center px-3 gap-3 z-40 flex-shrink-0 shadow-[0_1px_0_0_var(--color-border)]">

          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 mr-2 flex-shrink-0 group"
          >
            <div className="w-6.5 h-6.5 rounded-lg bg-gradient-primary flex items-center justify-center shadow-sm group-hover:shadow-primary/25 transition-shadow">
              <MapPin className="w-3 h-3 text-white" />
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-[13px] font-bold tracking-tight">GramSeva</span>
              <span className="font-mono text-[9px] text-primary/70 tracking-widest">WORKSPACE</span>
            </div>
          </Link>

          {/* Vertical divider */}
          <div className="h-5 w-px bg-border flex-shrink-0" />

          {/* Search Bar */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral" />
              <input
                type="text"
                placeholder="Ask GramSeva… parcels, conflicts, land-use"
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-surface text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-neutral font-sans"
              />
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right actions */}
          <div className="flex items-center gap-1.5 relative">

            {/* System health pill */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-surface/80 mr-1">
              <span className="radar-dot" style={{ width: 6, height: 6 }} />
              <span className="font-mono text-[10px] text-neutral-dark tracking-wider">SYS OK</span>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-1.5 rounded-lg hover:bg-surface transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4 text-neutral-dark" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary rounded-full ring-1 ring-surface-card" />
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-76 bg-surface-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="px-3 py-2.5 border-b border-border flex items-center justify-between">
                      <span className="text-xs font-semibold">Notifications</span>
                      <span className="hud-badge" style={{ background: "rgba(134,15,97,0.08)", borderColor: "rgba(134,15,97,0.2)", color: "var(--color-primary)" }}>
                        2 NEW
                      </span>
                    </div>
                    <div className="divide-y divide-border">
                      <div className="px-3 py-2.5 hover:bg-surface transition-colors cursor-pointer">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Activity className="w-3 h-3 text-success" />
                          <span className="text-xs font-semibold">Automated Match Found</span>
                        </div>
                        <p className="text-[11px] text-neutral-dark">Survey no. 245 matched with high confidence.</p>
                        <span className="font-mono text-[10px] text-neutral mt-1 block">10 mins ago</span>
                      </div>
                      <div className="px-3 py-2.5 hover:bg-surface transition-colors cursor-pointer">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Shield className="w-3 h-3 text-warning" />
                          <span className="text-xs font-semibold text-warning">New Conflict Detected</span>
                        </div>
                        <p className="text-[11px] text-neutral-dark">Boundary conflict on Survey no. 88.</p>
                        <span className="font-mono text-[10px] text-neutral mt-1 block">1 hour ago</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 2D / 3D toggle */}
            <button
              onClick={() => {
                setViewMode3D(!viewMode3D);
                alert(viewMode3D ? "Switched to standard 2D view." : "3D Cesium Integration Pending.");
              }}
              title="Toggle 2D / 3D"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode3D
                  ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(134,15,97,0.15)]"
                  : "hover:bg-surface text-neutral-dark"
              }`}
            >
              <Layers className="w-4 h-4" />
            </button>

            {/* User avatar */}
            <div className="w-6.5 h-6.5 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors border border-primary/15">
              <User className="w-3 h-3 text-primary" />
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* ===== LEFT SIDEBAR ===== */}
          <aside
            className={`
              border-r border-border bg-surface-card flex flex-col transition-all duration-300 flex-shrink-0
              ${collapsed ? "w-12" : "w-[212px]"}
            `}
          >
            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-2 px-1.5 space-y-0.5">
              {mainNav.map((item) => (
                <SidebarItem key={item.href} item={item} collapsed={collapsed} />
              ))}
            </nav>

            {/* System Status — expanded only */}
            {!collapsed && (
              <div className="px-2.5 py-3 border-t border-border space-y-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[9px] font-semibold text-neutral uppercase tracking-widest">
                    System
                  </span>
                  <span className="radar-dot" />
                </div>
                {systemStatuses.map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center justify-between py-0.5"
                  >
                    <div className="flex items-center gap-1.5">
                      <s.icon className="w-3 h-3 text-neutral-dark" />
                      <span className="text-[11px] text-neutral-dark">{s.label}</span>
                    </div>
                    <span className="font-mono text-[9px] text-success tracking-wider">
                      {s.mono}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Collapse toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2.5 border-t border-border hover:bg-surface transition-colors flex items-center justify-center text-neutral-dark hover:text-foreground"
            >
              {collapsed ? (
                <ChevronRight className="w-3.5 h-3.5" />
              ) : (
                <ChevronLeft className="w-3.5 h-3.5" />
              )}
            </button>
          </aside>

          {/* ===== MAIN CONTENT ===== */}
          <main className="flex-1 overflow-auto bg-surface/40">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
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
