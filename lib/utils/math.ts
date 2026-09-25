export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
/** Normalised position of v inside [a, b], clamped to 0..1 */
export const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => t * t * (3 - 2 * t);
export const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
/** Frame-rate independent exponential damping */
export const damp = (cur: number, target: number, lambda: number, dt: number) =>
  lerp(cur, target, 1 - Math.exp(-lambda * dt));
/** 0 → 1 → 0 window: fades in over [a,b], holds, fades out over [c,d] */
export const window4 = (v: number, a: number, b: number, c: number, d: number) =>
  Math.min(range(v, a, b), 1 - range(v, c, d));
/** Deterministic pseudo-random in [0,1) */
export const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
