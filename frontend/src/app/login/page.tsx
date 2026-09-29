"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Shield } from "lucide-react";
import { useAuth, type RoleValue } from "@/lib/auth";

const roles = [
  { value: "admin", label: "Admin" },
  { value: "survey_officer", label: "Survey Officer" },
  { value: "reviewer", label: "Reviewer" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("survey_officer");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Prototype login
    const userEmail = email.trim() || "officer@gramseva.gov.in";
    const localPart = userEmail.split("@")[0].replace(/[._-]+/g, " ");
    signIn({
      name: localPart.replace(/\b\w/g, (c) => c.toUpperCase()),
      email: userEmail,
      role: role as RoleValue,
    });

    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 800);
  };

  const handleDemoMode = () => {
    setLoading(true);
    signIn({
      name: "Demo User",
      email: "demo@gramseva.gov.in",
      role: "demo",
    });

    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 500);
  };

  return (
    <div className="min-h-screen flex">

      {/* =========================================================
          LEFT — BRAND / VISUAL PANEL
      ========================================================= */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#12040e] relative overflow-hidden flex-col justify-between p-10 xl:p-12 select-none">

        {/* Photorealistic Aerial Background */}
        <div className="absolute inset-0 pointer-events-none">

          <motion.img
            src="/login_bg.png"
            alt="GramSeva Aerial Terrain"
            className="absolute w-full h-full object-cover opacity-60"
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />

          {/* Readability overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#12040e] via-[#12040e]/60 to-[#12040e]/85" />

          <div className="absolute inset-0 bg-gradient-to-r from-[#12040e]/95 via-[#12040e]/60 to-transparent" />

        </div>


        {/* =====================================================
            TOP HEADER
        ===================================================== */}
        <div className="relative z-10">

        </div>


        {/* =====================================================
            LIVE GEOSPATIAL HARMONIZATION VISUAL
        ===================================================== */}
        <div className="relative z-10 my-auto py-4">

          <div className="bg-[#1c0817]/70 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-2xl relative overflow-hidden">

            {/* Visual Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">

              <div className="flex items-center gap-2 text-[11px] font-semibold text-white/70 uppercase tracking-wider">

                <span className="w-2 h-2 rounded-full bg-[#860F61] animate-pulse" />

                <span>
                  Spatial Harmonization Engine
                </span>

              </div>

              <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/50">

                <span>FRAGMENTED</span>

                <span>➔</span>

                <span className="text-white/90 font-bold">
                  UNIFIED
                </span>

              </div>

            </div>


            {/* =================================================
                ANIMATION CANVAS
            ================================================= */}
            <div className="relative w-full h-56 flex items-center justify-center">

              {/* Background Grid */}
              <svg
                className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
                viewBox="0 0 400 220"
              >

                <pattern
                  id="grid-pattern"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >

                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.5"
                    strokeDasharray="2 2"
                  />

                </pattern>

                <rect
                  width="100%"
                  height="100%"
                  fill="url(#grid-pattern)"
                />

              </svg>


              {/* Multi-source Polygon Layers */}
              <svg
                className="absolute inset-0 w-full h-full overflow-visible"
                viewBox="0 0 400 220"
              >

                {/* Unified Target Base */}
                <polygon
                  points="140,50 250,35 270,140 160,175 110,120"
                  fill="#860F61"
                  fillOpacity="0.08"
                  stroke="#860F61"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  strokeOpacity="0.3"
                />


                {/* Cadastral Boundary */}
                <motion.g
                  animate={{
                    x: [-32, -32, 0, 0, 0, -32],
                    y: [-20, -20, 0, 0, 0, -20],
                    rotate: [-3.5, -3.5, 0, 0, 0, -3.5],
                  }}
                  transition={{
                    duration: 9,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ transformOrigin: "200px 105px" }}
                >

                  <polygon
                    points="140,50 250,35 270,140 160,175 110,120"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeOpacity="0.6"
                    strokeDasharray="5 3"
                  />

                  <circle
                    cx="140"
                    cy="50"
                    r="2.5"
                    fill="#ffffff"
                    opacity="0.8"
                  />

                </motion.g>


                {/* Revenue Record */}
                <motion.g
                  animate={{
                    x: [28, 28, 0, 0, 0, 28],
                    y: [18, 18, 0, 0, 0, 18],
                    rotate: [3, 3, 0, 0, 0, 3],
                  }}
                  transition={{
                    duration: 9,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ transformOrigin: "200px 105px" }}
                >

                  <polygon
                    points="140,50 250,35 270,140 160,175 110,120"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeOpacity="0.75"
                  />

                  <circle
                    cx="270"
                    cy="140"
                    r="2.5"
                    fill="#f59e0b"
                    opacity="0.9"
                  />

                </motion.g>


                {/* Municipal GIS */}
                <motion.g
                  animate={{
                    x: [-20, -20, 0, 0, 0, -20],
                    y: [24, 24, 0, 0, 0, 24],
                    rotate: [-2, -2, 0, 0, 0, -2],
                  }}
                  transition={{
                    duration: 9,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ transformOrigin: "200px 105px" }}
                >

                  <polygon
                    points="140,50 250,35 270,140 160,175 110,120"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    strokeOpacity="0.7"
                    strokeDasharray="2 2"
                  />

                  <circle
                    cx="160"
                    cy="175"
                    r="2.5"
                    fill="#38bdf8"
                    opacity="0.8"
                  />

                </motion.g>


                {/* Satellite */}
                <motion.g
                  animate={{
                    x: [22, 22, 0, 0, 0, 22],
                    y: [-22, -22, 0, 0, 0, -22],
                    rotate: [2.5, 2.5, 0, 0, 0, 2.5],
                  }}
                  transition={{
                    duration: 9,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ transformOrigin: "200px 105px" }}
                >

                  <polygon
                    points="140,50 250,35 270,140 160,175 110,120"
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="1.5"
                    strokeOpacity="0.7"
                  />

                  <circle
                    cx="250"
                    cy="35"
                    r="2.5"
                    fill="#34d399"
                    opacity="0.8"
                  />

                </motion.g>


                {/* Drone Primary Accent */}
                <motion.g
                  animate={{
                    x: [0, 0, 0, 0, 0, 0],
                    y: [0, 0, 0, 0, 0, 0],
                    opacity: [0.7, 0.7, 1, 1, 0.7, 0.7],
                  }}
                  transition={{
                    duration: 9,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >

                  <polygon
                    points="140,50 250,35 270,140 160,175 110,120"
                    fill="#860F61"
                    fillOpacity="0.12"
                    stroke="#860F61"
                    strokeWidth="2"
                  />

                </motion.g>


                {/* Harmonized Polygon */}
                <motion.g
                  animate={{
                    opacity: [0, 0, 1, 1, 0, 0],
                    scale: [0.98, 0.98, 1, 1, 0.98, 0.98],
                  }}
                  transition={{
                    duration: 9,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ transformOrigin: "200px 105px" }}
                >

                  <polygon
                    points="140,50 250,35 270,140 160,175 110,120"
                    fill="#860F61"
                    fillOpacity="0.25"
                    stroke="#860F61"
                    strokeWidth="2.5"
                  />

                  <polygon
                    points="140,50 250,35 270,140 160,175 110,120"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeDasharray="6 6"
                    strokeOpacity="0.9"
                  />

                </motion.g>

              </svg>


              {/* Source Labels */}
              <div className="absolute inset-0 pointer-events-none">

                {/* Cadastral */}
                <motion.div
                  className="absolute top-3 left-4 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-[10px] font-medium text-white/90"
                  animate={{
                    opacity: [0.7, 0.7, 1, 1, 0.7, 0.7],
                  }}
                  transition={{
                    duration: 9,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >

                  <span className="w-1.5 h-1.5 rounded-full bg-white" />

                  <span>Cadastral</span>

                </motion.div>


                {/* Revenue */}
                <motion.div
                  className="absolute top-3 right-4 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 backdrop-blur-sm border border-amber-500/30 text-[10px] font-medium text-amber-200"
                  animate={{
                    opacity: [0.7, 0.7, 1, 1, 0.7, 0.7],
                  }}
                  transition={{
                    duration: 9,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >

                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />

                  <span>Revenue</span>

                </motion.div>


                {/* Municipal */}
                <motion.div
                  className="absolute bottom-3 left-4 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sky-500/10 backdrop-blur-sm border border-sky-500/30 text-[10px] font-medium text-sky-200"
                  animate={{
                    opacity: [0.7, 0.7, 1, 1, 0.7, 0.7],
                  }}
                  transition={{
                    duration: 9,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >

                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />

                  <span>Municipal GIS</span>

                </motion.div>


                {/* Satellite */}
                <motion.div
                  className="absolute bottom-3 right-4 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/30 text-[10px] font-medium text-emerald-200"
                  animate={{
                    opacity: [0.7, 0.7, 1, 1, 0.7, 0.7],
                  }}
                  transition={{
                    duration: 9,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >

                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />

                  <span>Satellite</span>

                </motion.div>


                {/* Drone */}
                <motion.div
                  className="absolute top-1/2 right-2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#860F61]/30 backdrop-blur-sm border border-[#860F61]/50 text-[10px] font-medium text-white"
                  animate={{
                    opacity: [0.8, 0.8, 1, 1, 0.8, 0.8],
                  }}
                  transition={{
                    duration: 9,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >

                  <span className="w-1.5 h-1.5 rounded-full bg-[#860F61]" />

                  <span>Drone</span>

                </motion.div>

              </div>


              {/* Unified Record Indicator */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                animate={{
                  opacity: [0, 0, 1, 1, 0, 0],
                  scale: [0.92, 0.92, 1, 1, 0.92, 0.92],
                }}
                transition={{
                  duration: 9,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >

                <div className="bg-[#860F61]/95 backdrop-blur-md text-white border border-white/30 rounded-xl px-4 py-2 shadow-2xl flex flex-col items-center justify-center text-center transform -translate-y-1">

                  <div className="flex items-center gap-2 mb-0.5">

                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

                    <span className="text-[11px] font-extrabold uppercase tracking-widest leading-none">
                      UNIFIED RECORD
                    </span>

                  </div>

                  <span className="text-[12px] font-semibold text-white/90">
                    High confidence
                  </span>

                </div>

              </motion.div>

            </div>


            {/* Bottom Source Summary */}
            <div className="pt-3 mt-1 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60">

              <span className="font-medium">
                Multi-Source Layers:
              </span>

              <div className="flex items-center gap-2 font-mono text-[10px] text-white/80">

                <span>Cadastral</span>
                <span>•</span>
                <span>Revenue</span>
                <span>•</span>
                <span>Municipal</span>
                <span>•</span>
                <span>Satellite</span>
                <span>•</span>
                <span>Drone</span>

              </div>

            </div>

          </div>

        </div>


        {/* =====================================================
            BOTTOM COPY
        ===================================================== */}
        <div className="relative z-10">

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-3"
          >
            Connecting the Land
            <br />
            That Connects Us
          </motion.h1>


          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-white/70 text-sm leading-relaxed max-w-md mb-6"
          >
            Multi-source geospatial data integration, intelligent
            harmonization, and unified land record management.
          </motion.p>


          <div className="flex items-center gap-2.5 text-white/50 text-xs pt-3 border-t border-white/10">

            <Shield className="w-4 h-4 text-[#860F61]/80 shrink-0" />

            <span>
              Government-grade security • Source data preserved • Audit trail maintained
            </span>

          </div>

        </div>

      </div>


      {/* =========================================================
          RIGHT — LOGIN FORM
      ========================================================= */}
      <div className="flex-1 relative flex items-center justify-center p-8 bg-background">

        {/* Logo — top right */}
        <img
          src="/gramseva-logo.png"
          alt="GramSeva"
          className="absolute top-6 right-6 lg:top-8 lg:right-8 h-12 w-auto object-contain"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >

          <h2 className="text-2xl font-bold mb-2">
            Sign in to your account
          </h2>

          <p className="text-neutral-dark text-sm mb-8">
            Access the GramSeva geospatial workspace
          </p>


          {/* =====================================================
              LOGIN FORM
          ===================================================== */}
          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* Email */}
            <div>

              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1.5"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@gramseva.gov.in"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />

            </div>


            {/* Password */}
            <div>

              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1.5"
              >
                Password
              </label>

              <div className="relative">

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark hover:text-foreground transition-colors"
                >

                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}

                </button>

              </div>

            </div>


            {/* Role */}
            <div>

              <label
                htmlFor="role"
                className="block text-sm font-medium mb-1.5"
              >
                Role
              </label>

              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none"
              >

                {roles.map((r) => (
                  <option
                    key={r.value}
                    value={r.value}
                  >
                    {r.label}
                  </option>
                ))}

              </select>

            </div>


            {/* Sign In */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
            >

              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}

            </button>

          </form>


          {/* Divider */}
          <div className="flex items-center gap-3 my-6">

            <div className="flex-1 h-px bg-border" />

            <span className="text-xs text-neutral-dark font-medium">
              or
            </span>

            <div className="flex-1 h-px bg-border" />

          </div>


          {/* Demo Mode */}
          <button
            onClick={handleDemoMode}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-primary/30 bg-primary/5 text-primary font-semibold text-sm hover:bg-primary/10 transition-colors disabled:opacity-60"
          >
            Enter Demo Mode
          </button>


          <p className="text-xs text-neutral mt-4 text-center">
            Demo mode provides immediate access with seeded demonstration data.
          </p>

        </motion.div>

      </div>

    </div>
  );
}