"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface EarthGlobeProps {
  progressRef: React.RefObject<number>;
}

export const EarthGlobe: React.FC<EarthGlobeProps> = ({ progressRef }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const width = container.clientWidth || 480;
    const height = container.clientHeight || 480;

    // ── Scene ──
    const scene = new THREE.Scene();

    // ── Camera ──
    const WIDE_DISTANCE = 2.8;
    const CLOSE_DISTANCE = 1.65;
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, WIDE_DISTANCE);
    camera.lookAt(0, 0, 0);

    // ── Renderer ──
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // ── Texture Loader ──
    const loader = new THREE.TextureLoader();
    const textures: THREE.Texture[] = [];

    const loadTex = (path: string, srgb = true): THREE.Texture => {
      const t = loader.load(path);
      t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.LinearSRGBColorSpace;
      t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      textures.push(t);
      return t;
    };

    // ── Textures ──
    const dayMap = loadTex("/earth/earth_day.jpg", true);
    const specularMap = loadTex("/earth/earth_specular.jpg", false);
    const normalMap = loadTex("/earth/earth_normal.jpg", false);
    const cloudMap = loadTex("/earth/earth_clouds.png", false);

    // ── Lighting — bright and vivid like the reference ──
    const sunLight = new THREE.DirectionalLight(0xffffff, 4.0);
    sunLight.position.set(5, 2, 6);
    scene.add(sunLight);

    // Subtle blue fill from opposite side for atmosphere-like bounce
    const fillLight = new THREE.DirectionalLight(0x4488cc, 0.6);
    fillLight.position.set(-3, -1, -4);
    scene.add(fillLight);

    const ambientLight = new THREE.AmbientLight(0x556688, 0.8);
    scene.add(ambientLight);

    // ── Globe Group (holds the tilted axis) ──
    const AXIAL_TILT = 23.5 * (Math.PI / 180);
    const globeGroup = new THREE.Group();
    globeGroup.rotation.z = AXIAL_TILT;
    scene.add(globeGroup);

    // ── Earth Sphere — vivid, high-detail ──
    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: dayMap,
      specularMap: specularMap,
      specular: new THREE.Color(0x666666),
      shininess: 35,
      normalMap: normalMap,
      normalScale: new THREE.Vector2(1.0, 1.0),
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    globeGroup.add(earthMesh);

    // ── Cloud Layer — thicker, brighter white like reference ──
    const cloudGeometry = new THREE.SphereGeometry(1.012, 48, 48);
    const cloudMaterial = new THREE.MeshPhongMaterial({
      alphaMap: cloudMap,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      color: 0xffffff,
      side: THREE.FrontSide,
    });
    const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    globeGroup.add(cloudMesh);

    // ── Inner Atmosphere (FrontSide fresnel — visible blue edge on globe) ──
    const innerAtmosVert = `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `;

    const innerAtmosFrag = `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      uniform vec3 uCameraPos;

      void main() {
        vec3 viewDir = normalize(uCameraPos - vWorldPosition);
        float fresnel = 1.0 - max(dot(viewDir, vNormal), 0.0);
        fresnel = pow(fresnel, 2.5);

        // Bright vivid blue atmosphere like reference
        vec3 atmosphereColor = vec3(0.25, 0.55, 1.0);
        gl_FragColor = vec4(atmosphereColor, fresnel * 0.85);
      }
    `;

    const innerAtmosGeometry = new THREE.SphereGeometry(1.02, 48, 48);
    const innerAtmosMaterial = new THREE.ShaderMaterial({
      vertexShader: innerAtmosVert,
      fragmentShader: innerAtmosFrag,
      uniforms: {
        uCameraPos: { value: camera.position.clone() },
      },
      transparent: true,
      side: THREE.FrontSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const innerAtmosMesh = new THREE.Mesh(innerAtmosGeometry, innerAtmosMaterial);
    globeGroup.add(innerAtmosMesh);

    // ── Outer Atmosphere Glow (BackSide — thick halo behind globe edges) ──
    const outerGlowVert = `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `;

    const outerGlowFrag = `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      uniform vec3 uCameraPos;

      void main() {
        vec3 viewDir = normalize(uCameraPos - vWorldPosition);
        float fresnel = 1.0 - max(dot(viewDir, vNormal), 0.0);
        fresnel = pow(fresnel, 1.6);

        // Deep blue outer halo — prominent like the reference image
        vec3 glowColor = vec3(0.15, 0.4, 0.95);
        gl_FragColor = vec4(glowColor, fresnel * 0.7);
      }
    `;

    const outerGlowGeometry = new THREE.SphereGeometry(1.18, 48, 48);
    const outerGlowMaterial = new THREE.ShaderMaterial({
      vertexShader: outerGlowVert,
      fragmentShader: outerGlowFrag,
      uniforms: {
        uCameraPos: { value: camera.position.clone() },
      },
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const outerGlowMesh = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
    globeGroup.add(outerGlowMesh);

    // ── Dense Starfield (matching the dense starry sky in the reference) ──
    const STAR_COUNT = 2500;
    const starPositions = new Float32Array(STAR_COUNT * 3);
    const starColors = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 30 + Math.random() * 40;

      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);

      // Vary star colors slightly: white, blue-white, warm-white
      const colorVariant = Math.random();
      if (colorVariant < 0.6) {
        // White
        starColors[i * 3] = 0.9 + Math.random() * 0.1;
        starColors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
        starColors[i * 3 + 2] = 0.95 + Math.random() * 0.05;
      } else if (colorVariant < 0.85) {
        // Blue-white
        starColors[i * 3] = 0.7 + Math.random() * 0.1;
        starColors[i * 3 + 1] = 0.8 + Math.random() * 0.1;
        starColors[i * 3 + 2] = 1.0;
      } else {
        // Warm yellow-white
        starColors[i * 3] = 1.0;
        starColors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
        starColors[i * 3 + 2] = 0.7 + Math.random() * 0.15;
      }
    }

    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.15,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      vertexColors: true,
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // ── India Target Rotation ──
    const INDIA_LON_RAD = 78.9629 * (Math.PI / 180);
    const INDIA_LAT_RAD = 20.5937 * (Math.PI / 180);
    const TARGET_ROTATION_Y = -INDIA_LON_RAD;
    const TARGET_ROTATION_X = INDIA_LAT_RAD * 0.3;

    // ── Easing ──
    const cubicInOut = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    // ── Reduced Motion: render once at India ──
    if (prefersReducedMotion) {
      earthMesh.rotation.y = TARGET_ROTATION_Y;
      earthMesh.rotation.x = TARGET_ROTATION_X;
      cloudMesh.rotation.y = TARGET_ROTATION_Y + 0.2;
      cloudMesh.rotation.x = TARGET_ROTATION_X;
      camera.position.z = CLOSE_DISTANCE;
      innerAtmosMaterial.uniforms.uCameraPos.value.copy(camera.position);
      outerGlowMaterial.uniforms.uCameraPos.value.copy(camera.position);
      renderer.render(scene, camera);

      return () => {
        earthGeometry.dispose();
        earthMaterial.dispose();
        cloudGeometry.dispose();
        cloudMaterial.dispose();
        innerAtmosGeometry.dispose();
        innerAtmosMaterial.dispose();
        outerGlowGeometry.dispose();
        outerGlowMaterial.dispose();
        starGeometry.dispose();
        starMaterial.dispose();
        textures.forEach((t) => t.dispose());
        renderer.dispose();
        if (renderer.domElement?.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      };
    }

    // ── Animation Loop ──
    let animFrameId: number;
    const startTime = performance.now();

    const IDLE_ROTATION_SPEED = (2 * Math.PI) / 50;
    const CLOUD_ROTATION_SPEED = IDLE_ROTATION_SPEED * 1.18;

    const renderLoop = (time: number) => {
      const elapsed = (time - startTime) * 0.001;

      const rawProgress = progressRef.current ?? 0;
      const progress = cubicInOut(Math.min(Math.max(rawProgress, 0), 1));

      // ── Earth Rotation ──
      const idleY = elapsed * IDLE_ROTATION_SPEED;
      const residualDrift = Math.sin(elapsed * 0.15) * 0.02;
      const targetY = TARGET_ROTATION_Y + residualDrift;
      const targetX = TARGET_ROTATION_X + Math.sin(elapsed * 0.1) * 0.008;

      const idleWeight = 1 - progress;
      const targetWeight = progress;

      earthMesh.rotation.y = idleY * idleWeight + targetY * targetWeight;
      earthMesh.rotation.x = 0 * idleWeight + targetX * targetWeight;

      // ── Cloud Rotation ──
      cloudMesh.rotation.y =
        elapsed * CLOUD_ROTATION_SPEED * idleWeight +
        (targetY + 0.15 + elapsed * 0.008) * targetWeight;
      cloudMesh.rotation.x = earthMesh.rotation.x;

      // ── Camera Dolly ──
      const camZ = THREE.MathUtils.lerp(WIDE_DISTANCE, CLOSE_DISTANCE, progress);
      camera.position.z = camZ;

      // Update atmosphere uniforms
      innerAtmosMaterial.uniforms.uCameraPos.value.copy(camera.position);
      outerGlowMaterial.uniforms.uCameraPos.value.copy(camera.position);

      // Subtle star twinkle — very slow rotation of the starfield
      stars.rotation.y = elapsed * 0.002;

      renderer.render(scene, camera);
      animFrameId = requestAnimationFrame(renderLoop);
    };

    animFrameId = requestAnimationFrame(renderLoop);

    // ── Resize Handler ──
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

    // ── Cleanup ──
    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", handleResize);

      globeGroup.remove(earthMesh);
      globeGroup.remove(cloudMesh);
      globeGroup.remove(innerAtmosMesh);
      globeGroup.remove(outerGlowMesh);
      scene.remove(globeGroup);
      scene.remove(stars);

      earthGeometry.dispose();
      earthMaterial.dispose();
      cloudGeometry.dispose();
      cloudMaterial.dispose();
      innerAtmosGeometry.dispose();
      innerAtmosMaterial.dispose();
      outerGlowGeometry.dispose();
      outerGlowMaterial.dispose();
      starGeometry.dispose();
      starMaterial.dispose();

      textures.forEach((t) => t.dispose());

      renderer.dispose();
      if (renderer.domElement?.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [progressRef]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[440px] max-h-[520px] relative overflow-hidden flex items-center justify-center"
    />
  );
};
