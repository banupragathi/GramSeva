"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Database,
  Compass,
  Search,
  GitMerge,
  Clock,
  Shield,
  BarChart3,
  Eye,
  CheckCircle2,
  Puzzle,
  Radar,
  Sparkles,
  FileCheck,
  Globe,
  Cpu,
  MapPin,
  ArrowRight,
  LucideIcon,
} from "lucide-react";
import { EarthGlobe } from "@/components/landing/EarthGlobe";
import { useReveal } from "@/lib/useReveal";

/* ------------------------------------------------------------------ */
/*  COUNT-UP ANIMATED STAT                                            */
/* ------------------------------------------------------------------ */
function StatNumber({
  target,
  formattedTarget,
  shouldAnimate,
}: {
  target: number;
  formattedTarget: string;
  shouldAnimate: boolean;
}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!shouldAnimate) return;

    let startTime: number | null = null;
    const duration = 1100; // ~1.1s
    const cubicEaseOut = (t: number) => 1 - Math.pow(1 - t, 3);
    let frameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = cubicEaseOut(progress);

      setValue(Math.round(easedProgress * target));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [shouldAnimate, target]);

  return (
    <span className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-[#EDEDEA]">
      {shouldAnimate && value === target ? formattedTarget : value.toLocaleString()}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN LANDING PAGE                                                 */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  // Sticky Navbar state
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hero section progress ref & hero container ref
  const heroContainerRef = useRef<HTMLDivElement | null>(null);
  const heroProgressRef = useRef<number>(0);

  // Section reveals (single fire per section)
  const [statsRef, statsRevealed] = useReveal<HTMLDivElement>(0.4);
  const [whyRef, whyRevealed] = useReveal<HTMLDivElement>(0.2);
  const [pipelineRef, pipelineRevealed] = useReveal<HTMLDivElement>(0.2);
  const [featuresRef, featuresRevealed] = useReveal<HTMLDivElement>(0.2);
  const [techRef, techRevealed] = useReveal<HTMLDivElement>(0.2);
  const [datasetsRef, datasetsRevealed] = useReveal<HTMLDivElement>(0.2);
  const [ctaRef, ctaRevealed] = useReveal<HTMLDivElement>(0.2);

  useEffect(() => {
    // Scroll listener for sticky navbar blur & hero particle progress
    const handleScroll = () => {
      if (window.scrollY > 12) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      if (heroContainerRef.current) {
        const rect = heroContainerRef.current.getBoundingClientRect();
        const totalScrollableHeight = rect.height - window.innerHeight;

        if (totalScrollableHeight > 0) {
          const currentScroll = -rect.top;
          const rawProgress = currentScroll / totalScrollableHeight;
          heroProgressRef.current = Math.min(Math.max(rawProgress, 0), 1);
        } else {
          heroProgressRef.current = 0;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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
    <div className="min-h-screen bg-[#0A0B0D] text-[#EDEDEA] flex flex-col font-sans selection:bg-[#C41E7D]/30 selection:text-[#EDEDEA]">
      {/* ------------------------------------------------------------------ */}
      {/* 1. NAVBAR                                                          */}
      {/* ------------------------------------------------------------------ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#0A0B0D]/82 backdrop-blur-md border-b border-[var(--line)] py-3.5"
            : "bg-transparent py-5 border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo Mark + Wordmark */}
          <Link
            href="/"
            className="flex items-center gap-3 text-lg font-semibold tracking-tight text-[#EDEDEA] hover:opacity-90 transition-opacity focus-visible:outline-none"
          >
            <div className="w-8 h-8 rounded-[8px] bg-[#C41E7D] flex items-center justify-center text-white text-sm font-bold font-display shadow-sm">
              GS
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-[#EDEDEA]">
              GramSeva
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden min-[860px]:flex items-center gap-8 text-sm font-medium text-[#8B8E94]">
            <a
              href="#how-it-works"
              className="hover:text-[#EDEDEA] transition-colors focus-visible:outline-none"
            >
              How it works
            </a>
            <a
              href="#features"
              className="hover:text-[#EDEDEA] transition-colors focus-visible:outline-none"
            >
              Features
            </a>
            <a
              href="#technology"
              className="hover:text-[#EDEDEA] transition-colors focus-visible:outline-none"
            >
              Technology
            </a>
            <a
              href="#datasets"
              className="hover:text-[#EDEDEA] transition-colors focus-visible:outline-none"
            >
              Datasets
            </a>
          </div>

          {/* Action CTAs */}
          <div className="hidden min-[860px]:flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-[#8B8E94] hover:text-[#EDEDEA] transition-colors focus-visible:outline-none"
            >
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-[8px] bg-[#C41E7D] hover:bg-[#8A1657] text-white text-sm font-medium transition-colors focus-visible:outline-none"
            >
              <span>Explore platform</span>
              <span className="text-base leading-none">→</span>
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="min-[860px]:hidden p-2 text-[#8B8E94] hover:text-[#EDEDEA] focus-visible:outline-none"
            aria-label="Toggle navigation menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="min-[860px]:hidden px-6 pt-4 pb-6 bg-[#0A0B0D]/95 backdrop-blur-lg border-b border-[var(--line)] flex flex-col gap-4">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm text-[#8B8E94] hover:text-[#EDEDEA]"
            >
              How it works
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm text-[#8B8E94] hover:text-[#EDEDEA]"
            >
              Features
            </a>
            <a
              href="#technology"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm text-[#8B8E94] hover:text-[#EDEDEA]"
            >
              Technology
            </a>
            <a
              href="#datasets"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm text-[#8B8E94] hover:text-[#EDEDEA]"
            >
              Datasets
            </a>
            <div className="pt-2 border-t border-[var(--line)] flex flex-col gap-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm text-[#8B8E94] hover:text-[#EDEDEA]"
              >
                Sign in
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] bg-[#C41E7D] text-white text-sm font-medium"
              >
                <span>Explore platform</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ------------------------------------------------------------------ */}
      {/* 2. HERO SECTION (150vh sticky scroll container)                     */}
      {/* ------------------------------------------------------------------ */}
      <div ref={heroContainerRef} className="relative h-[150vh] w-full">
        <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden pt-16">
          <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 min-[860px]:grid-cols-12 gap-8 min-[860px]:gap-12 items-center">
            {/* Left Copy Column */}
            <div className="min-[860px]:col-span-6 flex flex-col items-start text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[6px] bg-[#131519] border border-[var(--line)] text-xs text-[#C41E7D] font-medium mb-6">
                <Sparkles className="w-3.5 h-3.5 text-[#C41E7D]" />
                <span>SIH26013 — GEOSPATIAL INTELLIGENCE</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#EDEDEA] leading-[1.12] mb-6">
                Every department maps the same land differently.
              </h1>

              <p className="text-base sm:text-lg text-[#8B8E94] leading-relaxed mb-8 max-w-xl">
                GramSeva unifies drone imagery, cadastral maps, municipal GIS,
                and revenue records into one confidence-scored view of every
                land parcel.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-[8px] bg-[#C41E7D] hover:bg-[#8A1657] text-white font-medium text-sm transition-colors focus-visible:outline-none shadow-sm"
                >
                  <span>Explore platform</span>
                  <span className="text-base leading-none">→</span>
                </Link>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-[8px] border border-[var(--line-strong)] hover:border-[#C41E7D] text-[#EDEDEA] font-medium text-sm transition-colors focus-visible:outline-none"
                >
                  See how it works
                </a>
              </div>

              {/* Muted Caption */}
              <p className="text-xs text-[#5C6067] leading-normal">
                Prototype built for Smart India Hackathon 2026, problem
                statement SIH26013.
              </p>
            </div>

            {/* Right Globe Panel */}
            <div className="min-[860px]:col-span-6 w-full flex justify-center min-[860px]:justify-end">
              <div className="w-full max-w-[500px] h-[440px] sm:h-[480px] rounded-[10px] border border-[var(--line)] bg-[#0A0B0D] relative overflow-hidden flex flex-col justify-between">
                {/* Three.js Earth globe */}
                <EarthGlobe progressRef={heroProgressRef} />

                {/* Bottom-left pinned caption strip */}
                <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-[#0A0B0D]/85 border border-[var(--line)] backdrop-blur-sm text-[11px] text-[#8B8E94]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C41E7D] animate-pulse" />
                    <span>Scroll to zoom into India</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 3. STATS STRIP                                                     */}
      {/* ------------------------------------------------------------------ */}
      <section
        ref={statsRef}
        className="w-full border-y border-[var(--line)] bg-[#0A0B0D] py-10"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 min-[720px]:grid-cols-4 divide-y min-[720px]:divide-y-0 divide-x-0 min-[720px]:divide-x divide-[var(--line)]">
            <div className="p-4 sm:p-6 flex flex-col items-start min-[720px]:items-center text-left min-[720px]:text-center">
              <StatNumber
                target={6}
                formattedTarget="6"
                shouldAnimate={statsRevealed}
              />
              <span className="mt-2 text-xs sm:text-sm font-medium text-[#8B8E94]">
                Sources integrated
              </span>
            </div>

            <div className="p-4 sm:p-6 flex flex-col items-start min-[720px]:items-center text-left min-[720px]:text-center">
              <StatNumber
                target={1247}
                formattedTarget="1,247"
                shouldAnimate={statsRevealed}
              />
              <span className="mt-2 text-xs sm:text-sm font-medium text-[#8B8E94]">
                Parcels processed
              </span>
            </div>

            <div className="p-4 sm:p-6 flex flex-col items-start min-[720px]:items-center text-left min-[720px]:text-center">
              <StatNumber
                target={1089}
                formattedTarget="1,089"
                shouldAnimate={statsRevealed}
              />
              <span className="mt-2 text-xs sm:text-sm font-medium text-[#8B8E94]">
                Entities matched
              </span>
            </div>

            <div className="p-4 sm:p-6 flex flex-col items-start min-[720px]:items-center text-left min-[720px]:text-center">
              <StatNumber
                target={43}
                formattedTarget="43"
                shouldAnimate={statsRevealed}
              />
              <span className="mt-2 text-xs sm:text-sm font-medium text-[#8B8E94]">
                Conflicts detected
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 4. WHY GRAMSEVA                                                    */}
      {/* ------------------------------------------------------------------ */}
      <section className="w-full py-24 border-b border-[var(--line)]">
        <div
          ref={whyRef}
          className={`max-w-6xl mx-auto px-6 transition-all duration-700 ${
            whyRevealed
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          {/* Heading + Intro */}
          <div className="max-w-3xl mb-12 text-left">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#EDEDEA] mb-4">
              Why GramSeva
            </h2>
            <p className="text-base sm:text-lg text-[#8B8E94] leading-relaxed">
              Urban land administration relies on fragmented datasets managed across
              disparate departments. GramSeva continuously ingests, normalizes, and
              matches multi-modal geospatial layers into one harmonized record.
            </p>
          </div>

          {/* Source Badges Row */}
          <div className="flex flex-wrap gap-2.5 mb-16">
            {[
              "Cadastral maps",
              "Drone imagery",
              "Municipal GIS",
              "Revenue records",
              "Satellite data",
              "GNSS/CORS",
              "DSM/DTM",
              "Building footprints",
            ].map((source) => (
              <span
                key={source}
                className="px-3.5 py-1.5 rounded-[20px] bg-[#131519] border border-[var(--line)] text-xs font-medium text-[#8B8E94]"
              >
                {source}
              </span>
            ))}
          </div>

          {/* Two-Panel Comparison */}
          <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 relative">
            {/* Left Panel: Fragmented Sources */}
            <div className="flex-1 p-6 sm:p-8 rounded-[10px] border border-[var(--line)] bg-[#131519]/60 flex flex-col justify-between">
              <div>
                <h3 className="font-display text-xl font-bold text-[#EDEDEA] mb-2">
                  Fragmented sources
                </h3>
                <p className="text-xs text-[#5C6067] mb-6">
                  Raw un-harmonized departmental silos
                </p>

                <ul className="space-y-3 text-sm text-[#8B8E94]">
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5C6067]" />
                    <span>Different formats (GeoJSON, SHP, CAD, TIFF)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5C6067]" />
                    <span>Mismatched coordinate reference systems (CRS)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5C6067]" />
                    <span>Inconsistent naming and attribute schemas</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5C6067]" />
                    <span>Conflicting temporal survey versions</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Central Transition Indicator */}
            <div className="flex items-center justify-center py-2 md:py-0">
              <div className="w-10 h-10 rounded-full border border-[var(--line-strong)] bg-[#131519] flex items-center justify-center text-[#C41E7D] text-lg font-bold">
                →
              </div>
            </div>

            {/* Right Panel: One Understanding */}
            <div className="flex-1 p-6 sm:p-8 rounded-[10px] border border-[#C41E7D] bg-[var(--magenta-glow)] flex flex-col justify-between">
              <div>
                <h3 className="font-display text-xl font-bold text-[#EDEDEA] mb-2">
                  One understanding
                </h3>
                <p className="text-xs text-[#C41E7D] mb-6">
                  GramSeva unified geospatial truth
                </p>

                <ul className="space-y-3 text-sm text-[#EDEDEA]">
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C41E7D]" />
                    <span>Harmonized geometry & validated topology</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C41E7D]" />
                    <span>Unified attribute dictionary & taxonomy</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C41E7D]" />
                    <span>Confidence scored entity matching</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C41E7D]" />
                    <span>Explainable AI evidence & human-in-the-loop review</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 5. HOW IT WORKS — PIPELINE                                         */}
      {/* ------------------------------------------------------------------ */}
      <section
        id="how-it-works"
        className="w-full py-24 border-b border-[var(--line)] bg-[#0A0B0D]"
      >
        <div
          ref={pipelineRef}
          className={`max-w-6xl mx-auto px-6 transition-all duration-700 ${
            pipelineRevealed
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="text-left mb-16 max-w-3xl">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#EDEDEA] mb-4">
              How GramSeva Works
            </h2>
            <p className="text-base sm:text-lg text-[#8B8E94]">
              A continuous pipeline from raw data to unified, confidence-scored land records.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 min-[900px]:grid-cols-9 gap-3">
            {pipelineSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.label}
                  className="p-4 rounded-[10px] border border-[var(--line)] bg-[#131519] flex flex-col items-center justify-center text-center gap-3 group hover:border-[#C41E7D] transition-colors"
                >
                  <div className="w-10 h-10 rounded-[8px] bg-[var(--magenta-glow)] border border-[#C41E7D]/30 flex items-center justify-center text-[#C41E7D] group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-[#EDEDEA]">
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 6. PLATFORM FEATURES                                              */}
      {/* ------------------------------------------------------------------ */}
      <section id="features" className="w-full py-24 border-b border-[var(--line)]">
        <div
          ref={featuresRef}
          className={`max-w-6xl mx-auto px-6 transition-all duration-700 ${
            featuresRevealed
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="text-left mb-16 max-w-3xl">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#EDEDEA] mb-4">
              Platform Features
            </h2>
            <p className="text-base sm:text-lg text-[#8B8E94]">
              Every capability designed for real geospatial intelligence workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Puzzle,
                title: "AI Spatial Matching",
                description:
                  "Multi-evidence entity matching combining geometry, attributes, visual similarity, and temporal consistency.",
              },
              {
                icon: Radar,
                title: "Conflict Radar",
                description:
                  "Detect boundary, area, attribute, temporal, and topology conflicts across all data sources.",
              },
              {
                icon: Clock,
                title: "Land Time Machine",
                description:
                  "Temporal change detection showing construction, demolition, expansion, and land-use changes.",
              },
              {
                icon: BarChart3,
                title: "Confidence Map",
                description:
                  "Spatial visualization of harmonization confidence with full evidence breakdown.",
              },
              {
                icon: Sparkles,
                title: "Explainable AI",
                description:
                  "Every AI decision provides model used, evidence, confidence, and source references.",
              },
              {
                icon: Eye,
                title: "Human Review",
                description:
                  "Review queue with side-by-side source comparison, AI evidence, and resolution workflow.",
              },
              {
                icon: FileCheck,
                title: "Unified Records",
                description:
                  "Canonical land records with complete provenance, audit history, and source traceability.",
              },
              {
                icon: Globe,
                title: "2D / 3D GIS",
                description:
                  "Professional GIS workspace with MapLibre, Deck.gl, and CesiumJS for immersive spatial analysis.",
              },
            ].map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="p-6 rounded-[10px] border border-[var(--line)] bg-[#131519] hover:border-[var(--line-strong)] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-9 h-9 rounded-[8px] bg-[var(--magenta-glow)] border border-[#C41E7D]/30 flex items-center justify-center text-[#C41E7D] mb-4">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-display text-base font-bold text-[#EDEDEA] mb-2">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-[#8B8E94] leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 7. AI + GIS ARCHITECTURE                                           */}
      {/* ------------------------------------------------------------------ */}
      <section id="technology" className="w-full py-24 border-b border-[var(--line)] bg-[#0A0B0D]">
        <div
          ref={techRef}
          className={`max-w-6xl mx-auto px-6 transition-all duration-700 ${
            techRevealed
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="text-left mb-16 max-w-3xl">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#EDEDEA] mb-4">
              AI + GIS Architecture
            </h2>
            <p className="text-base sm:text-lg text-[#8B8E94]">
              AI understands images, entities, and changes. GIS performs precise spatial operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Column */}
            <div className="p-6 sm:p-8 rounded-[10px] border border-[#C41E7D]/40 bg-[var(--magenta-glow)]/40">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-[6px] bg-[#C41E7D] flex items-center justify-center text-white">
                  <Cpu className="w-4 h-4" />
                </div>
                <h3 className="font-display text-lg font-bold text-[#EDEDEA]">
                  AI Engine
                </h3>
              </div>
              <div className="space-y-3">
                {[
                  { name: "SegFormer-B2", desc: "Building & feature extraction" },
                  { name: "Siamese ResNet-50", desc: "Visual entity matching" },
                  { name: "SBERT", desc: "Semantic attribute matching" },
                  { name: "ChangeFormer", desc: "Temporal change detection" },
                ].map((m) => (
                  <div
                    key={m.name}
                    className="flex items-center justify-between p-3.5 rounded-[8px] bg-[#131519] border border-[var(--line)]"
                  >
                    <span className="text-sm font-semibold text-[#EDEDEA]">
                      {m.name}
                    </span>
                    <span className="text-xs text-[#8B8E94]">{m.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* GIS Column */}
            <div className="p-6 sm:p-8 rounded-[10px] border border-[var(--line)] bg-[#131519]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-[6px] bg-[#131519] border border-[var(--line-strong)] flex items-center justify-center text-[#EDEDEA]">
                  <Globe className="w-4 h-4" />
                </div>
                <h3 className="font-display text-lg font-bold text-[#EDEDEA]">
                  GIS Engine
                </h3>
              </div>
              <div className="space-y-3">
                {[
                  { name: "PostGIS", desc: "Spatial database & indexes" },
                  { name: "GeoPandas", desc: "Geospatial data processing" },
                  { name: "Shapely", desc: "Geometry operations & validation" },
                  { name: "GDAL / PROJ", desc: "CRS transformation & format I/O" },
                ].map((m) => (
                  <div
                    key={m.name}
                    className="flex items-center justify-between p-3.5 rounded-[8px] bg-[#0A0B0D] border border-[var(--line)]"
                  >
                    <span className="text-sm font-semibold text-[#EDEDEA]">
                      {m.name}
                    </span>
                    <span className="text-xs text-[#8B8E94]">{m.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 8. DATASETS & ECOSYSTEM                                            */}
      {/* ------------------------------------------------------------------ */}
      <section id="datasets" className="w-full py-24 border-b border-[var(--line)]">
        <div
          ref={datasetsRef}
          className={`max-w-6xl mx-auto px-6 transition-all duration-700 ${
            datasetsRevealed
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="text-left mb-16 max-w-3xl">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#EDEDEA] mb-4">
              Datasets & Ecosystem
            </h2>
            <p className="text-base sm:text-lg text-[#8B8E94]">
              Designed around the SIH26013 land-record harmonization problem and its NAKSHA ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                name: "NAKSHA / DoLR",
                desc: "National spatial framework and land record digitization context.",
                tag: "Public Context",
              },
              {
                name: "SpaceNet",
                desc: "High-resolution satellite imagery with building footprint annotations.",
                tag: "Research",
              },
              {
                name: "Bhuvan / NRSC",
                desc: "Indian geo-platform with thematic and multi-spectral data layers.",
                tag: "Public",
              },
              {
                name: "OpenStreetMap",
                desc: "Community-contributed roads, buildings, land-use, and POI data.",
                tag: "Open Source",
              },
              {
                name: "Synthetic Benchmark",
                desc: "Controlled multi-source benchmark with ground-truth relationships.",
                tag: "Generated",
              },
            ].map((ds) => (
              <div
                key={ds.name}
                className="p-6 rounded-[10px] border border-[var(--line)] bg-[#131519] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-base font-bold text-[#EDEDEA]">
                      {ds.name}
                    </h3>
                    <span className="text-[10px] font-semibold text-[#C41E7D] px-2 py-0.5 rounded-[4px] bg-[var(--magenta-glow)] border border-[#C41E7D]/30">
                      {ds.tag}
                    </span>
                  </div>
                  <p className="text-xs text-[#8B8E94] leading-relaxed">
                    {ds.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 9. FINAL CTA SECTION                                               */}
      {/* ------------------------------------------------------------------ */}
      <section className="w-full py-28 border-b border-[var(--line)] bg-[#131519]/40">
        <div
          ref={ctaRef}
          className={`max-w-4xl mx-auto px-6 text-center transition-all duration-700 ${
            ctaRevealed
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#EDEDEA] mb-6 leading-tight">
            From fragmented land data <br />
            to one trusted view.
          </h2>
          <p className="text-lg text-[#8B8E94] mb-10">
            One Map. One Truth. Smarter Land Records.
          </p>
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-[8px] bg-[#C41E7D] hover:bg-[#8A1657] text-white text-base font-medium transition-colors focus-visible:outline-none shadow-md"
            >
              <span>Open GramSeva Workspace</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 10. FOOTER                                                         */}
      {/* ------------------------------------------------------------------ */}
      <footer className="w-full border-t border-[var(--line)] py-8 bg-[#0A0B0D]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8B8E94]">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-sm text-[#EDEDEA]">
              GramSeva
            </span>
          </div>

          <div>Smart India Hackathon 2026 · SIH26013</div>
        </div>
      </footer>
    </div>
  );
}
