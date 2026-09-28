"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Hero3DFloatingVisual from "@/components/Hero3DFloatingVisual";
import {
  MapPin,
  Shield,
  Eye,
  GitMerge,
  Clock,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Database,
  Cpu,
  Globe,
  Search,
  BarChart3,
  Compass,
  Radar,
  Puzzle,
  Sparkles,
  FileCheck,
  LucideIcon,
} from "lucide-react";
import AnimatedHeroMap from "@/components/AnimatedHeroMap";
/*  ANIMATED COUNTER                                                    */
/* ------------------------------------------------------------------ */
function AnimatedCounter({ end, suffix = "", label, delay = 0 }: { end: number; suffix?: string; label: string; delay?: number }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const timeout = setTimeout(() => {
      let frame = 0;
      const total = 60;
      const inc = end / total;
      const interval = setInterval(() => {
        frame++;
        setCount(Math.min(Math.round(inc * frame), end));
        if (frame >= total) clearInterval(interval);
      }, 20);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [started, end, delay]);

  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#860F61]">
        {count.toLocaleString("en-US")}{suffix}
      </div>
      <div className="text-xs sm:text-sm text-neutral-dark mt-1.5 font-medium uppercase tracking-wide">{label}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PIPELINE STEP                                                       */
/* ------------------------------------------------------------------ */
function PipelineStep({ icon: Icon, label, index, total }: { icon: LucideIcon; label: string; index: number; total: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="flex flex-col items-center gap-2 relative"
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <span className="text-xs font-semibold text-foreground/80 tracking-wide uppercase">{label}</span>
      {index < total - 1 && (
        <div className="hidden md:block absolute -right-6 top-5">
          <ArrowRight className="w-4 h-4 text-neutral" />
        </div>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  FEATURE CARD                                                        */
/* ------------------------------------------------------------------ */
function FeatureCard({ icon: Icon, title, description, delay }: { icon: LucideIcon; title: string; description: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="group p-6 rounded-xl border border-border bg-surface-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
    >
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h3 className="text-base font-semibold mb-2">{title}</h3>
      <p className="text-sm text-neutral-dark leading-relaxed">{description}</p>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  DATA SOURCE CHIP                                                    */
/* ------------------------------------------------------------------ */
function SourceChip({ icon: Icon, label, delay }: { icon: LucideIcon; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.3 }}
      className="group flex flex-1 items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-[#F4E9D8]/50 border border-[#860F61]/15 text-sm font-medium text-foreground/80 hover:bg-[#860F61]/5 hover:border-[#860F61]/30 hover:-translate-y-0.5 transition-all shadow-sm w-[calc(50%-0.35rem)] min-w-[140px] cursor-default"
    >
      <Icon className="w-4 h-4 text-[#860F61]/60 transition-colors group-hover:text-[#860F61]" strokeWidth={2} />
      <span className="truncate">{label}</span>
    </motion.div>
  );
}

/* ================================================================== */
/*  LANDING PAGE                                                        */
/* ================================================================== */
export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.98]);

  const pipelineSteps: { icon: LucideIcon; label: string }[] = [
    { icon: Database, label: "Ingest" },
    { icon: Compass, label: "Normalize" },
    { icon: Search, label: "Extract" },
    { icon: GitMerge, label: "Match" },
    { icon: Clock, label: "Change" },
    { icon: Shield, label: "Conflict" },
    { icon: BarChart3, label: "Confidence" },
    { icon: Eye, label: "Review" },
    { icon: CheckCircle2, label: "Unify" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ========== NAVIGATION ========== */}
      <nav className="fixed top-0 w-full z-50 glass-card border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">GramSeva</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-dark">
            <a href="#pipeline" className="hover:text-primary transition-colors">How It Works</a>
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#tech" className="hover:text-primary transition-colors">Technology</a>
            <a href="#datasets" className="hover:text-primary transition-colors">Datasets</a>
            <Link href="/data-sources" className="text-primary font-semibold hover:opacity-80 transition-opacity flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Models (SBERT & SegFormer)</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden md:inline-flex text-sm font-medium text-neutral-dark hover:text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <span>Explore Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ========== HERO ========== */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative pt-28 pb-16 md:pt-32 md:pb-24 overflow-hidden min-h-[90vh] flex items-center"
      >
        {/* Background subtle pattern */}
        <div className="absolute inset-0 hero-gradient pointer-events-none" />
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-secondary/40 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-center">
            {/* Left Copy Column */}
            <div className="md:col-span-6 flex flex-col items-start text-left shrink-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15 mb-6">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary tracking-wide">SIH26013 — GEOSPATIAL INTELLIGENCE</span>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-2"
              >
                <span className="text-gradient-primary">GramSeva</span>
              </motion.h1>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-2xl md:text-3xl font-semibold text-foreground/80 mb-6 leading-snug"
              >
                Connecting the Land
                <br />That Connects Us
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-base md:text-lg text-neutral-dark leading-relaxed max-w-xl mb-10"
              >
                Bringing fragmented land records, maps and geospatial data together
                into one intelligent, explainable view.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="flex flex-wrap items-center gap-4"
              >
                <Link
                  href="/dashboard"
                  className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#860F61] text-white font-semibold shadow-lg shadow-[#860F61]/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#860F61]/25 transition-all duration-300"
                >
                  <span>Explore Platform</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <a
                  href="#pipeline"
                  className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl border-1.5 border-border bg-transparent text-neutral-dark font-semibold hover:border-[#860F61]/30 hover:bg-[#860F61]/5 hover:text-foreground transition-all duration-300"
                >
                  <span>See How It Works</span>
                  <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                </a>
              </motion.div>
            </div>

          {/* Hero visual — animated transformation */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-16 md:mt-0 md:absolute md:right-6 md:top-1/2 md:-translate-y-1/2 w-full md:w-[440px]"
          >
            <div className="relative rounded-2xl border border-border bg-surface-card p-5 shadow-xl shadow-black/5">
              {/* Map preview visual */}
              <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-[#2a3d2a] to-[#1a2d1a] relative overflow-hidden">
                {/* Grid pattern to represent parcels */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300">
                  {/* Simulated parcel boundaries */}
                  <motion.path
                    d="M50,50 L150,40 L160,120 L60,130 Z"
                    fill="none"
                    stroke="#860F61"
                    strokeWidth="1.5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.8 }}
                    transition={{ delay: 1, duration: 1.5 }}
                  />
                  <motion.path
                    d="M160,35 L280,30 L290,100 L170,115 Z"
                    fill="none"
                    stroke="#F4E9D8"
                    strokeWidth="1.5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.8 }}
                    transition={{ delay: 1.3, duration: 1.5 }}
                  />
                  <motion.path
                    d="M55,140 L155,125 L165,220 L65,230 Z"
                    fill="none"
                    stroke="#A9ACAD"
                    strokeWidth="1.5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.8 }}
                    transition={{ delay: 1.6, duration: 1.5 }}
                  />
                  <motion.path
                    d="M170,120 L295,105 L305,210 L180,225 Z"
                    fill="none"
                    stroke="#860F61"
                    strokeWidth="1.5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.7 }}
                    transition={{ delay: 1.9, duration: 1.5 }}
                  />
                  {/* Building footprints */}
                  <motion.rect x="90" y="70" width="25" height="20" rx="2"
                    fill="rgba(134,15,97,0.3)" stroke="#860F61" strokeWidth="0.8"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2, duration: 0.5 }}
                  />
                  <motion.rect x="200" y="55" width="30" height="22" rx="2"
                    fill="rgba(134,15,97,0.3)" stroke="#860F61" strokeWidth="0.8"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4, duration: 0.5 }}
                  />
                  <motion.rect x="100" y="160" width="22" height="18" rx="2"
                    fill="rgba(134,15,97,0.3)" stroke="#860F61" strokeWidth="0.8"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.6, duration: 0.5 }}
                  />
                  {/* Roads */}
                  <motion.path
                    d="M0,145 Q200,130 400,140"
                    fill="none" stroke="rgba(244,233,216,0.4)" strokeWidth="3" strokeDasharray="6 4"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2, duration: 1.5 }}
                  />
                </svg>

                {/* Status overlay */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 3, duration: 0.5 }}
                  className="absolute bottom-3 left-3 right-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-black/60 backdrop-blur-sm"
                >
                  <div className="w-2 h-2 rounded-full bg-success pulse-status" />
                  <span className="text-xs text-white/80 font-medium">4 sources harmonized • 94% confidence</span>
                </motion.div>
              </div>

              {/* Bottom info strip */}
              <div className="mt-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                      <Satellite className="w-2.5 h-2.5 text-primary" />
                    </div>
                    <div className="w-5 h-5 rounded-full bg-secondary border border-secondary-dark/40 flex items-center justify-center">
                      <Building2 className="w-2.5 h-2.5 text-foreground/60" />
                    </div>
                    <div className="w-5 h-5 rounded-full bg-neutral-light border border-neutral/40 flex items-center justify-center">
                      <TreePine className="w-2.5 h-2.5 text-neutral-dark" />
                    </div>
                  </div>
                  <span className="text-neutral-dark font-medium">Multi-source</span>
                </div>
                <span className="text-neutral font-medium">Demo Dataset</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ========== QUICK STATS ========== */}
      <section className="py-8 bg-surface-card/30 border-y border-border">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#860F61]/5 border border-[#860F61]/10">
              <div className="w-1.5 h-1.5 rounded-full bg-[#860F61] animate-pulse" />
              <span className="text-xs font-semibold text-[#860F61] uppercase tracking-wider">Demo Dataset</span>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-end gap-x-12 gap-y-6 flex-1">
              <AnimatedCounter end={6} label="Sources" delay={0} />
              <AnimatedCounter end={1247} label="Parcels" delay={100} />
              <AnimatedCounter end={1089} label="Matches" delay={200} />
              <AnimatedCounter end={43} label="Conflicts" delay={300} />
            </div>
          </div>
        </div>
      </section>

      {/* ========== WHY GRAMSEVA ========== */}
      <section className="py-10 md:py-14 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 flex flex-col items-center">
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">Why GramSeva?</h2>
            <p className="text-sm md:text-base text-neutral-dark max-w-2xl mx-auto leading-relaxed">
              Land information is scattered across departments — different formats, coordinates,
              attributes, and versions. GramSeva automatically harmonizes them.
            </p>
          </motion.div>

          {/* Main Pipeline Layout: Left (Sources) -> Center (Engine) -> Right (Output) */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 w-full max-w-5xl mt-6 lg:mt-10 relative">
            
            {/* 1. LEFT: Scattered Sources */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="w-full md:w-64 shrink-0 flex flex-col items-center md:items-start relative z-10"
            >
              <div className="text-xs font-semibold text-neutral-dark mb-4 uppercase tracking-wider text-center md:text-left">
                Scattered Sources
              </div>
              <div className="grid grid-cols-2 gap-2.5 w-full">
                {[
                  { label: "Drone", icon: Layers },
                  { label: "Cadastral", icon: MapPin },
                  { label: "GIS", icon: Globe },
                  { label: "Revenue", icon: Database },
                  { label: "Satellite", icon: Satellite },
                  { label: "Footprints", icon: Building2 },
                ].map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex justify-center md:justify-start items-center gap-2 px-3 py-2 rounded-md bg-[#F4E9D8]/60 border border-[#860F61]/15 text-xs font-semibold text-foreground/80 hover:-translate-y-[1px] hover:bg-[#860F61]/10 transition-all shadow-sm cursor-default"
                  >
                    <s.icon className="w-3.5 h-3.5 text-[#860F61]/70 shrink-0" strokeWidth={2} />
                    <span className="truncate">{s.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* 2. CENTER: Transformation Engine & Animated Flow */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="flex-1 relative flex items-center justify-center w-full min-h-[140px] md:min-h-[180px] z-0"
            >
              {/* Dynamic Connecting Lines mapped precisely to Left/Right bounding components */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none text-border overflow-visible hidden md:block" viewBox="0 0 300 180" preserveAspectRatio="none"> 
                {/* 
                  Lines mathematically target the ~3 rows of source nodes sitting on the left side
                  (Approx. X == -110 for Outer column, -20 for Inner column). 
                */}
                <g stroke="currentColor" strokeWidth="1" fill="none" opacity="0.6">
                  {/* Outer Left Column Routes */}
                  <path d="M -110,30 C -50,30 50,90 150,90" vectorEffect="non-scaling-stroke" />
                  <path d="M -110,90 C -50,90 50,90 150,90" vectorEffect="non-scaling-stroke" />
                  <path d="M -110,150 C -50,150 50,90 150,90" vectorEffect="non-scaling-stroke" />
                  {/* Inner Left Column Routes */}
                  <path d="M -20,30 C 50,30 100,90 150,90" vectorEffect="non-scaling-stroke" />
                  <path d="M -20,90 C 50,90 100,90 150,90" vectorEffect="non-scaling-stroke" />
                  <path d="M -20,150 C 50,150 100,90 150,90" vectorEffect="non-scaling-stroke" />
                </g>

                {/* Unified Output Line extending safely to Right Side element (X == ~310) */}
                <path d="M 150,90 C 220,90 280,90 320,90" stroke="#860F61" strokeWidth="1.5" strokeOpacity="0.4" fill="none" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />

                {/* Smooth flowing data particles */}
                <circle r="2.5" fill="currentColor">
                  <animateMotion dur="2.8s" repeatCount="indefinite" path="M -110,30 C -50,30 50,90 150,90" />
                </circle>
                <circle r="2.5" fill="currentColor">
                  <animateMotion dur="2.4s" repeatCount="indefinite" path="M -110,90 C -50,90 50,90 150,90" />
                </circle>
                <circle r="2.5" fill="currentColor">
                  <animateMotion dur="2s" repeatCount="indefinite" path="M -110,150 C -50,150 50,90 150,90" />
                </circle>
                <circle r="2.5" fill="currentColor">
                  <animateMotion dur="2.6s" repeatCount="indefinite" path="M -20,30 C 50,30 100,90 150,90" />
                </circle>
                <circle r="2.5" fill="currentColor">
                  <animateMotion dur="2.3s" repeatCount="indefinite" path="M -20,90 C 50,90 100,90 150,90" />
                </circle>
                <circle r="2.5" fill="currentColor">
                  <animateMotion dur="2.7s" repeatCount="indefinite" path="M -20,150 C 50,150 100,90 150,90" />
                </circle>

                <circle r="4" fill="#860F61" opacity="0.9">
                  <animateMotion dur="1.2s" repeatCount="indefinite" path="M 150,90 C 220,90 280,90 320,90" />
                </circle>
              </svg>

              {/* Central GIS Matching Jewel (Enlarged & Dominant) */}
              <div className="relative z-10 w-24 h-24 md:w-28 md:h-28 rounded-[1.25rem] bg-white border border-border shadow-md flex items-center justify-center rotate-45">
                 <div className="absolute inset-1.5 border border-[#860F61]/20 rounded-xl border-dashed" />
                 <div className="absolute inset-2.5 border border-[#860F61]/10 rounded-lg bg-[#860F61]/[0.02]" />
                 <Layers className="w-8 h-8 md:w-10 md:h-10 text-neutral-dark/30 -rotate-45 absolute -translate-x-1.5 translate-y-1.5" strokeWidth={1.5} />
                 <Layers className="w-8 h-8 md:w-10 md:h-10 text-[#860F61] -rotate-45 absolute shadow-sm" strokeWidth={1.5} />
              </div>
            </motion.div>

            {/* 3. RIGHT: One Understanding */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="w-full md:w-[280px] shrink-0 flex flex-col items-center md:items-start relative z-10"
            >
              <div className="text-xs font-semibold text-[#860F61] mb-4 uppercase tracking-wider text-center md:text-left">
                One Understanding
              </div>
              <ul className="space-y-3.5 text-xs md:text-sm font-medium text-foreground/80 relative">
                <li className="flex items-center gap-3.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#860F61]/60 shadow-[0_0_8px_rgba(134,15,97,0.3)] shrink-0" />
                  Harmonized Spatial Geometry
                </li>
                <li className="flex items-center gap-3.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#860F61]/60 shadow-[0_0_8px_rgba(134,15,97,0.3)] shrink-0" />
                  Unified Attribute Data
                </li>
                <li className="flex items-center gap-3.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#860F61]/60 shadow-[0_0_8px_rgba(134,15,97,0.3)] shrink-0" />
                  AI Confidence Scored
                </li>
                <li className="flex items-center gap-3.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#860F61]/60 shadow-[0_0_8px_rgba(134,15,97,0.3)] shrink-0" />
                  Explainable Traceability
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS — PIPELINE ========== */}
      <section id="pipeline" className="py-20 md:py-28 bg-surface-card/50 border-y border-border">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How GramSeva Works</h2>
            <p className="text-neutral-dark max-w-xl mx-auto">
              A continuous pipeline from raw data to unified, confidence-scored land records.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
            {pipelineSteps.map((step, i) => (
              <PipelineStep key={step.label} icon={step.icon} label={step.label} index={i} total={pipelineSteps.length} />
            ))}
          </div>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section id="features" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Platform Features</h2>
            <p className="text-neutral-dark max-w-xl mx-auto">
              Every capability designed for real geospatial intelligence workflows.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <FeatureCard
              icon={Puzzle}
              title="AI Spatial Matching"
              description="Multi-evidence entity matching combining geometry, attributes, visual similarity, and temporal consistency."
              delay={0}
            />
            <FeatureCard
              icon={Radar}
              title="Conflict Radar"
              description="Detect boundary, area, attribute, temporal, and topology conflicts across all data sources."
              delay={0.08}
            />
            <FeatureCard
              icon={Clock}
              title="Land Time Machine"
              description="Temporal change detection showing construction, demolition, expansion, and land-use changes."
              delay={0.16}
            />
            <FeatureCard
              icon={BarChart3}
              title="Confidence Map"
              description="Spatial visualization of harmonization confidence with full evidence breakdown."
              delay={0.24}
            />
            <FeatureCard
              icon={Sparkles}
              title="Explainable AI"
              description="Every AI decision provides model used, evidence, confidence, and source references."
              delay={0.32}
            />
            <FeatureCard
              icon={Eye}
              title="Human Review"
              description="Review queue with side-by-side source comparison, AI evidence, and resolution workflow."
              delay={0.4}
            />
            <FeatureCard
              icon={FileCheck}
              title="Unified Records"
              description="Canonical land records with complete provenance, audit history, and source traceability."
              delay={0.48}
            />
            <FeatureCard
              icon={Globe}
              title="2D / 3D GIS"
              description="Professional GIS workspace with MapLibre, Deck.gl, and CesiumJS for immersive spatial analysis."
              delay={0.56}
            />
          </div>
        </div>
      </section>

      {/* ========== AI + GIS ========== */}
      <section id="tech" className="py-20 md:py-28 bg-surface-card/50 border-y border-border">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">AI + GIS Architecture</h2>
            <p className="text-neutral-dark max-w-xl mx-auto">
              AI understands images, entities, and changes. GIS performs precise spatial operations.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* AI Column */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-xl border border-primary/20 bg-primary/5"
            >
              <div className="flex items-center gap-2 mb-5">
                <Cpu className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-primary">AI Engine</h3>
              </div>
              <div className="space-y-3">
                {[
                  { name: "SegFormer-B2", desc: "Building & feature extraction" },
                  { name: "Siamese ResNet-50", desc: "Visual entity matching" },
                  { name: "SBERT", desc: "Semantic attribute matching" },
                  { name: "ChangeFormer", desc: "Temporal change detection" },
                ].map((m) => (
                  <div key={m.name} className="flex items-center justify-between p-3 rounded-lg bg-white/60 border border-primary/10">
                    <span className="text-sm font-semibold">{m.name}</span>
                    <span className="text-xs text-neutral-dark">{m.desc}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* GIS Column */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-xl border border-border bg-surface-card"
            >
              <div className="flex items-center gap-2 mb-5">
                <Globe className="w-5 h-5 text-foreground/70" />
                <h3 className="font-semibold">GIS Engine</h3>
              </div>
              <div className="space-y-3">
                {[
                  { name: "PostGIS", desc: "Spatial database & indexes" },
                  { name: "GeoPandas", desc: "Geospatial data processing" },
                  { name: "Shapely", desc: "Geometry operations & validation" },
                  { name: "GDAL / PROJ", desc: "CRS transformation & format I/O" },
                ].map((m) => (
                  <div key={m.name} className="flex items-center justify-between p-3 rounded-lg bg-surface/60 border border-border">
                    <span className="text-sm font-semibold">{m.name}</span>
                    <span className="text-xs text-neutral-dark">{m.desc}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== DATASETS ========== */}
      <section id="datasets" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Datasets & Ecosystem</h2>
            <p className="text-neutral-dark max-w-xl mx-auto">
              Designed around the SIH26013 land-record harmonization problem and its NAKSHA ecosystem.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { name: "NAKSHA / DoLR", desc: "National spatial framework and land record digitization context.", tag: "Public Context" },
              { name: "SpaceNet", desc: "High-resolution satellite imagery with building footprint annotations.", tag: "Research" },
              { name: "Bhuvan / NRSC", desc: "Indian geo-platform with thematic and multi-spectral data layers.", tag: "Public" },
              { name: "OpenStreetMap", desc: "Community-contributed roads, buildings, land-use, and POI data.", tag: "Open Source" },
              { name: "Synthetic Benchmark", desc: "Controlled multi-source benchmark with ground-truth relationships.", tag: "Generated" },
            ].map((ds, i) => (
              <motion.div
                key={ds.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-5 rounded-xl border border-border bg-surface-card"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">{ds.name}</h3>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary/60 text-foreground/60">{ds.tag}</span>
                </div>
                <p className="text-xs text-neutral-dark leading-relaxed">{ds.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="py-24 md:py-32 bg-gradient-warm border-t border-border">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-6 leading-tight"
          >
            From fragmented land data
            <br />to one trusted view.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-neutral-dark text-lg mb-10"
          >
            One Map. One Truth. Smarter Land Records.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-primary text-white text-lg font-semibold hover:opacity-90 transition-opacity shadow-xl shadow-primary/25"
            >
              Open GramSeva Workspace
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-gradient-primary flex items-center justify-center">
              <MapPin className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold">GramSeva</span>
            <span className="text-xs text-neutral">•</span>
            <span className="text-xs text-neutral-dark">SIH26013</span>
          </div>
          <div className="text-xs text-neutral-dark">
            Built for Smart India Hackathon 2026 • Decision-support platform • Source records preserved
          </div>
        </div>
      </footer>
    </div>
  );
}
