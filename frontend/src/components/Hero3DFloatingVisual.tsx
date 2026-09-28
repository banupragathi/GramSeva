"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";

export default function Hero3DFloatingVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Mouse position normalized between -0.5 and 0.5
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Weighty, dampened spring physics (firm, premium feel — no jelly bounce)
  const springConfig = { stiffness: 80, damping: 25, mass: 1 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Subtle, realistic 3D perspective tilt (5-6 degrees max)
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-6, 6]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[640px] lg:max-w-[780px] xl:max-w-[880px] flex items-center justify-center cursor-default select-none group"
      style={{ perspective: 1400 }}
    >
      {/* Ambient background volumetric glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-primary/10 rounded-full blur-3xl opacity-65 pointer-events-none scale-105" />

      {/* 3D Reactive Tilt Container (controlled, subtle angular deflection) */}
      <motion.div
        style={{
          rotateX: prefersReducedMotion ? 0 : rotateX,
          rotateY: prefersReducedMotion ? 0 : rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full flex items-center justify-center transition-transform duration-300 ease-out"
      >
        {/* Calm, Weighted Levitation Float (no rotational wobble) */}
        <motion.div
          animate={
            prefersReducedMotion
              ? {}
              : {
                  y: [0, -8, 0],
                }
          }
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative w-full"
        >
          {/* Main 3D Isometric Land Intelligence Image */}
          <Image
            src="/hero_img.png"
            alt="GramSeva 3D Land Intelligence Geospatial Visualization"
            width={1536}
            height={1024}
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 850px"
            className="w-full h-auto object-contain filter drop-shadow-[0_25px_45px_rgba(0,0,0,0.38)] group-hover:drop-shadow-[0_30px_55px_rgba(0,0,0,0.48)] transition-all duration-500 ease-out"
          />

          {/* Elevated Floating Subtle Accent Flare */}
          <div
            className="absolute top-1/4 left-1/3 w-28 h-28 bg-primary/15 rounded-full blur-2xl pointer-events-none opacity-60"
          />
        </motion.div>
      </motion.div>

      {/* Ground Shadow (stable, calm altitude tracking) */}
      <motion.div
        animate={
          prefersReducedMotion
            ? {}
            : {
                scale: [1, 0.94, 1],
                opacity: [0.5, 0.38, 0.5],
              }
        }
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[68%] h-8 bg-black/55 rounded-full blur-2xl pointer-events-none"
      />
    </div>
  );
}
