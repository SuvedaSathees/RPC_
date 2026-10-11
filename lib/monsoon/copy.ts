/**
 * Words for the monsoon house. Each leak is named the way an owner sees it
 * (a stain, a damp wall), then explained and fixed in RPC's own terms: the
 * fixes are the site's own waterproofing steps (lib/content.ts), the causes
 * are plain, general descriptions of how water gets in.
 */
import type { ZoneKey } from "./scene";

export const intro = {
  kicker: "Waterproofing in Erode and Coimbatore",
  title: "Keep the monsoon outside.",
  lede: "A stain on the ceiling is rarely where the water gets in. Pick a leak in this house to see where it starts, and how we seal it.",
  ask: "Where does yours leak?",
};

export interface LeakStep {
  zone: ZoneKey;
  /** the part of the house */
  place: string;
  /** what the owner notices: the label on the drawing and on the buttons */
  symptom: string;
  title: string;
  body: string;
  /** what we do about it, in order */
  fix: readonly string[];
  link: { label: string; href: string };
}

export const steps: readonly LeakStep[] = [
  {
    zone: "terrace",
    place: "Terrace",
    symptom: "Ceiling stain",
    title: "Brown rings on the ceiling after rain.",
    body: "Rain stands on the roof and soaks through hairline cracks in the slab, then shows on the ceiling below, often some way from where it got in.",
    fix: ["Cracks and corners reinforced, the slab primed", "Two coats of PU, or a torch-on membrane, turned up the parapet walls", "Drain outlets sealed so the water runs off"],
    link: { label: "Roof and terrace methods", href: "/waterproofing#m-polyurethane" },
  },
  {
    zone: "bathroom",
    place: "Bathroom",
    symptom: "Stain under a bathroom",
    title: "A damp patch under the bathroom.",
    body: "Water on the floor slips past the grout and around the pipes into the sunken slab, and comes through the ceiling of the room below.",
    fix: ["Sunken slab cleaned and every pipe opening sealed", "Two coats, 300 mm up the walls and full height in the shower", "Flooded for 48 hours before a single tile goes down"],
    link: { label: "Bathroom methods", href: "/waterproofing#m-cementitious" },
  },
  {
    zone: "walls",
    place: "Outside walls",
    symptom: "Damp wall",
    title: "Inside walls that stay damp and peel.",
    body: "Wind drives the rain into hairline cracks in the plaster. It soaks through the brick and lifts the paint on the inside, often with mould.",
    fix: ["Cracks filled and loose plaster replaced", "Re-plastered with a waterproof admixture where it is needed", "Finished in elastomeric paint that stretches over new hairline cracks"],
    link: { label: "Wall coatings", href: "/waterproofing#m-acrylic" },
  },
  {
    zone: "sump",
    place: "Sump",
    symptom: "Leaking sump",
    title: "A sump that loses water, or lets the ground in.",
    body: "Hairline cracks and pipe openings in an underground tank let clean water seep out and ground water seep in.",
    fix: ["Inlet, outlet and overflow pipes sealed with flanges", "A crystalline coat on every inside face, which grows into hairline cracks", "Filled and left to stand, to check the level holds"],
    link: { label: "Tank and sump methods", href: "/waterproofing#m-crystalline" },
  },
];

export const outro = {
  place: "Whole house",
  title: "Dry from the terrace to the sump.",
  body: "An engineer inspects the whole building, traces each leak to where it starts, and gives you one recommendation with an itemised quote, in writing. The visit is free.",
};
