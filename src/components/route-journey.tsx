"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { discussMailto } from "@/lib/site";

const CHAPTERS = [
  {
    id: "open",
    kicker: "iServe Robotics",
    title: "Deploy robots. Scale fleets.",
    body: "The gap is between a robot that can run and a fleet that keeps working on a real site. iServe closes it — machines that read a place and judge how to work in it, and the deployment that puts them there.",
    cta: true,
  },
  {
    id: "route",
    kicker: "Deploy",
    title: "One site, understood.",
    body: "A site is not a diagram. Access, hours, and the people already there are conditions a machine has to read for itself, and keep reading as the day changes.",
  },
  {
    id: "scale",
    kicker: "Scale",
    title: "The next site, without starting over.",
    body: "What the first deployment made clear carries to the next. The fleet grows because the machines adapt to each place, not because each one is set up by hand.",
  },
] as const;

function chapterIndex(progress: number) {
  if (progress < 0.34) return 0;
  if (progress < 0.72) return 1;
  return 2;
}

function reducedNow() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type Disposable = THREE.BufferGeometry | THREE.Material | THREE.Texture;

function shadowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  if (!context) return null;
  const gradient = context.createRadialGradient(64, 64, 8, 64, 64, 64);
  gradient.addColorStop(0, "rgba(48, 40, 32, 0.32)");
  gradient.addColorStop(1, "rgba(48, 40, 32, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function buildFleet(scene: THREE.Scene, bin: Disposable[], fleet: THREE.Mesh[], onReady: () => void) {
  const shadeMap = shadowTexture();
  const shadeMat = new THREE.MeshBasicMaterial({
    map: shadeMap ?? undefined,
    transparent: true,
    depthWrite: false,
  });
  if (shadeMap) bin.push(shadeMap);
  bin.push(shadeMat);
  const loader = new THREE.TextureLoader();
  const units = [
    { url: "/media/fleet/floor.png", x: 4.05, z: 4.5, height: 0.58 },
    { url: "/media/fleet/compact.png", x: 5.2, z: 5.25, height: 0.74 },
    { url: "/media/fleet/guide.png", x: 6.45, z: 4.35, height: 0.9 },
  ];
  for (const unit of units) {
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      alphaTest: 0.2,
      toneMapped: false,
      depthWrite: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(unit.x, unit.height / 2, unit.z);
    mesh.scale.set(unit.height, unit.height, 1);
    mesh.visible = false;
    scene.add(mesh);
    bin.push(geometry, material);
    fleet.push(mesh);
    const shadowGeo = new THREE.PlaneGeometry(1, 1);
    const shadow = new THREE.Mesh(shadowGeo, shadeMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(unit.x, 0.02, unit.z);
    shadow.scale.set(unit.height * 1.15, unit.height * 0.42, 1);
    scene.add(shadow);
    mesh.userData.shadow = shadow;
    bin.push(shadowGeo);
    loader.load(unit.url, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
      material.map = texture;
      material.needsUpdate = true;
      const aspect = texture.image.width / texture.image.height;
      mesh.scale.set(unit.height * aspect, unit.height, 1);
      mesh.position.y = unit.height / 2;
      mesh.userData.ready = true;
      mesh.visible = true;
      shadow.scale.x = unit.height * aspect * 0.92;
      onReady();
      bin.push(texture);
    });
  }
}

