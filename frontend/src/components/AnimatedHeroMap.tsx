"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/* ------------------------------------------------------------------ */
/*  PROCEDURAL SATELLITE-STYLE TERRAIN TEXTURE                        */
/* ------------------------------------------------------------------ */
function generateTerrainTexture(size: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;

  const hash = (x: number, y: number, s: number) => {
    const n = Math.sin(x * 127.1 + y * 311.7 + s * 43758.5453) * 43758.5453;
    return n - Math.floor(n);
  };

  const fbm = (x: number, y: number, s: number) => {
    let v = 0, a = 0.5, f = 1;
    for (let i = 0; i < 6; i++) {
      v += a * hash(x * f, y * f, s + i * 7.3);
      a *= 0.5; f *= 2.0;
    }
    return v;
  };

  // Land-use zones matching realistic Indian village aerial imagery
  const zones = [
    { x: 0.02, y: 0.02, w: 0.30, h: 0.36, t: "CG" },   // Crop green (paddy/sugarcane)
    { x: 0.34, y: 0.02, w: 0.32, h: 0.36, t: "CB" },   // Crop brown (plowed/harvested)
    { x: 0.68, y: 0.02, w: 0.30, h: 0.36, t: "OR" },   // Orchard (mango/coconut)
    { x: 0.02, y: 0.42, w: 0.30, h: 0.26, t: "CY" },   // Crop yellow (wheat/mustard)
    { x: 0.34, y: 0.42, w: 0.32, h: 0.26, t: "ST" },   // Settlement
    { x: 0.68, y: 0.42, w: 0.30, h: 0.26, t: "SD" },   // Dense settlement
    { x: 0.02, y: 0.72, w: 0.30, h: 0.26, t: "VG" },   // Vegetation/forest
    { x: 0.34, y: 0.72, w: 0.32, h: 0.26, t: "CG2" },  // Another green field
    { x: 0.68, y: 0.72, w: 0.30, h: 0.26, t: "CB2" },  // Brown fallow
  ];

  const palettes: Record<string, number[][]> = {
    CG:  [[62, 115, 40], [72, 128, 48], [50, 98, 35], [80, 138, 55]],
    CG2: [[55, 108, 38], [68, 122, 45], [46, 92, 32], [75, 132, 52]],
    CB:  [[138, 112, 68], [152, 125, 78], [122, 100, 58], [145, 118, 72]],
    CB2: [[130, 108, 65], [145, 120, 72], [118, 95, 55], [138, 112, 68]],
    CY:  [[158, 142, 62], [172, 155, 72], [142, 128, 52], [165, 148, 68]],
    OR:  [[52, 92, 38], [65, 105, 45], [42, 78, 30], [75, 112, 50]],
    ST:  [[155, 135, 108], [142, 122, 95], [165, 145, 118], [148, 128, 102]],
    SD:  [[162, 128, 92], [148, 115, 78], [172, 138, 102], [155, 122, 85]],
    VG:  [[38, 82, 32], [50, 96, 38], [32, 72, 25], [58, 102, 42]],
  };

  const imgData = ctx.createImageData(size, size);

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const nx = px / size;
      const ny = py / size;

      let type = "VG";
      for (const z of zones) {
        if (nx >= z.x && nx < z.x + z.w && ny >= z.y && ny < z.y + z.h) { type = z.t; break; }
      }

      const pal = palettes[type] || palettes.VG;
      const n1 = fbm(nx * 10, ny * 10, 1.0);
      const ci = Math.floor(n1 * pal.length) % pal.length;
      let [r, g, b] = pal[ci];

      // Multi-scale noise for aerial texture feel
      const micro = (fbm(nx * 45, ny * 45, 3.7) - 0.5) * 22;
      const meso = (fbm(nx * 18, ny * 18, 6.2) - 0.5) * 15;
      r = Math.max(0, Math.min(255, r + micro + meso));
      g = Math.max(0, Math.min(255, g + micro + meso));
      b = Math.max(0, Math.min(255, b + micro * 0.7 + meso * 0.7));

      // Field row patterns for crop areas
      if (type.startsWith("C")) {
        const rowN = Math.sin(ny * size * 1.8) * 0.5 + 0.5;
        r += (rowN - 0.5) * 8;
        g += (rowN - 0.5) * 10;
      }

      // Building rooftops in settlement areas
      if (type === "ST" || type === "SD") {
        const gridX = (nx * 55) % 1;
        const gridY = (ny * 55) % 1;
        if (gridX > 0.12 && gridX < 0.78 && gridY > 0.12 && gridY < 0.78) {
          const bn = hash(Math.floor(nx * 55), Math.floor(ny * 55), 5.5);
          if (bn > 0.32) {
            const roofType = hash(Math.floor(nx * 55), Math.floor(ny * 55), 9.1);
            if (roofType > 0.55) {
              // Terracotta/red roof
              r = 178 + roofType * 35; g = 72 + roofType * 18; b = 48;
            } else if (roofType > 0.25) {
              // Concrete/grey roof
              r = 185 + roofType * 25; g = 180 + roofType * 20; b = 172 + roofType * 15;
            } else {
              // Blue tarp/tin
              r = 85; g = 105 + roofType * 30; b = 145 + roofType * 40;
            }
          }
        }
        // Narrow lanes between buildings
        if ((gridX < 0.12 || gridX > 0.88) || (gridY < 0.12 || gridY > 0.88)) {
          r = 135 + (fbm(nx * 60, ny * 60, 11.0) - 0.5) * 20;
          g = 128 + (fbm(nx * 60, ny * 60, 12.0) - 0.5) * 18;
          b = 110 + (fbm(nx * 60, ny * 60, 13.0) - 0.5) * 15;
        }
      }

      // Tree canopy for orchard + vegetation
      if (type === "OR" || type === "VG") {
        const tx = (nx * 22) % 1;
        const ty = (ny * 22) % 1;
        const dist = Math.sqrt((tx - 0.5) ** 2 + (ty - 0.5) ** 2);
        if (dist < 0.22) {
          const tn = hash(Math.floor(nx * 22), Math.floor(ny * 22), 7.2);
          if (tn > 0.25) {
            const shade = dist / 0.22;
            r = (25 + tn * 18) * (1 - shade * 0.3);
            g = (58 + tn * 28) * (1 - shade * 0.2);
            b = (20 + tn * 10) * (1 - shade * 0.3);
          }
        }
        // Shadows under trees
        if (dist > 0.22 && dist < 0.30) {
          const tn = hash(Math.floor(nx * 22), Math.floor(ny * 22), 7.2);
          if (tn > 0.25) {
            r *= 0.85; g *= 0.88; b *= 0.85;
          }
        }
      }

      const idx = (py * size + px) * 4;
      imgData.data[idx] = Math.max(0, Math.min(255, Math.round(r)));
      imgData.data[idx + 1] = Math.max(0, Math.min(255, Math.round(g)));
      imgData.data[idx + 2] = Math.max(0, Math.min(255, Math.round(b)));
      imgData.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Roads — asphalt with subtle edge detail
  const drawRoad = (pts: number[][], w: number, col: string) => {
    // Road shadow
    ctx.strokeStyle = "rgba(30,28,22,0.35)";
    ctx.lineWidth = w + 2;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath();
    pts.forEach(([x, y], i) => {
      if (i === 0) ctx.moveTo(x * size, y * size); else ctx.lineTo(x * size, y * size);
    });
    ctx.stroke();
    // Road surface
    ctx.strokeStyle = col;
    ctx.lineWidth = w;
    ctx.beginPath();
    pts.forEach(([x, y], i) => {
      if (i === 0) ctx.moveTo(x * size, y * size); else ctx.lineTo(x * size, y * size);
    });
    ctx.stroke();
  };

  // Main roads
  drawRoad([[0.33, 0], [0.335, 0.41], [0.33, 1.0]], Math.max(5, size * 0.009), "#52514c");
  drawRoad([[0, 0.41], [1.0, 0.41]], Math.max(5, size * 0.009), "#52514c");
  // Secondary roads
  drawRoad([[0.67, 0], [0.67, 1.0]], Math.max(3, size * 0.006), "#5a5955");
  drawRoad([[0, 0.71], [1.0, 0.71]], Math.max(3, size * 0.006), "#5a5955");
  // Tertiary paths
  drawRoad([[0.18, 0], [0.18, 0.41]], Math.max(2, size * 0.003), "#6a6862");
  drawRoad([[0.50, 0.41], [0.50, 0.71]], Math.max(2, size * 0.003), "#6a6862");

  // Road center dashes
  ctx.strokeStyle = "rgba(220,210,180,0.28)";
  ctx.lineWidth = 1; ctx.setLineDash([5, 7]);
  ctx.beginPath(); ctx.moveTo(size * 0.333, 0); ctx.lineTo(size * 0.333, size); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, size * 0.41); ctx.lineTo(size, size * 0.41); ctx.stroke();
  ctx.setLineDash([]);

  return c;
}

