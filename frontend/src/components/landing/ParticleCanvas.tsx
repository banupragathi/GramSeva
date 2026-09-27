"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface ParticleCanvasProps {
  progressRef: React.RefObject<number>;
}

export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({ progressRef }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Setup dimensions
    const width = container.clientWidth || 480;
    const height = container.clientHeight || 480;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 9.0;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Particle field constants
    const CLUSTERS = 6;
    const POINTS_PER_CLUSTER = 433;
    const TOTAL_POINTS = CLUSTERS * POINTS_PER_CLUSTER; // 2598 points
    const GRID_SIZE = Math.ceil(Math.sqrt(TOTAL_POINTS)); // ~51x51

    // Data source cluster colors for scattered state
    const clusterColorsHex = [
      0xc41e7d, // Magenta (Brand)
      0x4a6b4f, // Moss
      0xc9bfae, // Sand
      0x5b7b88, // Muted Blue-Grey
      0xd0486d, // Pink-Red
      0x8b8e94, // Neutral Grey
    ];

    const clusterColorsRGB = clusterColorsHex.map((hex) => {
      const c = new THREE.Color(hex);
      return [c.r, c.g, c.b];
    });

    const magentaColor = new THREE.Color(0xc41e7d);
    const offWhiteColor = new THREE.Color(0xededea);

    // Buffer arrays
    const currentPositions = new Float32Array(TOTAL_POINTS * 3);
    const currentColors = new Float32Array(TOTAL_POINTS * 3);

    const scatteredPositions = new Float32Array(TOTAL_POINTS * 3);
    const alignedPositions = new Float32Array(TOTAL_POINTS * 3);

    const scatteredColors = new Float32Array(TOTAL_POINTS * 3);
    const alignedColors = new Float32Array(TOTAL_POINTS * 3);

    // Populate scattered and aligned configurations
    const gridWidth = 5.4;
    const gridHeight = 4.2;

    for (let i = 0; i < TOTAL_POINTS; i++) {
      const clusterIdx = Math.floor(i / POINTS_PER_CLUSTER);
      const angle = (clusterIdx / CLUSTERS) * Math.PI * 2;

      // --- Scattered Positions ---
      const clusterCenterX = Math.cos(angle) * 2.3;
      const clusterCenterY = Math.sin(angle) * 1.7;
      const clusterCenterZ = Math.sin(angle * 2) * 0.9;

      const spread = 1.4;
      const jitterX = (Math.random() - 0.5) * spread;
      const jitterY = (Math.random() - 0.5) * spread;
      const jitterZ = (Math.random() - 0.5) * 1.2;

      scatteredPositions[i * 3] = clusterCenterX + jitterX;
      scatteredPositions[i * 3 + 1] = clusterCenterY + jitterY;
      scatteredPositions[i * 3 + 2] = clusterCenterZ + jitterZ;

      // --- Aligned Positions (Flat 2D Lattice Grid) ---
      const row = Math.floor(i / GRID_SIZE);
      const col = i % GRID_SIZE;

      const normCol = (col / (GRID_SIZE - 1)) - 0.5;
      const normRow = (row / (GRID_SIZE - 1)) - 0.5;

      alignedPositions[i * 3] = normCol * gridWidth;
      alignedPositions[i * 3 + 1] = normRow * gridHeight;
      // Slight subtle wave elevation for harmonized surface texture
      alignedPositions[i * 3 + 2] = Math.sin(normCol * Math.PI * 2) * 0.08;

      // --- Scattered Colors ---
      const baseRgb = clusterColorsRGB[clusterIdx];
      const colorJitter = (Math.random() - 0.5) * 0.12;
      scatteredColors[i * 3] = Math.min(1, Math.max(0, baseRgb[0] + colorJitter));
      scatteredColors[i * 3 + 1] = Math.min(1, Math.max(0, baseRgb[1] + colorJitter));
      scatteredColors[i * 3 + 2] = Math.min(1, Math.max(0, baseRgb[2] + colorJitter));

      // --- Aligned Colors ---
      const isChecker = (row + col) % 2 === 0;
      const targetColor = isChecker ? magentaColor : offWhiteColor;
      const blendFactor = isChecker ? 1.0 : 0.4; // subtle off-white blend

      alignedColors[i * 3] = THREE.MathUtils.lerp(magentaColor.r, targetColor.r, blendFactor);
      alignedColors[i * 3 + 1] = THREE.MathUtils.lerp(magentaColor.g, targetColor.g, blendFactor);
      alignedColors[i * 3 + 2] = THREE.MathUtils.lerp(magentaColor.b, targetColor.b, blendFactor);
    }

    // Geometry & Material
    const geometry = new THREE.BufferGeometry();
    const positionAttribute = new THREE.BufferAttribute(currentPositions, 3);
    const colorAttribute = new THREE.BufferAttribute(currentColors, 3);

    geometry.setAttribute("position", positionAttribute);
    geometry.setAttribute("color", colorAttribute);

    const material = new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0.88,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Easing helper
    const cubicInOut = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    // Reduced motion single render
    if (prefersReducedMotion) {
      const fixedProgress = cubicInOut(0.6);
      for (let i = 0; i < TOTAL_POINTS * 3; i++) {
        currentPositions[i] = THREE.MathUtils.lerp(
          scatteredPositions[i],
          alignedPositions[i],
          fixedProgress
        );
        currentColors[i] = THREE.MathUtils.lerp(
          scatteredColors[i],
          alignedColors[i],
          fixedProgress
        );
      }
      positionAttribute.needsUpdate = true;
      colorAttribute.needsUpdate = true;
      camera.position.z = 8.28;
      points.rotation.y = 0.2;
      renderer.render(scene, camera);
      return () => {
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      };
    }

    // Animation Loop
    let animFrameId: number;
    let startTime = performance.now();

    const renderLoop = (time: number) => {
      const elapsed = (time - startTime) * 0.001;

      // Scroll progress
      const rawProgress = progressRef.current ?? 0;
      const progress = cubicInOut(Math.min(Math.max(rawProgress, 0), 1));

      // Update positions and colors in-place
      for (let i = 0; i < TOTAL_POINTS * 3; i++) {
        currentPositions[i] = THREE.MathUtils.lerp(
          scatteredPositions[i],
          alignedPositions[i],
          progress
        );
        currentColors[i] = THREE.MathUtils.lerp(
          scatteredColors[i],
          alignedColors[i],
          progress
        );
      }

      positionAttribute.needsUpdate = true;
      colorAttribute.needsUpdate = true;

      // Continuous subtle idle rotation
      const idleSpeed = 0.12 * (1 - progress * 0.5);
      points.rotation.y = elapsed * idleSpeed;
      points.rotation.x = Math.sin(elapsed * 0.1) * 0.06;

      // Camera dolly-in as progress increases (9.0 -> 7.8)
      camera.position.z = 9.0 - progress * 1.2;

      renderer.render(scene, camera);
      animFrameId = requestAnimationFrame(renderLoop);
    };

    animFrameId = requestAnimationFrame(renderLoop);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Clean Teardown on unmount
    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", handleResize);
      scene.remove(points);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [progressRef]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[440px] max-h-[520px] relative overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing"
    />
  );
};
