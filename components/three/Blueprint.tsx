"use client";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { dims, type BuildingConfig } from "@/lib/three/building";
import { frame } from "@/lib/three/choreography";

type Seg = [number, number, number, number, number, number];

/** Floor plan, grid and dimension lines on the ground plane (y ≈ 0.03). */
function planSegments(c: BuildingConfig): Seg[] {
  const { W, D } = dims(c);
  const y = 0.04;
  const s: Seg[] = [];
  const line = (x0: number, z0: number, x1: number, z1: number) => s.push([x0, y, z0, x1, y, z1]);
  const rect = (x0: number, z0: number, x1: number, z1: number) => {
    line(x0, z0, x1, z0); line(x1, z0, x1, z1); line(x1, z1, x0, z1); line(x0, z1, x0, z0);
  };
  const dashed = (x0: number, z0: number, x1: number, z1: number, dash = 1.2, gap = 0.8) => {
    const len = Math.hypot(x1 - x0, z1 - z0);
    const n = Math.floor(len / (dash + gap));
    for (let i = 0; i < n; i++) {
      const a = (i * (dash + gap)) / len;
      const b = (i * (dash + gap) + dash) / len;
      line(x0 + (x1 - x0) * a, z0 + (z1 - z0) * a, x0 + (x1 - x0) * b, z0 + (z1 - z0) * b);
    }
  };
  const circle = (cx: number, cz: number, r: number, a0 = 0, a1 = Math.PI * 2, n = 24) => {
    for (let i = 0; i < n; i++) {
      const t0 = a0 + ((a1 - a0) * i) / n;
      const t1 = a0 + ((a1 - a0) * (i + 1)) / n;
      line(cx + Math.cos(t0) * r, cz + Math.sin(t0) * r, cx + Math.cos(t1) * r, cz + Math.sin(t1) * r);
    }
  };
  const xs = Array.from({ length: c.bays + 1 }, (_, i) => -W / 2 + i * c.bayW);
  const zs = Array.from({ length: c.depthBays + 1 }, (_, i) => -D / 2 + i * c.bayD);

  // 1. plot boundary (dashed)
  const hx = W / 2 + 16, hz = D / 2 + 14;
  dashed(-hx, -hz, hx, -hz); dashed(hx, -hz, hx, hz); dashed(hx, hz, -hx, hz); dashed(-hx, hz, -hx, -hz);
  // 2. structural grid + bubbles
  for (const x of xs) { line(x, -D / 2 - 5, x, D / 2 + 5); circle(x, D / 2 + 6, 0.9); }
  for (const z of zs) { line(-W / 2 - 5, z, W / 2 + 5, z); circle(-W / 2 - 6, z, 0.9); }
  // 3. building outline + balcony edge
  rect(-W / 2, -D / 2, W / 2, D / 2);
  rect(-W / 2 + 0.3, -D / 2 + 0.3, W / 2 - 0.3, D / 2 - 0.3);
  dashed(-W / 2, D / 2 + c.balcony, W / 2, D / 2 + c.balcony, 0.6, 0.4);
  // 4. core + partitions + door swings
  const coreD = 4.6, coreW = 5.2, cz = -D / 2 + coreD / 2 + 0.6;
  rect(-coreW / 2, cz - coreD / 2, coreW / 2, cz + coreD / 2);
  line(-coreW / 2, cz, coreW / 2, cz);
  line(-W / 2, cz + coreD / 2 + 1.6, W / 2, cz + coreD / 2 + 1.6);
  for (const x of xs.slice(1, -1)) line(x, cz + coreD / 2 + 1.6, x, D / 2);
  for (let i = 0; i < c.bays; i++) {
    const x = -W / 2 + i * c.bayW + 1.2;
    const z = cz + coreD / 2 + 1.6;
    circle(x, z, 0.9, 0, Math.PI / 2, 8);
    line(x, z, x, z + 0.9);
    line(x + c.bayW * 0.55, z, x + c.bayW * 0.55, D / 2 - 2.4);
  }
  // 5. dimension strings with ticks
  const dz = D / 2 + 3.4;
  line(-W / 2, dz, W / 2, dz);
  for (const x of xs) line(x - 0.35, dz - 0.35, x + 0.35, dz + 0.35);
  const dz2 = D / 2 + 4.6;
  line(-W / 2, dz2, W / 2, dz2);
  for (const x of [-W / 2, W / 2]) { line(x - 0.35, dz2 - 0.35, x + 0.35, dz2 + 0.35); line(x, D / 2 + 0.6, x, dz2 + 0.6); }
  const dx = -W / 2 - 3.4;
  line(dx, -D / 2, dx, D / 2);
  for (const z of zs) line(dx - 0.35, z - 0.35, dx + 0.35, z + 0.35);
  // 6. north point
  circle(W / 2 + 9, -D / 2 - 6, 1.4);
  line(W / 2 + 9, -D / 2 - 4.2, W / 2 + 9, -D / 2 - 8);
  line(W / 2 + 9, -D / 2 - 8, W / 2 + 8.4, -D / 2 - 7);
  return s;
}

