"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
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
  Satellite,
  Building2,
  Layers,
  TreePine,
  Network,
} from "lucide-react";
import AnimatedHeroMap from "@/components/AnimatedHeroMap";

/*  SECTION REVEAL WRAPPER                                              */
/* ------------------------------------------------------------------ */
function SectionReveal({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

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
function FeatureCard({ icon: Icon, title, description, delay }: { icon: any; title: string; description: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="group p-4 lg:p-5 rounded-[1.25rem] border-[1.5px] border-border bg-white hover:border-[#860F61]/30 hover:shadow-[0_4px_24px_rgba(134,15,97,0.08)] transition-all duration-300 flex flex-col"
    >
      {/* Visual Header Panel (Compact micro-visualization area) */}
      <div className="w-full h-20 md:h-24 mb-4 lg:mb-5 rounded-xl bg-surface-card border border-border/60 relative overflow-hidden flex items-center justify-center group-hover:bg-[#860F61]/[0.02] transition-colors">
        {/* Full bleed, realistic GIS micro-visualization */}
        <Icon className="w-full h-full text-[#860F61] transition-transform duration-[1.5s] group-hover:scale-105" />
      </div>

      <h3 className="text-sm md:text-base font-bold text-foreground mb-1.5">{title}</h3>
      <p className="text-[13px] md:text-sm text-neutral-dark leading-snug font-medium line-clamp-3">{description}</p>
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
/*  PIPELINE SVG VISUALS                                                */
/* ================================================================== */
/*  PIPELINE SVG VISUALS                                                */
/* ================================================================== */

const IngestVisual = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.2">
    <motion.polygon points="12,18 20,14 12,10 4,14" fill="currentColor" fillOpacity="0.05" animate={{ y: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity }} />
    <motion.polygon points="12,14 20,10 12,6 4,10" fill="currentColor" fillOpacity="0.05" animate={{ y: [0, 2, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.2 }} />
    <motion.polygon points="12,10 20,6 12,2 4,6" fill="currentColor" fillOpacity="0.2" strokeWidth="1.5" animate={{ y: [0, 3, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.4 }} />
    <motion.path d="M12,0 L12,4 M10,2 L12,4 L14,2" strokeWidth="1.5" animate={{ y: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 1.5 }} />
  </svg>
);

const NormalizeVisual = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor">
    <motion.g animate={{ rotate: [15, 0, 15] }} style={{ originX: "6px", originY: "12px" }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
      <rect x="2" y="8" width="8" height="8" strokeWidth="1" strokeDasharray="2 2" />
    </motion.g>
    <path d="M11,12 L13,12" strokeWidth="1.2" strokeOpacity="0.5" />
    <path d="M12,11 L13,12 L12,13" strokeWidth="1.2" strokeOpacity="0.5" />
    <rect x="15" y="8" width="8" height="8" strokeWidth="1.5" fill="currentColor" fillOpacity="0.05" />
    <line x1="19" y1="8" x2="19" y2="16" strokeWidth="1" strokeOpacity="0.5" />
    <line x1="15" y1="12" x2="23" y2="12" strokeWidth="1" strokeOpacity="0.5" />
  </svg>
);

const ExtractVisual = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor">
    <rect x="2" y="2" width="20" height="20" strokeWidth="1" strokeOpacity="0.3" />
    <motion.polygon points="6,6 12,6 14,10 6,12" fill="currentColor" strokeWidth="1.5"
      initial={{ fillOpacity: 0, pathLength: 0 }}
      animate={{ fillOpacity: [0, 0.2, 0], pathLength: [0, 1, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.polygon points="14,14 18,12 20,16 16,18" fill="currentColor" strokeWidth="1"
      initial={{ fillOpacity: 0, pathLength: 0 }}
      animate={{ fillOpacity: [0, 0.1, 0], pathLength: [0, 1, 0] }}
      transition={{ duration: 3, repeat: Infinity, delay: 0.5, ease: "easeInOut" }}
    />
  </svg>
);

const MatchVisual = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor">
    <motion.polygon points="4,10 12,6 20,10 12,14" strokeWidth="1.2" fill="currentColor" fillOpacity="0.05" animate={{ x: [-2, 0, -2], y: [-2, 0, -2] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
    <motion.polygon points="4,14 12,10 20,14 12,18" strokeWidth="1.5" fill="currentColor" fillOpacity="0.05" animate={{ x: [2, 0, 2], y: [2, 0, 2] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
  </svg>
);

const ChangeVisual = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor">
    <rect x="2" y="4" width="9" height="16" strokeWidth="1" strokeOpacity="0.4" />
    <rect x="13" y="4" width="9" height="16" strokeWidth="1.5" />
    <rect x="4" y="8" width="5" height="8" strokeWidth="1" />
    <rect x="15" y="8" width="5" height="3" strokeWidth="1" fill="currentColor" fillOpacity="0.2" />
    <motion.rect x="15" y="13" width="5" height="3" strokeWidth="1" fill="currentColor" animate={{ fillOpacity: [0, 0.3, 0] }} transition={{ duration: 2, repeat: Infinity }} />
    <motion.line x1="11.5" y1="2" x2="11.5" y2="22" strokeWidth="1" strokeOpacity="0.6" strokeDasharray="2 2" animate={{ x: [-1, 1, -1] }} transition={{ duration: 3, repeat: Infinity }} />
  </svg>
);

const ConflictVisual = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor">
    <polygon points="3,8 13,8 13,18 3,18" strokeWidth="1" strokeOpacity="0.6" />
    <polygon points="10,5 20,5 20,15 10,15" strokeWidth="1.5" />
    <motion.path d="M10,8 L13,8 L13,15 L10,15 Z" fill="currentColor" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" animate={{ fillOpacity: [0.1, 0.4, 0.1], strokeOpacity: [0.2, 1, 0.2] }} transition={{ duration: 1.5, repeat: Infinity }} />
    <motion.line x1="11.5" y1="10" x2="11.5" y2="12" strokeWidth="1.5" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
    <motion.circle cx="11.5" cy="13.5" r="0.8" fill="currentColor" stroke="none" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
  </svg>
);

const ConfidenceVisual = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor">
    <polygon points="4,13 12,7 20,13 12,19" strokeWidth="1.5" fill="currentColor" fillOpacity="0.05" />
    <motion.rect x="13" y="1" width="10" height="7" rx="1.5" fill="currentColor" fillOpacity="0.1" strokeWidth="1" animate={{ y: [0, -2, 0] }} transition={{ duration: 3, repeat: Infinity }} />
    <line x1="15" y1="6" x2="15" y2="4" strokeWidth="1.5" strokeLinecap="round" />
    <motion.line x1="18" y1="6" x2="18" y2="2" strokeWidth="1.5" strokeLinecap="round" animate={{ y2: [6, 2, 6] }} transition={{ duration: 2, repeat: Infinity }} />
    <motion.line x1="21" y1="6" x2="21" y2="4" strokeWidth="1.5" strokeLinecap="round" animate={{ y2: [6, 4, 6] }} transition={{ duration: 2.5, repeat: Infinity }} />
    <line x1="12" y1="10" x2="15" y2="7" strokeWidth="0.5" strokeDasharray="1 1" />
  </svg>
);

const ReviewVisual = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor">
    <polygon points="3,11 13,5 21,13 11,19" strokeWidth="1.2" fill="currentColor" fillOpacity="0.05" />
    <motion.g animate={{ x: [0, -4, 0], y: [0, 4, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
      <circle cx="15" cy="7" r="3" strokeWidth="1.5" />
      <path d="M17,9 L20,12" strokeWidth="1.5" />
    </motion.g>
    <rect x="15" y="14" width="7" height="7" rx="1.5" strokeWidth="1.2" />
    <motion.path d="M16.5,17.5 L18,19 L20.5,16" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, repeat: Infinity }} />
  </svg>
);

const UnifyVisual = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor">
    <motion.polygon points="12,12 20,8 12,4 4,8" strokeWidth="1" fill="currentColor" fillOpacity="0.05" animate={{ y: [0, 6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
    <motion.polygon points="12,16 20,12 12,8 4,12" strokeWidth="1.2" fill="currentColor" fillOpacity="0.1" animate={{ y: [0, 3, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
    <polygon points="12,20 20,16 12,12 4,16" strokeWidth="2" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

/* ================================================================== */
/*  PLATFORM FEATURES SVG VISUALS                                     */
/* ================================================================== */

const FeatureMatchVisual = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 240 100" className={className} preserveAspectRatio="xMidYMid slice" fill="none" stroke="currentColor">
    <rect width="100%" height="100%" fill="currentColor" fillOpacity="0.02" />
    <g strokeOpacity="0.1" strokeWidth="1">
      <line x1="0" y1="20" x2="240" y2="20" /><line x1="0" y1="60" x2="240" y2="60" />
      <line x1="40" y1="0" x2="40" y2="100" /><line x1="100" y1="0" x2="100" y2="100" /><line x1="180" y1="0" x2="180" y2="100" />
      <polygon points="10,30 30,25 35,50 5,60" fill="currentColor" fillOpacity="0.03" />
      <polygon points="120,70 150,60 170,90 130,95" fill="currentColor" fillOpacity="0.04" />
    </g>
    <motion.g animate={{ x: [-15, 0, -15], y: [-5, 0, -5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
      <polygon points="90,30 140,25 150,65 100,75" strokeWidth="2" strokeOpacity="0.4" fill="currentColor" fillOpacity="0.05" strokeDasharray="4 4" />
      <text x="110" y="50" fontSize="8" opacity="0.4" fill="currentColor" stroke="none">Layer A</text>
    </motion.g>
    <motion.g animate={{ x: [15, 0, 15], y: [5, 0, 5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
      <polygon points="90,30 140,25 150,65 100,75" strokeWidth="2" fill="currentColor" fillOpacity="0.05" />
      <text x="115" y="60" fontSize="8" opacity="0.4" fill="currentColor" stroke="none">Layer B</text>
    </motion.g>
    <motion.polygon points="90,30 140,25 150,65 100,75" stroke="currentColor" strokeWidth="2" fill="currentColor" animate={{ fillOpacity: [0, 0.2, 0], opacity: [0, 1, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
    <motion.circle cx="120" cy="50" r="4" fill="currentColor" stroke="none" animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
  </svg>
);

const FeatureConflictVisual = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 240 100" className={className} preserveAspectRatio="xMidYMid slice" fill="none" stroke="currentColor">
    <rect width="100%" height="100%" fill="currentColor" fillOpacity="0.02" />
    <g strokeOpacity="0.1" strokeWidth="1">
      <path d="M0,40 Q40,60 80,30 T160,50 T240,40" />
      <path d="M40,0 L60,100 M160,0 L140,100" />
      <polygon points="10,10 30,10 30,30 10,30" fill="currentColor" fillOpacity="0.04" />
      <polygon points="180,60 210,50 200,90 170,95" fill="currentColor" fillOpacity="0.04" />
    </g>
    <polygon points="70,25 120,25 110,75 60,75" strokeWidth="1.5" strokeOpacity="0.6" fill="currentColor" fillOpacity="0.05" />
    <text x="75" y="45" fontSize="8" opacity="0.6" fill="currentColor" stroke="none">PID-42A</text>
    <polygon points="100,20 160,30 150,80 90,70" strokeWidth="1.5" strokeOpacity="0.6" fill="currentColor" fillOpacity="0.05" />
    <text x="125" y="60" fontSize="8" opacity="0.6" fill="currentColor" stroke="none">PID-42B</text>
    <motion.path d="M100,25 L120,25 L110,75 L91,70.5 Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" animate={{ fillOpacity: [0.1, 0.4, 0.1], strokeOpacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} />
    <motion.g animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
      <line x1="105" y1="45" x2="135" y2="25" strokeWidth="1" strokeOpacity="0.5" />
      <rect x="135" y="10" width="50" height="20" rx="3" fill="white" strokeWidth="1" />
      <circle cx="145" cy="20" r="3" fill="currentColor" stroke="none" />
      <text x="152" y="23" fontSize="7" fontWeight="bold" fill="currentColor" stroke="none">0.24 Ha Conflict</text>
    </motion.g>
  </svg>
);

const FeatureTimeVisual = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 240 100" className={className} preserveAspectRatio="xMidYMid slice" fill="none" stroke="currentColor">
    <rect width="100%" height="100%" fill="currentColor" fillOpacity="0.02" />
    <g strokeOpacity="0.15" strokeWidth="1">
      <path d="M30,0 C60,40 100,60 240,40" strokeWidth="4" />
      <polygon points="50,20 100,10 110,40 60,50" fill="currentColor" fillOpacity="0.05" />
      <text x="65" y="35" fontSize="8" opacity="0.4" fill="currentColor" stroke="none">Empty Plot (2018)</text>
    </g>
    <clipPath id="sliderClip">
      <motion.rect x="0" y="0" width="240" height="100" animate={{ width: [0, 240, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
    </clipPath>
    <g clipPath="url(#sliderClip)">
      <rect width="100%" height="100%" fill="currentColor" fillOpacity="0.04" />
      <path d="M30,0 C60,40 100,60 240,40" strokeWidth="4" strokeOpacity="0.2" />
      <polygon points="50,20 100,10 110,40 60,50" fill="currentColor" fillOpacity="0.1" strokeOpacity="0.4" strokeWidth="1.5" />
      <rect x="70" y="20" width="15" height="10" transform="rotate(15 70 20)" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1" />
      <rect x="85" y="25" width="10" height="10" transform="rotate(15 85 25)" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1" />
      <text x="65" y="35" fontSize="8" fill="white" stroke="none" fontWeight="bold">Developed Built-up (2025)</text>
    </g>
    <motion.g animate={{ x: [0, 240, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
      <line x1="0" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="2" strokeOpacity="0.8" />
      <rect x="-15" y="40" width="30" height="20" rx="10" fill="white" stroke="currentColor" strokeWidth="2" />
      <line x1="-4" y1="45" x2="-4" y2="55" stroke="currentColor" strokeWidth="1.5" />
      <line x1="4" y1="45" x2="4" y2="55" stroke="currentColor" strokeWidth="1.5" />
    </motion.g>
  </svg>
);

const FeatureConfidenceVisual = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 240 100" className={className} preserveAspectRatio="xMidYMid slice" fill="none" stroke="currentColor">
    <rect width="100%" height="100%" fill="currentColor" fillOpacity="0.02" />
    <polygon points="20,20 70,15 65,55 15,60" fill="currentColor" fillOpacity="0.05" strokeWidth="1" strokeOpacity="0.2" />
    <polygon points="70,15 130,20 125,60 65,55" fill="currentColor" fillOpacity="0.1" strokeWidth="1" strokeOpacity="0.2" />
    <polygon points="130,20 190,15 185,55 125,60" fill="currentColor" fillOpacity="0.05" strokeWidth="1" strokeOpacity="0.2" />
    <motion.polygon points="70,15 130,20 125,60 65,55" strokeWidth="2" fill="currentColor" animate={{ fillOpacity: [0.1, 0.25, 0.1], strokeOpacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }} />
    <motion.g animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
      <line x1="100" y1="40" x2="100" y2="25" strokeWidth="1.5" />
      <rect x="70" y="5" width="60" height="20" rx="3" fill="white" strokeWidth="1" strokeOpacity="0.5" />
      <rect x="75" y="10" width="10" height="10" rx="3" fill="currentColor" stroke="none" />
      <text x="90" y="18" fontSize="8" fontWeight="bold" fill="currentColor" stroke="none">99.8% VERIFIED</text>
    </motion.g>
  </svg>
);

const FeatureExplainBaseVisual = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 240 100" className={className} preserveAspectRatio="xMidYMid slice" fill="none" stroke="currentColor">
    <rect x="20" y="15" width="40" height="20" rx="2" strokeWidth="1" fill="currentColor" fillOpacity="0.02" />
    <text x="25" y="27" fontSize="6" opacity="0.6" stroke="none" fill="currentColor">Document A</text>
    <rect x="20" y="40" width="40" height="20" rx="2" strokeWidth="1" fill="currentColor" fillOpacity="0.02" />
    <text x="25" y="52" fontSize="6" opacity="0.6" stroke="none" fill="currentColor">Cadastral X</text>
    <rect x="20" y="65" width="40" height="20" rx="2" strokeWidth="1" fill="currentColor" fillOpacity="0.02" />
    <text x="25" y="77" fontSize="6" opacity="0.6" stroke="none" fill="currentColor">Satellite Y</text>

    <motion.path d="M60,25 C90,25 90,50 120,50" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 3" animate={{ strokeDashoffset: [10, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
    <motion.path d="M60,50 C90,50 90,50 120,50" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 3" animate={{ strokeDashoffset: [10, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
    <motion.path d="M60,75 C90,75 90,50 120,50" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 3" animate={{ strokeDashoffset: [10, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />

    <circle cx="120" cy="50" r="15" strokeWidth="2" fill="white" />
    <motion.circle cx="120" cy="50" r="8" fill="currentColor" fillOpacity="0.2" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />

    <motion.path d="M135,50 L170,50" strokeWidth="1.5" strokeOpacity="0.8" />
    <rect x="170" y="35" width="50" height="30" rx="4" strokeWidth="1.5" fill="white" stroke="currentColor" />
    <text x="178" y="50" fontSize="7" fontWeight="bold" stroke="none" fill="currentColor">AI DECISION</text>
    <rect x="178" y="55" width="30" height="3" rx="1.5" fill="currentColor" fillOpacity="0.3" stroke="none" />
  </svg>
);

const FeatureReviewVisual = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 240 100" className={className} preserveAspectRatio="xMidYMid slice" fill="none" stroke="currentColor">
    <rect x="10" y="10" width="220" height="80" rx="4" strokeWidth="1.5" fill="white" />
    <line x1="10" y1="22" x2="230" y2="22" strokeWidth="1" strokeOpacity="0.2" />
    <circle cx="20" cy="16" r="2" fill="currentColor" stroke="none" opacity="0.3" />
    <circle cx="28" cy="16" r="2" fill="currentColor" stroke="none" opacity="0.3" />
    <text x="35" y="18" fontSize="6" opacity="0.5" stroke="none" fill="black">Task Queue #4252</text>

    <rect x="15" y="28" width="100" height="55" rx="2" strokeWidth="1" strokeOpacity="0.2" fill="currentColor" fillOpacity="0.02" />
    <text x="20" y="35" fontSize="5" opacity="0.5" stroke="none" fill="black">Target A</text>
    <polygon points="30,45 80,40 70,75 40,70" strokeWidth="1" fill="currentColor" fillOpacity="0.05" />

    <rect x="125" y="28" width="100" height="55" rx="2" strokeWidth="1" strokeOpacity="0.2" fill="currentColor" fillOpacity="0.02" />
    <text x="130" y="35" fontSize="5" opacity="0.5" stroke="none" fill="black">Target B</text>
    <polygon points="140,40 190,45 185,70 150,75" strokeWidth="1" fill="currentColor" fillOpacity="0.05" />

    <motion.g animate={{ x: [0, 15, 0], y: [0, 5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
      <line x1="150" y1="50" x2="170" y2="50" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.5" />
      <line x1="160" y1="40" x2="160" y2="60" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.5" />
      <circle cx="160" cy="50" r="4" strokeWidth="1.5" fill="white" />
    </motion.g>

    <rect x="85" y="72" width="25" height="8" rx="2" fill="currentColor" stroke="none" opacity="0.1" />
    <rect x="115" y="72" width="30" height="8" rx="2" fill="currentColor" stroke="none" />
    <text x="119" y="78" fontSize="5" fill="white" stroke="none" fontWeight="bold">APPROVE</text>
  </svg>
);

const FeatureUnifiedVisual = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 240 100" className={className} preserveAspectRatio="xMidYMid slice" fill="none" stroke="currentColor">
    <g transform="translate(120, 50)">
      <motion.g animate={{ y: [-30, 0, -30] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
        <polygon points="0,-15 50,0 0,15 -50,0" strokeWidth="1" fill="currentColor" fillOpacity="0.02" />
        <rect x="-10" y="-5" width="20" height="10" fill="currentColor" fillOpacity="0.1" stroke="none" transform="rotate(20)" />
      </motion.g>
      <motion.g animate={{ y: [-15, 0, -15] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
        <polygon points="0,-15 50,0 0,15 -50,0" strokeWidth="1.2" fill="currentColor" fillOpacity="0.05" />
        <circle cx="0" cy="0" r="8" fill="currentColor" fillOpacity="0.2" stroke="none" />
      </motion.g>
      <polygon points="0,-15 50,0 0,15 -50,0" strokeWidth="2.5" fill="currentColor" fillOpacity="0.1" />
      <motion.polygon points="0,-15 50,0 0,15 -50,0" fill="currentColor" stroke="none" animate={{ fillOpacity: [0.1, 0.3, 0.1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
      <polyline points="50,0 50,5 0,20 -50,5 -50,0" strokeWidth="1.5" />
      <line x1="0" y1="15" x2="0" y2="20" strokeWidth="1.5" />
    </g>
  </svg>
);

const FeatureGISVisual = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 240 100" className={className} preserveAspectRatio="xMidYMid slice" fill="none" stroke="currentColor">
    <motion.g animate={{ rotateX: [0, 60, 0] }} style={{ transformOrigin: "120px 50px" }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
      <rect x="50" y="10" width="140" height="80" rx="4" strokeWidth="1.5" fill="currentColor" fillOpacity="0.02" />
      <path d="M70,10 L70,90 M110,10 L110,90 M160,10 L160,90" strokeWidth="1" strokeOpacity="0.2" />
      <path d="M50,30 L190,30 M50,60 L190,60" strokeWidth="1" strokeOpacity="0.2" />
      <polygon points="75,35 105,35 105,55 75,55" fill="currentColor" fillOpacity="0.05" strokeWidth="1" />
      <polygon points="115,15 155,15 155,25 115,25" fill="currentColor" fillOpacity="0.1" strokeWidth="1" />
      <motion.g animate={{ opacity: [0, 1, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
        <line x1="75" y1="35" x2="75" y2="15" strokeWidth="1" strokeOpacity="0.8" />
        <line x1="105" y1="35" x2="105" y2="15" strokeWidth="1" strokeOpacity="0.8" />
        <line x1="105" y1="55" x2="105" y2="35" strokeWidth="1" strokeOpacity="0.8" />
        <polygon points="75,15 105,15 105,35 75,35" fill="currentColor" fillOpacity="0.3" strokeWidth="1.5" />
      </motion.g>
    </motion.g>
  </svg>
);

/* ================================================================== */
/*  JOURNEY STAGE WRAPPER                                             */
/* ================================================================== */
const JourneyStage = ({ title, children, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="relative flex flex-col items-center shrink-0 w-[170px] xl:w-[12vw] max-w-[185px] snap-center group gap-2 z-10"
  >
    {/* GIS Window Frame */}
    <div className="relative w-full h-[170px] xl:h-[180px] bg-white/40 backdrop-blur-sm border-[1.5px] border-border hover:border-[#860F61]/50 overflow-hidden transition-colors duration-500 rounded-[2px] shadow-sm">
      {/* Inner surveyor frame */}
      <div className="absolute inset-[3px] border border-border/40 pointer-events-none z-20" />
      {children}
      {/* Corner markers */}
      <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-neutral-400 opacity-60 z-20" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-neutral-400 opacity-60 z-20" />
    </div>
    {/* Stage Label seamlessly part of the UI, no pill */}
    <span className="text-[11px] font-extrabold tracking-widest uppercase text-neutral-dark group-hover:text-[#860F61] transition-colors relative z-20">
      {title}
    </span>
  </motion.div>
);

/* ================================================================== */
/*  LANDING PAGE                                                        */
/* ================================================================== */
export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.98]);

  return (
    <div className="min-h-screen bg-background">
      {/* ========== NAVIGATION ========== */}
      <nav className="fixed top-0 w-full z-50 glass-card border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center py-2">
            <img src="/gramseva-logo.png" alt="GramSeva Logo" className="h-8 md:h-9 w-auto object-contain" />
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-dark">
            <a href="#pipeline" className="hover:text-primary transition-colors">How It Works</a>
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#tech" className="hover:text-primary transition-colors">Technology</a>
            <a href="#datasets" className="hover:text-primary transition-colors">Datasets</a>

          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden md:inline-flex text-sm font-medium text-neutral-dark hover:text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login"
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
                  href="/login"
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

            {/* Hero visual — 3D Floating Land Intelligence */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="md:col-span-6 flex items-center justify-center mt-8 md:mt-0"
            >
              <Hero3DFloatingVisual />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ========== QUICK STATS ========== */}
      <section className="py-12 bg-background">
        <SectionReveal className="max-w-4xl mx-auto px-6">
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
        </SectionReveal>
      </section>

      {/* ========== WHY GRAMSEVA ========== */}
      <section className="py-16 md:py-24 overflow-hidden bg-background">
        <SectionReveal className="max-w-5xl mx-auto px-6 flex flex-col items-center">

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
        </SectionReveal>
      </section>

      {/* ========== HOW IT WORKS — PIPELINE ========== */}
      <section id="pipeline" className="min-h-screen xl:min-h-0 xl:h-[calc(100svh-72px)] flex flex-col justify-center py-10 xl:py-2 bg-background overflow-hidden relative">
        <SectionReveal className="w-full max-w-[95vw] xl:max-w-[1500px] mx-auto px-4 md:px-8 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 xl:mb-6"
          >
            <h2 className="text-3xl md:text-3xl font-bold mb-2 tracking-tight">How GramSeva Works</h2>
            <p className="text-neutral-dark max-w-xl mx-auto text-sm md:text-[15px]">
              A continuous, automated geospatial pipeline from raw sensory data to unified, conflict-free land intelligence.
            </p>
          </motion.div>

          <div className="relative w-full max-w-[1400px] mx-auto px-4 md:px-12 py-2 mt-2">

            {/* The SVG animated background path */}
            <div className="absolute inset-0 pointer-events-none hidden xl:block z-0">
              <svg viewBox="0 0 1400 446" className="w-full h-full" preserveAspectRatio="none">
                {/* Subtle winding path: snake right, drop, snake left, drop, snake right */}
                {/* Y values: Row 1 center at 104, Row 2 center at 342, Midpoint at 223 */}
                <path id="pipeline-path"
                  d="M 140,104 L 1260,104 C 1360,104 1360,223 1260,223 L 280,223 C 140,223 140,342 280,342 L 1120,342"
                  fill="none" stroke="#860F61" strokeWidth="1.5" strokeOpacity="0.2" strokeDasharray="4 6" />

                {/* Animated traveling particle */}
                <circle r="4" fill="#860F61" filter="drop-shadow(0px 0px 4px rgba(134,15,97,0.8))">
                  <animateMotion dur="15s" repeatCount="indefinite" path="M 140,104 L 1260,104 C 1360,104 1360,223 1260,223 L 280,223 C 140,223 140,342 280,342 L 1120,342" />
                </circle>
              </svg>
            </div>

            <div className="flex flex-col gap-6 xl:gap-[30px] relative z-10 w-full overflow-hidden xl:overflow-visible pb-2">

              {/* ======== ROW 1 ======== */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 xl:gap-8 justify-items-center w-full">
                {/* 1. INGEST */}
                <JourneyStage title="Ingest" delay={0.0}>
                  <div className="absolute inset-0 bg-[#ebe7db]/30" />
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                    <motion.g animate={{ y: [-2, 2, -2] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}>
                      <polygon points="10,35 50,20 90,35 50,50" fill="#2b362c" stroke="#4a5c4d" strokeWidth="0.5" />
                      <polygon points="10,55 50,40 90,55 50,70" fill="#fdfcf8" stroke="#a39a88" strokeWidth="0.5" />
                      <polygon points="10,75 50,60 90,75 50,90" fill="#860F61" fillOpacity="0.05" stroke="#860F61" strokeWidth="0.5" />
                    </motion.g>
                  </svg>
                </JourneyStage>

                {/* 2. NORMALIZE */}
                <JourneyStage title="Normalize" delay={0.1}>
                  <div className="absolute inset-0 bg-white" />
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                    <pattern id="gridS" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e0e0e0" strokeWidth="0.5" /></pattern>
                    <rect width="100%" height="100%" fill="url(#gridS)" />
                    <motion.g animate={{ rotate: [-10, 0, -10], scale: [1.1, 1, 1.1] }} style={{ transformOrigin: "50px 50px" }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
                      <polygon points="25,25 75,20 80,70 30,75" fill="#860F61" fillOpacity="0.05" stroke="#860F61" strokeWidth="1" strokeDasharray="2 1" />
                      <circle cx="25" cy="25" r="1.5" fill="#860F61" />
                      <circle cx="75" cy="20" r="1.5" fill="#860F61" />
                    </motion.g>
                  </svg>
                </JourneyStage>

                {/* 3. EXTRACT */}
                <JourneyStage title="Extract" delay={0.2}>
                  <div className="absolute inset-0 bg-[#161f26]">
                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                      <path d="M -10,40 C 40,60 60,30 110,40" stroke="#10171a" strokeWidth="8" fill="none" />
                      <motion.g initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.8, 1] }} transition={{ duration: 6, repeat: Infinity }}>
                        <polygon points="20,20 40,15 50,30 30,35" fill="#00d8ff" fillOpacity="0.2" stroke="#00d8ff" strokeWidth="1" />
                        <polygon points="60,60 80,50 90,70 70,80" fill="#00d8ff" fillOpacity="0.2" stroke="#00d8ff" strokeWidth="1" />
                      </motion.g>
                    </svg>
                  </div>
                </JourneyStage>

                {/* 4. MATCH */}
                <JourneyStage title="Match" delay={0.3}>
                  <div className="absolute inset-0 bg-[#fdfcfb]" />
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                    <g transform="translate(0, 10)">
                      <motion.polygon points="25,25 75,20 85,70 20,80" fill="#a39a88" fillOpacity="0.1" stroke="#a39a88" strokeWidth="1" animate={{ x: [-8, 0, -8] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
                      <motion.polygon points="30,30 80,25 80,80 25,80" fill="none" stroke="#860F61" strokeWidth="1.5" strokeDasharray="3 1" animate={{ x: [8, 0, 8] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
                      <motion.polygon points="32,32 73,27 78,68 28,78" fill="#860F61" animate={{ fillOpacity: [0.05, 0.2, 0.05] }} stroke="none" transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
                    </g>
                  </svg>
                </JourneyStage>

                {/* 5. CHANGE */}
                <JourneyStage title="Change" delay={0.4}>
                  <div className="flex w-full h-full">
                    <div className="w-1/2 h-full bg-[#e8e4db] flex items-center justify-center border-r-[1px] border-white">
                      <div className="w-12 h-10 border border-[#a39a88] bg-[#d3ccbc] rotate-3" />
                    </div>
                    <div className="w-1/2 h-full bg-[#f4efe1] flex items-center justify-center">
                      <motion.div className="w-16 h-14 border border-[#860F61]/60 bg-[#860F61]/10 rotate-3" animate={{ scale: [0.95, 1, 0.95] }} transition={{ duration: 4, repeat: Infinity }} />
                    </div>
                  </div>
                </JourneyStage>
              </div>

              {/* ======== ROW 2 ======== */}
              <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-8 justify-items-center w-full xl:w-[80%] mx-auto">
                {/* 6. CONFLICT */}
                <JourneyStage title="Conflict" delay={0.5}>
                  <div className="absolute inset-0 bg-[#fdfcfb]" />
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                    <polygon points="10,20 80,20 70,80 20,70" fill="#f4efe1" stroke="#a39a88" strokeWidth="1" />
                    <polygon points="65,30 90,40 85,85 55,75" fill="#d9534f" fillOpacity="0.1" stroke="#d9534f" strokeWidth="1.5" strokeDasharray="2 2" />
                    <motion.circle cx="75" cy="55" r="12" fill="#d9534f" fillOpacity="0.1" stroke="#d9534f" strokeWidth="1" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity }} />
                  </svg>
                </JourneyStage>

                {/* 7. CONFIDENCE */}
                <JourneyStage title="Confidence" delay={0.6}>
                  <div className="absolute inset-0 bg-[#fbfaf8]" />
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                    <polygon points="10,20 50,10 80,50 40,60" fill="#e8e4db" stroke="#a39a88" strokeOpacity="0.3" strokeWidth="0.5" />
                    <motion.polygon points="40,25 90,20 80,70 30,75" fill="#860F61" animate={{ fillOpacity: [0.1, 0.25, 0.1] }} stroke="#860F61" strokeWidth="1.5" transition={{ duration: 4, repeat: Infinity }} />
                    <rect x="25" y="80" width="50" height="15" rx="2" fill="white" stroke="#e0e0e0" />
                    <text x="50" y="90" fontSize="8" fontWeight="bold" fill="#860F61" textAnchor="middle">99.8%</text>
                  </svg>
                </JourneyStage>

                {/* 8. REVIEW */}
                <JourneyStage title="Review" delay={0.7}>
                  <div className="absolute inset-0 bg-surface-card p-2 flex flex-col gap-1.5 border border-border">
                    <div className="h-2 w-12 bg-neutral-200 rounded-sm" />
                    <div className="flex gap-1 h-1/2">
                      <div className="w-1/2 bg-[#f4efe1]/80 rounded-sm border border-[#a39a88]/30 flex p-1"><div className="w-full h-full bg-[#a39a88]/20" /></div>
                      <div className="w-1/2 bg-white rounded-sm border border-border flex p-1"><motion.div className="w-full h-full bg-[#860F61]/10 border border-[#860F61]" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} /></div>
                    </div>
                    <div className="bg-white rounded border border-border p-1.5 flex flex-col gap-1 flex-1">
                      <div className="h-1 w-full bg-neutral-100 rounded-full" />
                      <div className="h-1 w-4/5 bg-[#860F61]/20 rounded-full" />
                    </div>
                  </div>
                </JourneyStage>

                {/* 9. UNIFY */}
                <JourneyStage title="Unify" delay={0.8}>
                  <div className="absolute inset-0 bg-[#fdfcfb]" />
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                    <g transform="translate(50, 50)">
                      <motion.polygon points="0,-25 35,0 0,25 -35,0" fill="#e8e4db" stroke="#a39a88" strokeWidth="0.5" animate={{ y: [-20, 0], opacity: [1, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }} />
                      <polygon points="0,-10 35,10 0,40 -35,10" fill="white" stroke="#860F61" strokeWidth="1.5" />
                      <polygon points="0,-10 35,10 0,40 -35,10" fill="#860F61" fillOpacity="0.1" />
                      <circle cx="0" cy="15" r="2" fill="#860F61" />
                    </g>
                  </svg>
                </JourneyStage>
              </div>

            </div>
          </div>
        </SectionReveal>
      </section>

      {/* ========== FEATURES ========== */}
      <section id="features" className="py-20 md:py-28 bg-background">
        <SectionReveal className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 lg:mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Platform Features</h2>
            <p className="text-neutral-dark max-w-xl mx-auto">
              Every capability designed for real geospatial intelligence workflows.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            <FeatureCard
              icon={FeatureMatchVisual}
              title="AI Spatial Matching"
              description="Multi-evidence entity matching combining geometry, attributes, visual similarity, and temporal consistency."
              delay={0}
            />
            <FeatureCard
              icon={FeatureConflictVisual}
              title="Conflict Radar"
              description="Detect boundary, area, attribute, temporal, and topology conflicts across all data sources."
              delay={0.08}
            />
            <FeatureCard
              icon={FeatureTimeVisual}
              title="Land Time Machine"
              description="Temporal change detection showing construction, demolition, expansion, and land-use changes."
              delay={0.16}
            />
            <FeatureCard
              icon={FeatureConfidenceVisual}
              title="Confidence Map"
              description="Spatial visualization of harmonization confidence with full evidence breakdown."
              delay={0.24}
            />
            <FeatureCard
              icon={FeatureExplainBaseVisual}
              title="Explainable AI"
              description="Every AI decision provides model used, evidence, confidence, and source references."
              delay={0.32}
            />
            <FeatureCard
              icon={FeatureReviewVisual}
              title="Human Review"
              description="Review queue with side-by-side source comparison, AI evidence, and resolution workflow."
              delay={0.4}
            />
            <FeatureCard
              icon={FeatureUnifiedVisual}
              title="Unified Records"
              description="Canonical land records with complete provenance, audit history, and source traceability."
              delay={0.48}
            />
            <FeatureCard
              icon={FeatureGISVisual}
              title="2D / 3D GIS"
              description="Professional GIS workspace with MapLibre, Deck.gl, and CesiumJS for immersive spatial analysis."
              delay={0.56}
            />
          </div>
        </SectionReveal>
      </section>

      {/* ========== AI + GIS ========== */}
      <section id="tech" className="py-24 md:py-32 bg-background">
        <SectionReveal className="max-w-6xl mx-auto px-6">
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

          <div className="flex flex-col lg:flex-row items-stretch justify-center gap-4 lg:gap-0 max-w-5xl mx-auto">

            {/* 1. AI Column */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-[320px] shrink-0 p-6 rounded-[1.25rem] border-2 border-[#860F61]/10 bg-white shadow-[0_4px_24px_rgba(134,15,97,0.06)] flex flex-col h-full relative z-20"
            >
              <div className="flex items-center gap-2 mb-5">
                <Cpu className="w-5 h-5 text-[#860F61]" />
                <h3 className="font-bold text-[#860F61]">AI Engine</h3>
              </div>
              <div className="flex-1 flex flex-col justify-between gap-3">
                {[
                  { name: "SegFormer-B2", desc: "Building & feature extraction" },
                  { name: "Siamese ResNet-50", desc: "Visual entity matching" },
                  { name: "SBERT", desc: "Semantic attribute matching" },
                  { name: "ChangeFormer", desc: "Temporal change detection" },
                ].map((m) => (
                  <div key={m.name} className="flex items-center justify-between p-3.5 rounded-lg bg-surface border border-border group relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#860F61]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="text-[13px] font-bold text-foreground relative z-10">{m.name}</span>
                    <span className="text-[11px] text-neutral-dark/90 font-medium relative z-10 text-right max-w-[120px] leading-tight flex-1">{m.desc}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 2. Middle Animated Handoff Flow */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex-1 min-h-[60px] lg:min-h-full flex items-center justify-center relative py-2 lg:py-0 z-10 -my-4 lg:my-0 lg:-mx-2"
            >
              <div className="absolute inset-0 hidden lg:block z-0 pointer-events-none">
                <svg viewBox="0 0 200 300" className="w-full h-full text-[#860F61]" preserveAspectRatio="none">
                  {/* Left incoming branches mapping from AI nodes to central Handoff node (100, 150) */}
                  <path d="M0,45 C50,45 70,150 100,150" fill="none" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.2" />
                  <circle r="3.5" fill="currentColor" opacity="0.8"><animateMotion dur="2.5s" repeatCount="indefinite" path="M0,45 C50,45 70,150 100,150" /></circle>

                  <path d="M0,115 C50,115 70,150 100,150" fill="none" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" strokeDasharray="6 4" />
                  <circle r="3.5" fill="currentColor" opacity="1"><animateMotion dur="2s" repeatCount="indefinite" path="M0,115 C50,115 70,150 100,150" /></circle>

                  <path d="M0,185 C50,185 70,150 100,150" fill="none" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" strokeDasharray="6 4" />
                  <circle r="3.5" fill="currentColor" opacity="1"><animateMotion dur="2.2s" begin="0.5s" repeatCount="indefinite" path="M0,185 C50,185 70,150 100,150" /></circle>

                  <path d="M0,255 C50,255 70,150 100,150" fill="none" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.2" />
                  <circle r="3.5" fill="currentColor" opacity="0.8"><animateMotion dur="3s" begin="1s" repeatCount="indefinite" path="M0,255 C50,255 70,150 100,150" /></circle>

                  {/* Outgoing trace routing perfectly into the GIS Engine Map vertical center (y=246 relative) */}
                  <path d="M100,150 C150,150 150,246 200,246" fill="none" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.4" strokeDasharray="4 4" />
                  <circle r="4" fill="currentColor" opacity="1"><animateMotion dur="1.5s" repeatCount="indefinite" path="M100,150 C150,150 150,246 200,246" /></circle>
                  <circle r="4" fill="currentColor" opacity="1"><animateMotion dur="1.5s" begin="0.75s" repeatCount="indefinite" path="M100,150 C150,150 150,246 200,246" /></circle>

                  {/* Integrated Node Hub */}
                  <circle cx="100" cy="150" r="26" fill="white" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" />
                  <circle cx="100" cy="150" r="20" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                </svg>
              </div>

              {/* Mobile Connector */}
              <div className="absolute inset-0 flex items-center justify-center lg:hidden">
                <div className="h-full w-[2px] rounded-full bg-gradient-to-b from-[#860F61]/10 via-[#860F61]/40 to-[#860F61]/10 relative">
                  <motion.div className="w-1.5 h-1.5 rounded-full bg-[#860F61] absolute -left-[2px]" animate={{ top: ["0%", "100%"] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
                </div>
              </div>

              <div className="relative z-20 hidden lg:flex flex-col items-center justify-center text-center">
                <Network className="w-6 h-6 text-[#860F61] mb-1" strokeWidth={1.5} />
                <span className="text-[10px] font-extrabold text-[#860F61] uppercase tracking-widest leading-tight">Handoff</span>
              </div>
            </motion.div>

            {/* 3. GIS Column */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="lg:w-[320px] shrink-0 p-6 rounded-[1.25rem] border-[1.5px] border-border bg-surface-card flex flex-col h-full relative z-20"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-foreground/80" />
                  <h3 className="font-bold">GIS Engine</h3>
                </div>
                <div className="px-2 py-0.5 rounded shadow-sm bg-white border border-border text-[9px] uppercase font-bold text-foreground/70 tracking-widest">
                  Spatial Processing
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6 w-full">
                {["PostGIS", "GeoPandas", "Shapely", "GDAL", "PROJ"].map((m) => (
                  <span key={m} className="px-2.5 py-1.5 rounded-md bg-white border border-[#860F61]/10 text-[11px] font-bold text-[#860F61]/90 shadow-[0_1px_4px_rgba(0,0,0,0.04)] grow text-center">
                    {m}
                  </span>
                ))}
              </div>

              {/* GIS Output Visual (Miniature Map Display) */}
              <div className="w-full h-32 rounded-xl bg-surface border border-[#860F61]/30 overflow-hidden relative mt-auto flex items-center justify-center shadow-inner">
                <svg viewBox="0 0 200 100" className="absolute inset-0 w-full h-full text-foreground/10" preserveAspectRatio="none">
                  <pattern id="gridbg" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20 L 20 20 L 20 0 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#gridbg)" />
                  <circle cx="100" cy="50" r="30" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" fill="none" opacity="0.5" />

                  {/* Continuous Data Input Stream picked up from central svg */}
                  <path d="M0,50 L85,50" stroke="#860F61" strokeWidth="2" strokeOpacity="0.4" strokeDasharray="4 4" />
                  <circle r="3" fill="#860F61"><animateMotion dur="1.5s" repeatCount="indefinite" path="M0,50 L85,50" /></circle>
                </svg>

                <svg viewBox="0 0 200 100" className="absolute inset-0 w-full h-full text-[#860F61]" preserveAspectRatio="xMidYMid slice">
                  <motion.polygon points="60,30 130,30 140,70 70,75" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                  <motion.polygon points="75,40 145,35 135,80 65,85" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
                  {/* Pulsing Match Indicator */}
                  <motion.circle cx="105" cy="58" r="4" fill="currentColor" stroke="white" strokeWidth="1" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                </svg>

                <div className="absolute top-2 right-2 flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#860F61]" />
                </div>
              </div>
            </motion.div>

          </div>
        </SectionReveal>
      </section>

      {/* ========== DATASETS ========== */}
      <section id="datasets" className="py-20 md:py-28 bg-background">
        <SectionReveal className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold">Datasets & Ecosystem</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-5">

            {/* 1. NAKSHA / DoLR */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              className="flex flex-col rounded-xl border-[1.5px] border-border bg-surface-card overflow-hidden shadow-sm hover:shadow-md transition-shadow group lg:col-span-2"
            >
              <div className="w-full h-28 md:h-32 bg-[#f8f4e6] relative overflow-hidden border-b border-border/80">
                <svg viewBox="0 0 200 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
                  <motion.g animate={{ x: [-10, 10, -10], y: [-5, 5, -5] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
                    <path d="M-20,-20 L80,10 L70,90 L-10,120 Z" fill="#f4efe1" stroke="#a39a88" strokeWidth="1" />
                    <path d="M80,10 L150,-10 L190,40 L120,60 L70,90 Z" fill="#eae4d3" stroke="#a39a88" strokeWidth="1" />
                    <path d="M150,-10 L250,-10 L240,60 L190,40 Z" fill="#f4efe1" stroke="#a39a88" strokeWidth="1" />
                    <path d="M120,60 L190,40 L240,60 L210,130 L110,120 Z" fill="#e2dcc5" stroke="#a39a88" strokeWidth="1" />
                    <text x="30" y="50" fontSize="8" fill="#5c554b" opacity="0.6">42/1</text>
                    <text x="120" y="30" fontSize="8" fill="#5c554b" opacity="0.6">42/2</text>
                    <text x="160" y="90" fontSize="8" fill="#5c554b" opacity="0.6">43</text>
                  </motion.g>
                </svg>
              </div>
              <div className="p-5 flex-1 flex flex-col items-start text-left">
                <div className="flex items-center justify-between w-full mb-3">
                  <h3 className="text-[13px] font-bold text-foreground group-hover:text-[#860F61] transition-colors">NAKSHA / DoLR</h3>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm bg-white border border-[#860F61]/10 text-foreground/70 shrink-0">Public Context</span>
                </div>
                <p className="text-[11px] text-neutral-dark leading-relaxed font-medium mt-auto">National spatial framework and land record digitization context.</p>
              </div>
            </motion.div>

            {/* 2. SpaceNet */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex flex-col rounded-xl border-[1.5px] border-border bg-surface-card overflow-hidden shadow-sm hover:shadow-md transition-shadow group lg:col-span-2"
            >
              <div className="w-full h-28 md:h-32 bg-[#1b262c] relative overflow-hidden border-b border-border/80">
                <svg viewBox="0 0 200 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
                  <defs>
                    <filter id="noise">
                      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" opacity="0.15" />
                    </filter>
                  </defs>
                  <rect width="100%" height="100%" filter="url(#noise)" fill="#2f3b31" opacity="0.6" />
                  <motion.g animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "100px 50px" }}>
                    <polygon points="50,40 80,35 90,65 60,70" fill="#242c20" stroke="#00d8ff" strokeWidth="1" strokeOpacity="0.8" />
                    <polygon points="120,20 160,20 160,50 120,50" fill="#212921" stroke="#00d8ff" strokeWidth="1" strokeOpacity="0.8" />
                    <polygon points="30,80 70,75 75,95 35,100" fill="#2e2b26" stroke="#00d8ff" strokeWidth="1" strokeOpacity="0.8" />
                    <motion.polygon points="120,20 160,20 160,50 120,50" fill="none" stroke="#00d8ff" strokeWidth="1.5" animate={{ strokeDasharray: ["0, 160", "160, 0"] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
                  </motion.g>
                </svg>
              </div>
              <div className="p-5 flex-1 flex flex-col items-start text-left">
                <div className="flex items-center justify-between w-full mb-3">
                  <h3 className="text-[13px] font-bold text-foreground group-hover:text-[#860F61] transition-colors">SpaceNet</h3>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm bg-white border border-[#860F61]/10 text-foreground/70 shrink-0">Research</span>
                </div>
                <p className="text-[11px] text-neutral-dark leading-relaxed font-medium mt-auto">High-resolution satellite imagery with building footprint annotations.</p>
              </div>
            </motion.div>

            {/* 3. Bhuvan / NRSC */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col rounded-xl border-[1.5px] border-border bg-surface-card overflow-hidden shadow-sm hover:shadow-md transition-shadow group lg:col-span-2"
            >
              <div className="w-full h-28 md:h-32 bg-[#3d2433] relative overflow-hidden border-b border-border/80">
                <svg viewBox="0 0 200 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
                  <motion.g animate={{ x: [0, -15, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }}>
                    {/* Water mapping */}
                    <path d="M0,0 Q80,50 150,-20 Z" fill="#1b3b4a" />
                    {/* Deep red/pink NDVI style vegetation */}
                    <path d="M0,0 C60,40 120,20 250,50 L250,150 L0,150 Z" fill="#8c1c2e" opacity="0.8" />
                    <path d="M-50,80 Q50,60 150,100 T300,80 L300,150 L-50,150 Z" fill="#691024" opacity="0.9" />
                    {/* High intensity crop fields */}
                    <polygon points="20,40 50,30 60,60 10,50" fill="#a82339" opacity="0.9" />
                    <polygon points="60,35 110,25 100,55 50,65" fill="#521520" opacity="0.9" />
                  </motion.g>
                </svg>
              </div>
              <div className="p-5 flex-1 flex flex-col items-start text-left">
                <div className="flex items-center justify-between w-full mb-3">
                  <h3 className="text-[13px] font-bold text-foreground group-hover:text-[#860F61] transition-colors">Bhuvan / NRSC</h3>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm bg-white border border-[#860F61]/10 text-foreground/70 shrink-0">Public</span>
                </div>
                <p className="text-[11px] text-neutral-dark leading-relaxed font-medium mt-auto">Indian geo-platform with thematic and multi-spectral data layers.</p>
              </div>
            </motion.div>

            {/* 4. OpenStreetMap */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col rounded-xl border-[1.5px] border-border bg-surface-card overflow-hidden shadow-sm hover:shadow-md transition-shadow group lg:col-start-2 lg:col-span-2"
            >
              <div className="w-full h-28 md:h-32 bg-[#f2eadd] relative overflow-hidden border-b border-border/80">
                <svg viewBox="0 0 200 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
                  <motion.g animate={{ x: [0, 8, 0], y: [0, 8, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
                    {/* Parks */}
                    <path d="M-20,-20 L90,-20 L110,60 L30,80 Z" fill="#c3e6cb" />
                    {/* Water */}
                    <path d="M120,-20 Q140,50 250,80 L250,-20 Z" fill="#aadaff" />
                    {/* Roads Outline */}
                    <path d="M-20,40 Q50,40 130,-20" stroke="#cccccc" strokeWidth="8" fill="none" />
                    <path d="M60,40 L90,120" stroke="#cccccc" strokeWidth="7" fill="none" />
                    {/* Roads Fill */}
                    <path d="M-20,40 Q50,40 130,-20" stroke="#ffffff" strokeWidth="6" fill="none" />
                    <path d="M60,40 L90,120" stroke="#ffffff" strokeWidth="5" fill="none" />
                    {/* Buildings */}
                    <rect x="10" y="10" width="15" height="20" fill="#d8d0c9" stroke="#c0b9b3" strokeWidth="0.5" />
                    <rect x="35" y="5" width="20" height="15" fill="#d8d0c9" stroke="#c0b9b3" strokeWidth="0.5" />
                    <polygon points="50,55 70,50 80,70 60,75" fill="#d8d0c9" stroke="#c0b9b3" strokeWidth="0.5" />
                  </motion.g>
                </svg>
              </div>
              <div className="p-5 flex-1 flex flex-col items-start text-left">
                <div className="flex items-center justify-between w-full mb-3">
                  <h3 className="text-[13px] font-bold text-foreground group-hover:text-[#860F61] transition-colors">OpenStreetMap</h3>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm bg-white border border-[#860F61]/10 text-foreground/70 shrink-0">Open Source</span>
                </div>
                <p className="text-[11px] text-neutral-dark leading-relaxed font-medium mt-auto">Community-contributed roads, buildings, land-use, and POI data.</p>
              </div>
            </motion.div>

            {/* 5. Synthetic Benchmark */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-col rounded-xl border-[1.5px] border-border bg-surface-card overflow-hidden shadow-sm hover:shadow-md transition-shadow group lg:col-start-4 lg:col-span-2 md:col-span-2"
            >
              <div className="w-full h-28 md:h-32 bg-[#eef0f2] relative overflow-hidden border-b border-border/80">
                <svg viewBox="0 0 200 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
                  {/* Left Side: Ground Truth */}
                  <motion.g animate={{ x: [0, -5, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}>
                    <text x="10" y="15" fontSize="7" fill="#666" fontWeight="bold">SOURCE A</text>
                    <polygon points="10,25 60,30 50,80 5,75" fill="#d2e3f5" stroke="#337ab7" strokeWidth="1" />
                    <polygon points="60,30 95,25 90,75 50,80" fill="#d2e3f5" stroke="#337ab7" strokeWidth="1" />
                  </motion.g>
                  {/* Divider */}
                  <line x1="100" y1="0" x2="100" y2="100" stroke="#ccc" strokeDasharray="3 3" strokeWidth="1" />
                  {/* Right Side: Variant */}
                  <motion.g animate={{ x: [0, 5, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}>
                    <text x="110" y="15" fontSize="7" fill="#666" fontWeight="bold">SOURCE B</text>
                    <polygon points="110,25 160,30 150,80 105,75" fill="#fce4d6" stroke="#d9534f" strokeWidth="1" />
                    <motion.polygon points="160,30 205,25 190,75 150,80" fill="#fce4d6" stroke="#d9534f" strokeWidth="1" style={{ transformOrigin: "150px 80px" }} animate={{ skewX: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
                  </motion.g>
                </svg>
              </div>
              <div className="p-5 flex-1 flex flex-col items-start text-left">
                <div className="flex items-center justify-between w-full mb-3">
                  <h3 className="text-[13px] font-bold text-foreground group-hover:text-[#860F61] transition-colors">Synthetic Benchmark</h3>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm bg-white border border-[#860F61]/10 text-foreground/70 shrink-0">Generated</span>
                </div>
                <p className="text-[11px] text-neutral-dark leading-relaxed font-medium mt-auto">Controlled multi-source benchmark with ground-truth relationships.</p>
              </div>
            </motion.div>
          </div>
        </SectionReveal>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="relative py-28 md:py-36 bg-background overflow-hidden flex items-center justify-center min-h-[60vh]">
        {/* Subtle Background Geospatial Environment */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
          {/* Primary Photorealistic Imagery with Subtle Cinematic Drift */}
          <motion.img
            src="/cta_bg.png"
            alt="Aerial Land Parcels"
            className="absolute w-full h-full object-cover opacity-[0.65] contrast-[1.15] saturate-[1.1]"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          />

          {/* Multi-layered Soft Masking Gradients for Text Legibility */}
          <div className="absolute inset-0 opacity-95" style={{ background: 'radial-gradient(circle at center, #fbfaf8 40%, transparent 90%)' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#fbfaf8] via-[#fbfaf8]/20 to-transparent opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#fbfaf8] via-[#fbfaf8]/20 to-transparent opacity-90" />

          {/* Minimal Converging Parcel Overlay Vectors */}
          <svg viewBox="0 0 1440 600" preserveAspectRatio="xMidYMid slice" className="absolute w-full h-full opacity-60">
            <defs>
              <linearGradient id="cta-line-fade" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#860F61" stopOpacity="0" />
                <stop offset="50%" stopColor="#860F61" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#860F61" stopOpacity="0" />
              </linearGradient>
            </defs>

            <g stroke="#860F61" strokeWidth="1" fill="#860F61" fillOpacity="0.02">
              {/* Drifting outer boundary fragments */}
              <motion.g animate={{ x: [0, 40, 0], opacity: [0, 0.4, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}>
                <polygon points="100,100 250,80 300,180 150,220" />
                <polygon points="180,250 320,200 380,350 220,380" />
              </motion.g>

              <motion.g animate={{ x: [0, -40, 0], opacity: [0, 0.4, 0] }} transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}>
                <polygon points="1350,150 1150,100 1100,250 1280,280" />
                <polygon points="1250,320 1080,280 1050,420 1200,460" />
              </motion.g>

              {/* Central unifying grid path drifting */}
              <line x1="0" y1="300" x2="1440" y2="300" stroke="url(#cta-line-fade)" strokeWidth="1" strokeDasharray="4 8" />

              {/* Target Unified Polygon behind text */}
              <motion.g transform="translate(720, 300)" animate={{ scale: [0.95, 1.05, 0.95] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}>
                <polygon points="-120,-80 80,-100 120,60 -80,100" fill="#860F61" fillOpacity="0.03" stroke="#860F61" strokeWidth="1.5" strokeOpacity="0.2" />
                <polygon points="-120,-80 80,-100 120,60 -80,100" fill="none" stroke="#860F61" strokeWidth="2" strokeOpacity="0.4" strokeDasharray="4 4" />
              </motion.g>
            </g>
          </svg>
        </div>

        <SectionReveal className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-6 leading-tight drop-shadow-sm"
          >
            From fragmented land data
            <br />to one trusted view.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-neutral-dark text-lg mb-10 drop-shadow-sm"
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
              href="/login"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-[#013220] text-white text-[15px] font-bold hover:opacity-90 transition-opacity shadow-[0_4px_24px_rgba(134,15,97,0.25)]"
            >
              Open GramSeva Workspace
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </SectionReveal>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="py-8 bg-background">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <img
            src="/gramseva-logo.png"
            alt="GramSeva"
            className="h-9 w-auto object-contain"
          />
          <div className="text-xs text-neutral-dark">
            Decision-support platform • Source records preserved
          </div>
        </div>
      </footer>
    </div>
  );
}