/* ------------------------------------------------------------------ */
/*  CADASTRAL BOUNDARY OVERLAY                                        */
/* ------------------------------------------------------------------ */
function generateCadastralOverlay(size: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = size; c.height = size;
  const ctx = c.getContext("2d")!;

  ctx.strokeStyle = "rgba(255,255,255,0.78)";
  ctx.lineWidth = 1.8; ctx.lineJoin = "round";

  const segs: number[][][] = [
    [[0.03, 0.03], [0.97, 0.03], [0.97, 0.97], [0.03, 0.97], [0.03, 0.03]],
    [[0.33, 0.03], [0.33, 0.97]],
    [[0.67, 0.03], [0.67, 0.97]],
    [[0.03, 0.41], [0.97, 0.41]],
    [[0.03, 0.71], [0.97, 0.71]],
    [[0.18, 0.03], [0.18, 0.41]],
    [[0.50, 0.41], [0.50, 0.71]],
    [[0.82, 0.71], [0.82, 0.97]],
    [[0.50, 0.71], [0.50, 0.97]],
    [[0.18, 0.71], [0.18, 0.97]],
  ];

  for (const seg of segs) {
    ctx.beginPath();
    seg.forEach(([x, y], i) => { if (i === 0) ctx.moveTo(x * size, y * size); else ctx.lineTo(x * size, y * size); });
    ctx.stroke();
  }

  // Corner survey markers
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  const pts = [
    [0.03, 0.03], [0.33, 0.03], [0.67, 0.03], [0.97, 0.03],
    [0.18, 0.03], [0.18, 0.41],
    [0.03, 0.41], [0.33, 0.41], [0.67, 0.41], [0.97, 0.41],
    [0.50, 0.41], [0.50, 0.71],
    [0.03, 0.71], [0.33, 0.71], [0.67, 0.71], [0.97, 0.71],
    [0.18, 0.71], [0.82, 0.71],
    [0.03, 0.97], [0.33, 0.97], [0.50, 0.97], [0.67, 0.97], [0.82, 0.97], [0.97, 0.97],
  ];
  for (const [x, y] of pts) {
    ctx.beginPath(); ctx.arc(x * size, y * size, 2.5, 0, Math.PI * 2); ctx.fill();
  }

  return c;
}

