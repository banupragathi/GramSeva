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

  // Smooth spring physics for reactive cursor tilt
  const springConfig = { stiffness: 150, damping: 20, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Map to 3D rotation angles (up to 14 deg tilt)
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [14, -14]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-16, 16]);

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
      className="relative w-full max-w-[640px] lg:max-w-[780px] xl:max-w-[880px] flex items-center justify-center cursor-pointer select-none"
      style={{ perspective: 1200 }}
    >
      {/* Ambient background volumetric glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/25 via-transparent to-primary/15 rounded-full blur-3xl opacity-75 pointer-events-none scale-110" />

      {/* 3D Reactive Tilt Container */}
      <motion.div
        style={{
          rotateX: prefersReducedMotion ? 0 : rotateX,
          rotateY: prefersReducedMotion ? 0 : rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full flex items-center justify-center"
      >
        {/* Continuous Levitation Float Wrapper */}
        <motion.div
          animate={
            prefersReducedMotion
              ? {}
              : {
                  y: [0, -18, 0],
                  rotateZ: [0, 0.8, -0.6, 0],
                }
          }
          transition={{
            duration: 6,
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
            className="w-full h-auto object-contain filter drop-shadow-[0_30px_60px_rgba(0,0,0,0.45)] hover:brightness-105 transition-all duration-300"
          />

          {/* Elevated Floating Highlight Flare */}
          <div
            className="absolute top-1/4 left-1/3 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none animate-pulse"
            style={{ animationDuration: "4s" }}
          />
        </motion.div>
      </motion.div>

      {/* Dynamic 3D Ground Shadow that breathes with the levitation */}
      <motion.div
        animate={
          prefersReducedMotion
            ? {}
            : {
                scale: [1, 0.85, 1],
                opacity: [0.65, 0.38, 0.65],
              }
        }
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[72%] h-10 bg-black/60 rounded-full blur-2xl pointer-events-none"
      />
    </div>
  );
}