export function RouteJourney() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fallbackRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const reduced = reducedNow();
    if (reduced) {
      document.documentElement.classList.add("reduce-motion");
      document.documentElement.dataset.motion = "reduce";
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      });
    } catch {
      if (fallbackRef.current) fallbackRef.current.hidden = false;
      return;
    }
    if (!renderer.getContext()) {
      if (fallbackRef.current) fallbackRef.current.hidden = false;
      return;
    }

    const bin: Disposable[] = [];
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf3eee6);
    scene.fog = new THREE.Fog(0xf3eee6, 8.5, 15);

    const camera = new THREE.PerspectiveCamera(32, 1, 0.06, 80);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene.add(new THREE.HemisphereLight(0xfff8f0, 0xd9cfc0, 0.72));
    const sun = new THREE.DirectionalLight(0xfff1e0, 2.35);
    sun.position.set(7, 12, 9);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 2;
    sun.shadow.camera.far = 32;
    sun.shadow.camera.left = -10;
    sun.shadow.camera.right = 10;
    sun.shadow.camera.top = 10;
    sun.shadow.camera.bottom = -10;
    sun.shadow.bias = -0.0004;
    scene.add(sun);
    sun.target.position.set(3.2, 0, 1);
    scene.add(sun.target);
    const fill = new THREE.DirectionalLight(0xd5e0f2, 0.55);
    fill.position.set(-6, 4, 7);
    scene.add(fill);

    const groundGeo = new THREE.PlaneGeometry(64, 64);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xe6ddd0, roughness: 1, metalness: 0 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    bin.push(groundGeo, groundMat);

    const courtGeo = new THREE.PlaneGeometry(7.2, 18);
    const courtMat = new THREE.MeshStandardMaterial({ color: 0xefe7db, roughness: 0.96, metalness: 0 });
    const court = new THREE.Mesh(courtGeo, courtMat);
    court.rotation.x = -Math.PI / 2;
    court.position.set(3.4, 0.008, -2.2);
    court.receiveShadow = true;
    scene.add(court);
    bin.push(courtGeo, courtMat);

    const ribbonMat = new THREE.MeshBasicMaterial({ color: 0x1e4ed8 });
    bin.push(ribbonMat);
    const drawRibbon = (points: THREE.Vector3[]) => {
      const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.12);
      const geometry = new THREE.BufferGeometry();
      const positions: number[] = [];
      const index: number[] = [];
      const steps = 48;
      for (let i = 0; i <= steps; i += 1) {
        const t = i / steps;
        const point = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t);
        const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize().multiplyScalar(0.022);
        positions.push(point.x + side.x, 0.02, point.z + side.z, point.x - side.x, 0.02, point.z - side.z);
        if (i < steps) {
          const base = i * 2;
          index.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
        }
      }
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      geometry.setIndex(index);
      const mesh = new THREE.Mesh(geometry, ribbonMat);
      mesh.renderOrder = 2;
      scene.add(mesh);
      bin.push(geometry);
    };
    drawRibbon([
      new THREE.Vector3(4.3, 0.02, 6.2),
      new THREE.Vector3(3.3, 0.02, 3.6),
      new THREE.Vector3(2.5, 0.02, 1.7),
    ]);
    drawRibbon([
      new THREE.Vector3(2.55, 0.02, -4.1),
      new THREE.Vector3(2.75, 0.02, -6.0),
      new THREE.Vector3(2.9, 0.02, -7.55),
    ]);

    const fleet: THREE.Mesh[] = [];
    let redraw = () => {};
    buildFleet(scene, bin, fleet, () => redraw());
    // The fleet is the hero now: the camera stays with the three machines, easing
    // closer and then drawing back along the route instead of flying into windows.
    const camPath = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(1.35, 1.72, 13.4),
        new THREE.Vector3(1.75, 1.6, 11.6),
        new THREE.Vector3(2.4, 1.5, 9.4),
        new THREE.Vector3(3.6, 1.42, 7.85),
        new THREE.Vector3(4.6, 1.74, 8.9),
        new THREE.Vector3(3.2, 2.5, 12.2),
        new THREE.Vector3(2.6, 2.45, 13.6),
      ],
      false,
      "catmullrom",
      0.05,
    );
    const lookPath = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(3.7, 0.38, 4.7),
        new THREE.Vector3(4.2, 0.4, 4.85),
        new THREE.Vector3(5.1, 0.46, 4.8),
        new THREE.Vector3(5.3, 0.5, 4.7),
        new THREE.Vector3(5.2, 0.48, 4.6),
        new THREE.Vector3(4.6, 0.36, 4.65),
        new THREE.Vector3(4.15, 0.28, 4.7),
      ],
      false,
      "catmullrom",
      0.05,
    );

    let mobileView = false;
    // Slow idle orbit around the opening fleet. The plates stay billboarded, so this
    // reads as the group turning rather than the camera crossing flat cutouts.
    const ORBIT_PERIOD = 26;
    const ORBIT_RADIUS = 0.62;
    const ORBIT_LIFT = 0.12;
    let orbitTime = 0;
    const apply = (progress: number) => {
      const p = Math.min(1, Math.max(0, progress));
      const pos = camPath.getPoint(p);
      const look = lookPath.getPoint(p);
      if (mobileView) {
        look.x += 1.55;
        look.y -= 0.2;
      }
      // Only at the very top, easing out as the scroll choreography takes over.
      const idle = Math.max(0, 1 - p / 0.09);
      if (idle > 0) {
        const ease = idle * idle * (3 - 2 * idle);
        const angle = (orbitTime / ORBIT_PERIOD) * Math.PI * 2;
        pos.x += Math.sin(angle) * ORBIT_RADIUS * ease;
        pos.z += (Math.cos(angle) - 1) * ORBIT_RADIUS * ease;
        pos.y += Math.sin(angle * 0.5) * ORBIT_LIFT * ease;
      }
      camera.position.copy(pos);
      camera.lookAt(look);
      camera.updateMatrixWorld();
      for (const mesh of fleet) {
        const dx = camera.position.x - mesh.position.x;
        const dz = camera.position.z - mesh.position.z;
        mesh.rotation.y = Math.atan2(dx, dz);
        const shadow = mesh.userData.shadow as THREE.Object3D | undefined;
        if (mesh.userData.ready !== true) {
          mesh.visible = false;
          if (shadow) shadow.visible = false;
          continue;
        }
        // A plate that is close and near the frame edge reads as a giant sliced by the camera.
        // Keep it while it sits comfortably in view, and hide it once it would leave the frame.
        const dist = Math.hypot(dx, camera.position.y - mesh.position.y, dz);
        const ndc = mesh.position.clone().project(camera);
        const margin = dist < 6.5 ? 0.62 : 0.94;
        const inView = ndc.z > -1 && ndc.z < 1 && Math.abs(ndc.x) < margin && Math.abs(ndc.y) < margin;
        mesh.visible = inView;
        if (shadow) shadow.visible = inView;
      }
      section.style.setProperty("--p", p.toFixed(4));
      section.dataset.progress = p.toFixed(3);
      section.dataset.camera = `${pos.x.toFixed(2)},${pos.y.toFixed(2)},${pos.z.toFixed(2)}`;
      const next = chapterIndex(p);
      const nodes = section.querySelectorAll<HTMLElement>("[data-chapter]");
      nodes.forEach((node) => {
        const active = Number(node.dataset.chapter) === next;
        node.classList.toggle("is-active", active);
        if (!reduced) {
          node.style.opacity = active ? "1" : "0";
          node.style.visibility = active ? "visible" : "hidden";
        }
      });
    };

    const resize = () => {
      const width = canvas.clientWidth || window.innerWidth;
      const height = canvas.clientHeight || window.innerHeight;
      mobileView = window.matchMedia("(max-width: 860px)").matches;
      camera.fov = mobileView ? 50 : 38;
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
      const ratio = Math.min(window.devicePixelRatio || 1, mobileView ? 1.5 : 1.75);
      renderer.setPixelRatio(ratio);
      renderer.setSize(width, height, false);
    };

    let progress = reduced ? 0.08 : 0;
    const render = () => {
      apply(progress);
      renderer.render(scene, camera);
    };
    redraw = render;
    resize();
    render();

    // Idle orbit loop. Runs only while the opening is on screen and motion is allowed,
    // so the rest of the page stays scroll-driven and the GPU idles once it scrolls away.
    let orbitRaf = 0;
    let orbitLast = 0;
    let onScreen = true;
    const readProgress = () => {
      const rect = section.getBoundingClientRect();
      const scrollable = section.offsetHeight - window.innerHeight;
      return scrollable <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / scrollable));
    };
    const stopOrbit = () => {
      if (!orbitRaf) return;
      cancelAnimationFrame(orbitRaf);
      orbitRaf = 0;
      orbitLast = 0;
    };
    const orbitFrame = (now: number) => {
      // Re-read scroll here too: the section is sticky, so a scroll inside it can
      // settle without the listener's last frame winning the race.
      progress = readProgress();
      if (progress >= 0.09) {
        stopOrbit();
        render();
        return;
      }
      if (orbitLast) orbitTime += Math.min(0.05, (now - orbitLast) / 1000);
      orbitLast = now;
      render();
      orbitRaf = requestAnimationFrame(orbitFrame);
    };
    const syncOrbit = () => {
      const wanted = !reduced && !document.hidden && readProgress() < 0.09 && onScreen;
      if (wanted && !orbitRaf) orbitRaf = requestAnimationFrame(orbitFrame);
      else if (!wanted) stopOrbit();
    };

    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries.some((entry) => entry.isIntersecting);
        syncOrbit();
      },
      { rootMargin: "100px" },
    );
    io.observe(section);
    document.addEventListener("visibilitychange", syncOrbit);

    let frame = 0;
    const onScroll = () => {
      if (reduced) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const scrollable = section.offsetHeight - window.innerHeight;
        progress = scrollable <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / scrollable));
        syncOrbit();
        if (!orbitRaf) render();
      });
    };
    const onResize = () => {
      resize();
      render();
    };
    onScroll();
    syncOrbit();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      stopOrbit();
      io.disconnect();
      document.removeEventListener("visibilitychange", syncOrbit);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      bin.forEach((item) => item.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="journey"
      data-testid="hero"
      data-progress="0"
      aria-labelledby="hero-title"
    >
      <div className="journey-pin">
        <canvas ref={canvasRef} className="journey-canvas" aria-hidden="true" />
        <p ref={fallbackRef} className="journey-fallback" role="status" hidden>
          This browser could not start the spatial view. The route below is still described in the
          text, and the two studies follow.
        </p>
        <div className="journey-copy">
          {CHAPTERS.map((item, index) => (
            <article
              key={item.id}
              className={index === 0 ? "journey-chapter is-active" : "journey-chapter"}
              data-chapter={index}
            >
              <p className="kicker">{item.kicker}</p>
              {index === 0 ? (
                <h1 id="hero-title">{item.title}</h1>
              ) : (
                <h2>{item.title}</h2>
              )}
              <p className="lede">{item.body}</p>
              {"cta" in item && item.cta ? (
                <div className="hero-actions">
                  <a className={cn(buttonVariants({ variant: "default" }), "header-cta")} href={discussMailto}>
                    Discuss your deployment
                  </a>
                  <a className="text-link" href="#patrol">
                    The two studies
                  </a>
                </div>
              ) : null}
            </article>
          ))}
        </div>
        <div className="journey-meter" aria-hidden="true">
          <span />
        </div>
      </div>
    </section>
  );
}