/* ------------------------------------------------------------------ */
/*  GIS DATA LAYER TEXTURE                                             */
/* ------------------------------------------------------------------ */
function makeLayerTex(
  size: number, strokeCol: string, fillCol: string,
  polys: number[][][], dash?: number[]
): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = size; c.height = size;
  const ctx = c.getContext("2d")!;

  for (const poly of polys) {
    ctx.beginPath();
    poly.forEach(([x, y], i) => { if (i === 0) ctx.moveTo(x * size, y * size); else ctx.lineTo(x * size, y * size); });
    ctx.closePath();
    ctx.fillStyle = fillCol; ctx.fill();
    ctx.strokeStyle = strokeCol; ctx.lineWidth = 2.5; ctx.lineJoin = "round";
    if (dash) ctx.setLineDash(dash); else ctx.setLineDash([]);
    ctx.stroke(); ctx.setLineDash([]);
  }

  return c;
}

/* ================================================================== */
/*  THREE.JS HERO COMPONENT                                           */
/* ================================================================== */
export default function AnimatedHeroMap() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let w = container.clientWidth;
    let h = container.clientHeight;
    if (w < 10) w = 640;
    if (h < 10) h = 700;

    /* ---- Scene ---- */
    const scene = new THREE.Scene();

    /* ---- Camera — looking down at ~55° ---- */
    const camera = new THREE.PerspectiveCamera(30, w / h, 0.1, 100);
    camera.position.set(0, 5.5, 5.8);
    camera.lookAt(0, 0.3, 0);

    /* ---- Renderer ---- */
    const renderer = new THREE.WebGLRenderer({
      antialias: true, alpha: true, powerPreference: "high-performance",
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    /* ---- Lighting ---- */
    scene.add(new THREE.AmbientLight(0xfff8e8, 0.55));

    const sun = new THREE.DirectionalLight(0xfff5e0, 2.0);
    sun.position.set(5, 9, 4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 0.5; sun.shadow.camera.far = 25;
    sun.shadow.camera.left = -7; sun.shadow.camera.right = 7;
    sun.shadow.camera.top = 7; sun.shadow.camera.bottom = -7;
    sun.shadow.bias = -0.0005;
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0xe0e8ff, 0.3);
    fill.position.set(-4, 5, -3); scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffd9b3, 0.25);
    rim.position.set(-2, 3, 6); scene.add(rim);

    /* ---- Main group ---- */
    const group = new THREE.Group();
    group.rotation.y = -Math.PI / 5;
    scene.add(group);

    const TEX = 640;

    /* ============ TERRAIN SLAB ============ */
    const terrainTex = new THREE.CanvasTexture(generateTerrainTexture(TEX));
    terrainTex.colorSpace = THREE.SRGBColorSpace;
    terrainTex.minFilter = THREE.LinearMipmapLinearFilter;
    terrainTex.magFilter = THREE.LinearFilter;
    terrainTex.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);

    // Thicker slab for visible 3D depth
    const slabH = 0.35;
    const slabGeo = new THREE.BoxGeometry(5.2, slabH, 5.2, 1, 1, 1);

    // Earth/rock side texture
    const sideTex = (() => {
      const sc = document.createElement("canvas");
      sc.width = 128; sc.height = 32;
      const sctx = sc.getContext("2d")!;
      // Gradient from brown surface to dark rock
      const grad = sctx.createLinearGradient(0, 0, 0, 32);
      grad.addColorStop(0, "#5a5548"); grad.addColorStop(0.3, "#48443a");
      grad.addColorStop(0.7, "#3a3830"); grad.addColorStop(1, "#2e2c26");
      sctx.fillStyle = grad; sctx.fillRect(0, 0, 128, 32);
      // Add some rock noise
      for (let y = 0; y < 32; y++) {
        for (let x = 0; x < 128; x += 3) {
          const n = Math.random() * 12 - 6;
          sctx.fillStyle = `rgba(${128 + n},${122 + n},${108 + n},0.15)`;
          sctx.fillRect(x, y, 2, 1);
        }
      }
      return new THREE.CanvasTexture(sc);
    })();

    const slabMats = [
      new THREE.MeshStandardMaterial({ map: sideTex, roughness: 0.88 }),  // +X
      new THREE.MeshStandardMaterial({ map: sideTex, roughness: 0.88 }),  // -X
      new THREE.MeshStandardMaterial({ map: terrainTex, roughness: 0.62, metalness: 0 }), // top
      new THREE.MeshStandardMaterial({ color: 0x2a2822, roughness: 0.95 }), // bottom
      new THREE.MeshStandardMaterial({ map: sideTex, roughness: 0.88 }),  // +Z
      new THREE.MeshStandardMaterial({ map: sideTex, roughness: 0.88 }),  // -Z
    ];
    const slab = new THREE.Mesh(slabGeo, slabMats);
    slab.position.y = -slabH / 2;
    slab.receiveShadow = true; slab.castShadow = true;
    group.add(slab);

    /* ============ CADASTRAL OVERLAY ON SURFACE ============ */
    const cadTex = new THREE.CanvasTexture(generateCadastralOverlay(TEX));
    cadTex.minFilter = THREE.LinearMipmapLinearFilter;
    const cadMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(5.2, 5.2),
      new THREE.MeshBasicMaterial({ map: cadTex, transparent: true, depthWrite: false, side: THREE.DoubleSide })
    );
    cadMesh.rotation.x = -Math.PI / 2;
    cadMesh.position.y = 0.006;
    group.add(cadMesh);

    /* ============ FLOATING GIS LAYERS ============ */
    const layerDefs = [
      {
        // Layer 1: Drone/Satellite Survey (light blue)
        stroke: "rgba(14,165,233,0.92)", fill: "rgba(14,165,233,0.16)",
        polys: [
          [[0.05, 0.05], [0.31, 0.05], [0.31, 0.38], [0.05, 0.38]],
          [[0.36, 0.05], [0.64, 0.05], [0.64, 0.38], [0.36, 0.38]],
          [[0.70, 0.44], [0.94, 0.44], [0.94, 0.68], [0.70, 0.68]],
        ],
        dash: undefined as number[] | undefined,
        baseY: 0.42,
      },
      {
        // Layer 2: Municipal GIS (green)
        stroke: "rgba(34,197,94,0.92)", fill: "rgba(34,197,94,0.16)",
        polys: [
          [[0.05, 0.44], [0.30, 0.44], [0.30, 0.68], [0.05, 0.68]],
          [[0.36, 0.36], [0.64, 0.36], [0.64, 0.68], [0.36, 0.68]],
          [[0.06, 0.73], [0.31, 0.73], [0.31, 0.95], [0.06, 0.95]],
        ],
        dash: [8, 4] as number[],
        baseY: 0.82,
      },
      {
        // Layer 3: Revenue Records (yellow)
        stroke: "rgba(234,179,8,0.92)", fill: "rgba(234,179,8,0.16)",
        polys: [
          [[0.70, 0.06], [0.94, 0.06], [0.94, 0.36], [0.70, 0.36]],
          [[0.38, 0.73], [0.64, 0.73], [0.64, 0.95], [0.38, 0.95]],
          [[0.70, 0.74], [0.94, 0.74], [0.94, 0.95], [0.70, 0.95]],
        ],
        dash: undefined as number[] | undefined,
        baseY: 1.22,
      },
      {
        // Layer 4: Cadastral Map (maroon/magenta — GramSeva brand)
        stroke: "rgba(134,15,97,0.92)", fill: "rgba(134,15,97,0.20)",
        polys: [
          [[0.06, 0.06], [0.30, 0.06], [0.30, 0.37], [0.06, 0.37]],
          [[0.36, 0.37], [0.64, 0.37], [0.64, 0.69], [0.36, 0.69]],
          [[0.71, 0.44], [0.94, 0.44], [0.94, 0.68], [0.71, 0.68]],
          [[0.06, 0.73], [0.31, 0.73], [0.31, 0.95], [0.06, 0.95]],
        ],
        dash: [6, 3] as number[],
        baseY: 1.62,
      },
    ];

    const layerMeshes: THREE.Mesh[] = [];
    const baseHeights: number[] = [];

    for (const ld of layerDefs) {
      const tex = new THREE.CanvasTexture(makeLayerTex(TEX, ld.stroke, ld.fill, ld.polys, ld.dash));
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      const geo = new THREE.PlaneGeometry(4.8, 4.8);
      const mat = new THREE.MeshBasicMaterial({
        map: tex, transparent: true, opacity: 0.75,
        depthWrite: false, side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = ld.baseY;
      group.add(mesh);
      layerMeshes.push(mesh);
      baseHeights.push(ld.baseY);
    }

    // Thin vertical anchor lines at corners
    const lineMat = new THREE.LineBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.10 });
    const corners = [[-2.4, -2.4], [2.4, -2.4], [2.4, 2.4], [-2.4, 2.4]];
    for (const lm of layerMeshes) {
      for (const [cx, cz] of corners) {
        const pts = [new THREE.Vector3(cx, lm.position.y, cz), new THREE.Vector3(cx, 0, cz)];
        group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
      }
    }

    // Drop shadow plane beneath slab
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 14),
      new THREE.ShadowMaterial({ opacity: 0.10 })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -slabH - 0.03;
    shadow.receiveShadow = true;
    group.add(shadow);

    /* ---- Animation Loop ---- */
    let t = 0;
    let raf = 0;

    const tick = () => {
      t += 0.003; // slow time increment for elegant rotation

      // Continuous slow rotation
      group.rotation.y = -Math.PI / 5 + t * 0.12;

      // Subtle parallax camera drift
      camera.position.x = Math.sin(t * 0.28) * 0.15;
      camera.position.y = 5.5 + Math.cos(t * 0.20) * 0.08;
      camera.lookAt(0, 0.35, 0);

      // Animate GIS layers — gentle breathing + micro-alignment shifts
      for (let i = 0; i < layerMeshes.length; i++) {
        const ph = i * 0.65;
        layerMeshes[i].position.y = baseHeights[i] + Math.sin(t * 0.45 + ph) * 0.04;
        layerMeshes[i].position.x = Math.sin(t * 0.22 + ph * 1.2) * 0.02;
        layerMeshes[i].position.z = Math.cos(t * 0.18 + ph * 0.85) * 0.02;
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    /* ---- Resize Handler ---- */
    const onResize = () => {
      const rw = container.clientWidth || 640;
      const rh = container.clientHeight || 700;
      renderer.setSize(rw, rh);
      camera.aspect = rw / rh;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    /* ---- Cleanup ---- */
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
      renderer.dispose();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach((m) => {
            if (m.map) m.map.dispose();
            m.dispose();
          });
        }
      });
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="relative w-full h-[500px] min-[860px]:h-[700px]"
      style={{
        maskImage: "radial-gradient(ellipse 90% 84% at 50% 48%, black 40%, transparent 75%)",
        WebkitMaskImage: "radial-gradient(ellipse 90% 84% at 50% 48%, black 40%, transparent 75%)",
      }}
    />
  );
}
