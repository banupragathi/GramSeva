"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { MapPin, ArrowRight, Eye, EyeOff, Shield } from "lucide-react";

const roles = [
  { value: "admin", label: "Admin" },
  { value: "survey_officer", label: "Survey Officer" },
  { value: "reviewer", label: "Reviewer" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("survey_officer");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Real authentication
    setTimeout(() => {
      router.push("/dashboard");
    }, 800);
  };

  const handleDemoMode = () => {
    setLoading(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 500);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 800 800">
            {/* Parcel grid pattern */}
            {Array.from({ length: 12 }).map((_, i) => (
              <line
                key={`h-${i}`}
                x1="0" y1={i * 70} x2="800" y2={i * 70 + 20}
                stroke="white" strokeWidth="0.5" opacity="0.3"
              />
            ))}
            {Array.from({ length: 12 }).map((_, i) => (
              <line
                key={`v-${i}`}
                x1={i * 70} y1="0" x2={i * 70 + 15} y2="800"
                stroke="white" strokeWidth="0.5" opacity="0.3"
              />
            ))}
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">GramSeva</span>
          </div>
          <p className="text-white/60 text-sm mt-1">SIH26013 — Geospatial Intelligence Platform</p>
        </div>

        <div className="relative z-10 max-w-md">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl font-bold text-white leading-tight mb-4"
          >
            Connecting the Land
            <br />That Connects Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-white/70 leading-relaxed"
          >
            Multi-source geospatial data integration, intelligent harmonization,
            and unified land record management.
          </motion.p>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white/40 text-xs">
            <Shield className="w-4 h-4" />
            <span>Government-grade security • Source data preserved • Audit trail maintained</span>
          </div>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold">GramSeva</span>
          </div>

          <h2 className="text-2xl font-bold mb-2">Sign in to your account</h2>
          <p className="text-neutral-dark text-sm mb-8">
            Access the GramSeva geospatial workspace
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">
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
              <label htmlFor="password" className="block text-sm font-medium mb-1.5">
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
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium mb-1.5">
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none"
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>
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
            <span className="text-xs text-neutral-dark font-medium">or</span>
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