/** Vertical wireframe of the future massing, drawn from the ground upward. */
function ghostSegments(c: BuildingConfig): Seg[] {
  const { W, D, level, roof } = dims(c);
  const s: Seg[] = [];
  const box = (y0: number, y1: number, x0: number, x1: number, z0: number, z1: number) => {
    const P = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]] as const;
    for (let i = 0; i < 4; i++) {
      const a = P[i]!, b = P[(i + 1) % 4]!;
      s.push([a[0], y1, a[1], b[0], y1, b[1]]);
    }
    for (const p of P) s.push([p[0], y0, p[1], p[0], y1, p[1]]);
  };
  for (let f = 0; f < c.floors; f++) {
    const bal = f + 1 < c.floors ? c.balcony : 0;
    box(level(f), level(f + 1), -W / 2, W / 2, -D / 2, D / 2 + bal);
  }
  if (c.penthouse) box(roof, roof + c.floorH, -W * 0.4, W * 0.16, -D / 2, -D / 2 + D * 0.62);
  return s;
}

function makeLines(segs: Seg[], color: string) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(segs.flat(), 3));
  const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  const l = new THREE.LineSegments(g, m);
  l.frustumCulled = false;
  l.renderOrder = 2;
  return l;
}

function gridSegments(size: number, step: number): Seg[] {
  const s: Seg[] = [];
  for (let v = -size; v <= size + 1e-6; v += step) {
    s.push([v, 0.02, -size, v, 0.02, size]);
    s.push([-size, 0.02, v, size, 0.02, v]);
  }
  return s;
}

export function Blueprint({ config }: { config: BuildingConfig }) {
  const { W, D } = dims(config);
  const plan = useMemo(() => makeLines(planSegments(config), "#f4f7ff"), [config]);
  const ghost = useMemo(() => makeLines(ghostSegments(config), "#dfe8ff"), [config]);
  const grid = useMemo(() => makeLines(gridSegments(90, 2), "#7fa3e6"), []);
  const labels = useRef<HTMLDivElement[]>([]);
  const nPlan = plan.geometry.attributes.position!.count;
  const nGhost = ghost.geometry.attributes.position!.count;

  useFrame(() => {
    const op = frame.planOpacity;
    plan.visible = op > 0.001;
    ghost.visible = frame.blueprint > 0.001;
    grid.visible = frame.blueprint > 0.001;
    (plan.material as THREE.LineBasicMaterial).opacity = op * 0.9;
    (ghost.material as THREE.LineBasicMaterial).opacity = frame.blueprint * 0.55;
    (grid.material as THREE.LineBasicMaterial).opacity = frame.blueprint * 0.16;
    plan.geometry.setDrawRange(0, Math.floor((nPlan * frame.planDraw) / 2) * 2);
    ghost.geometry.setDrawRange(0, Math.floor((nGhost * frame.ghostDraw) / 2) * 2);
    const lo = String(Math.max(0, (frame.planDraw - 0.7) / 0.3) * frame.blueprint);
    for (const el of labels.current) if (el) el.style.opacity = lo;
  });

  const mm = (m: number) => Math.round(m * 1000).toLocaleString("en-GB").replace(/,/g, " ");
  const label = (i: number, text: string, pos: [number, number, number]) => (
    <Html key={i} position={pos} center zIndexRange={[4, 0]} style={{ pointerEvents: "none" }}>
      <div ref={(el) => { if (el) labels.current[i] = el; }} className="bp-label" style={{ opacity: 0 }}>{text}</div>
    </Html>
  );
  const xs = Array.from({ length: config.bays + 1 }, (_, i) => -W / 2 + i * config.bayW);
  const zs = Array.from({ length: config.depthBays + 1 }, (_, i) => -D / 2 + i * config.bayD);

  return (
    <group>
      <primitive object={grid} />
      <primitive object={plan} />
      <primitive object={ghost} />
      {label(0, mm(W), [0, 0.1, D / 2 + 5.4])}
      {label(1, mm(D), [-W / 2 - 4.6, 0.1, 0])}
      {xs.map((x, i) => label(2 + i, String(i + 1), [x, 0.1, D / 2 + 6]))}
      {zs.map((z, i) => label(10 + i, String.fromCharCode(65 + i), [-W / 2 - 6, 0.1, z]))}
    </group>
  );
}
