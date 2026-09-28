"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
    <div className="min-h-screen flex bg-[#F3F7F4] text-purple-950 selection:bg-emerald-200 selection:text-purple-950">
      {/* Left — Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 green-gradient-bg relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 800 800">
            {/* Parcel grid pattern */}
            {Array.from({ length: 12 }).map((_, i) => (
              <line
                key={`h-${i}`}
                x1="0" y1={i * 70} x2="800" y2={i * 70 + 20}
                stroke="white" strokeWidth="0.5" opacity="0.4"
              />
            ))}
            {Array.from({ length: 12 }).map((_, i) => (
              <line
                key={`v-${i}`}
                x1={i * 70} y1="0" x2={i * 70 + 15} y2="800"
                stroke="white" strokeWidth="0.5" opacity="0.4"
              />
            ))}
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4 bg-white/95 backdrop-blur-sm p-3 rounded-2xl w-fit shadow-xl">
            <Image
              src="/logo.png"
              alt="GramSeva Logo"
              width={200}
              height={56}
              className="object-contain"
            />
          </div>
          <p className="text-emerald-100/90 text-sm mt-1 font-medium tracking-wide uppercase">SIH26013 — Geospatial Intelligence Platform</p>
        </div>

        <div className="relative z-10 max-w-md">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl font-display font-bold text-white leading-tight mb-4"
          >
            Connecting the Land
            <br />That Connects Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-emerald-50 leading-relaxed font-medium"
          >
            Multi-source geospatial data integration, intelligent harmonization,
            and unified land record management.
          </motion.p>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 text-emerald-100/70 text-xs font-semibold uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Government-grade security • Source data preserved • Audit trail maintained</span>
          </div>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <Image
              src="/logo.png"
              alt="GramSeva Logo"
              width={180}
              height={50}
              className="object-contain"
            />
          </div>

          <h2 className="text-3xl font-display font-bold text-purple-950 mb-2">Sign in to your account</h2>
          <p className="text-purple-800/80 text-sm font-medium mb-8">
            Access the GramSeva geospatial workspace
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-purple-950 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@gramseva.gov.in"
                className="w-full px-4 py-2.5 rounded-lg border border-purple-900/15 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 transition-all text-purple-950 font-medium"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-purple-950 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg border border-purple-900/15 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 transition-all pr-10 text-purple-950 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-700 hover:text-purple-900 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-bold text-purple-950 mb-1.5">
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-purple-900/15 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 transition-all appearance-none text-purple-950 font-medium"
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
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-purple-700 text-white font-bold text-sm hover:bg-purple-800 transition-all shadow-md hover:shadow-lg shadow-purple-900/20 disabled:opacity-60"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4.5 h-4.5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-purple-900/10" />
            <span className="text-xs text-purple-700/60 font-bold uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-purple-900/10" />
          </div>

          {/* Demo Mode */}
          <button
            onClick={handleDemoMode}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-emerald-300 bg-emerald-50 text-purple-800 font-bold text-sm hover:bg-emerald-100 transition-all shadow-sm hover:shadow disabled:opacity-60"
          >
            Enter Demo Mode
          </button>

          <p className="text-xs text-purple-600 font-medium mt-6 text-center">
            Demo mode provides immediate access with seeded demonstration data.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

