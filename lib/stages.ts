/**
 * The 12 photographic plates of the hero, in build order.
 *
 * Each plate is one photograph of the SAME project from (roughly) the same
 * camera. `at` is the hero scroll window (0..1) in which the plate is the one
 * on screen; neighbours cross-dissolve at the edges. `move` is the slow
 * camera move across the plate — [scale, x%, y%] at the start and at the end.
 *
 * The windows sit inside the existing chapter windows of the hero (Site,
 * Blueprint, Foundation, Structure, Envelope, Completion, Handover), so the
 * captions, rail, build meter and reveal keep their original timing.
 *
 * To swap in final photography, replace the file in public/stages/ with the
 * same name — see docs/STAGE-PLATES.md.
 */
export interface StagePlate {
  file: string;
  label: string;
  alt: string;
  at: [number, number];
  move: { from: [number, number, number]; to: [number, number, number] };
}

export const STAGE_PLATES: StagePlate[] = [
  { file: "01-empty-plot", label: "Empty plot", alt: "Open plot of land with trees and the city beyond", at: [0, 0.3], move: { from: [1.16, 3, 2], to: [1.04, 0, 0] } },
  { file: "02-site-preparation", label: "Site preparation", alt: "Site cleared and excavated, first reinforcement on site", at: [0.3, 0.345], move: { from: [1.06, 1, 0], to: [1.12, -1.5, -1] } },
  { file: "03-foundation", label: "Foundation", alt: "Footings, PCC bed and column starter bars", at: [0.345, 0.42], move: { from: [1.14, -2, -2], to: [1.04, 1, 0] } },
  { file: "04-rcc-columns", label: "RCC columns", alt: "Column reinforcement cages rising from the footings", at: [0.42, 0.47], move: { from: [1.04, 0, 1], to: [1.1, 0, -1] } },
  { file: "05-beams-and-slabs", label: "Beams & slabs", alt: "RCC beams and slabs cast over the first floors", at: [0.47, 0.52], move: { from: [1.08, 0, 1.5], to: [1.03, 0, -0.5] } },
  { file: "06-structural-frame", label: "Structural frame", alt: "The full RCC frame topped out", at: [0.52, 0.58], move: { from: [1.03, 0, 0], to: [1.1, 0, 1.5] } },
  { file: "07-masonry-walls", label: "Block walls", alt: "Masonry infill walls between the frame", at: [0.58, 0.64], move: { from: [1.1, 1.5, 1], to: [1.04, -1, 0] } },
  { file: "08-plastering", label: "Plastering", alt: "External cement plaster going on", at: [0.64, 0.69], move: { from: [1.04, 0, -1], to: [1.1, 0, 1] } },
  { file: "09-windows-and-glass", label: "Windows & glass", alt: "Windows, glazing and balcony railings set", at: [0.69, 0.75], move: { from: [1.08, 0, 1], to: [1.02, 0, 0] } },
  { file: "10-exterior-finishing", label: "Exterior finishing", alt: "Facade paint and finishes", at: [0.75, 0.81], move: { from: [1.02, 0, 0], to: [1.08, 1, -1] } },
  { file: "11-landscaping", label: "Landscaping", alt: "Trees, lawns, paving and the entrance", at: [0.81, 0.87], move: { from: [1.1, 0, -1], to: [1.03, 0, 0] } },
  { file: "12-completed", label: "Completed", alt: "The completed building at golden hour", at: [0.87, 1.01], move: { from: [1.1, 0, -1.5], to: [1.0, 0, 0] } },
];

/** plate image path (overridable for single-file previews) */
export const plateSrc = (file: string) => {
  const inline = typeof window !== "undefined" ? (window as Window & { __RPC_STAGES?: Record<string, string> }).__RPC_STAGES : undefined;
  return inline?.[file] ?? `/stages/${file}.jpg`;
};
