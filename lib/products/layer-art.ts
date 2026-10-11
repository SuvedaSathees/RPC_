/**
 * The home page's layer pictures: a rendered cut-away for each job (a 3D
 * model of the bands in lib/products/home.ts, lit and textured as the real
 * materials and rendered to /public/images/layers/<job>.webp, 1400 x 856, on
 * a clear ground), and where each layer's number sits on the picture, in
 * percent of its width and height.
 */
export const LAYER_ART_SIZE = { w: 1400, h: 856 } as const;

export const LAYER_PINS: Readonly<Record<string, readonly { layer: string; x: number; y: number }[]>> = {
  bathroom: [{ layer: "coat", x: 28.3, y: 32.0 }, { layer: "screed", x: 36.8, y: 30.0 }, { layer: "adhesive", x: 45.9, y: 31.5 }, { layer: "grout", x: 60.8, y: 33.4 }],
  terrace: [{ layer: "mix", x: 22.7, y: 51.0 }, { layer: "fill", x: 28.3, y: 27.3 }, { layer: "coat", x: 53.6, y: 34.9 }],
  tank: [{ layer: "joint", x: 49.2, y: 62.6 }, { layer: "mix", x: 17.5, y: 47.3 }, { layer: "plug", x: 32.2, y: 54.3 }, { layer: "coat", x: 48.3, y: 32.6 }],
  basement: [{ layer: "sheet", x: 28.8, y: 40.4 }, { layer: "joint", x: 55.9, y: 59.9 }, { layer: "mix", x: 36.3, y: 51.1 }, { layer: "plug", x: 45.9, y: 55.4 }],
  repair: [{ layer: "clean", x: 22.9, y: 24.7 }, { layer: "prime", x: 14.0, y: 32.2 }, { layer: "bond", x: 28.3, y: 30.7 }, { layer: "mortar", x: 37.1, y: 27.5 }, { layer: "finish", x: 57.6, y: 34.0 }],
  aac: [{ layer: "joint", x: 22.4, y: 49.9 }, { layer: "block", x: 19.4, y: 25.1 }, { layer: "plaster", x: 48.8, y: 34.0 }],
};
