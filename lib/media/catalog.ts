/**
 * The realistic pictures (and the method films) on the products and
 * waterproofing pages. Each shows a kind of product, or a method, going on.
 * They were made with AI in Google Flow (Nano Banana Pro for the pictures,
 * Veo for the films) and are labelled as such wherever they appear: they are
 * not photographs of RPC's sites or of any brand's product.
 *
 * Files live in public/media: <key>.webp (1280 wide), <key>-m.webp (640 wide)
 * and, for a film, <key>.mp4 with <key>-poster.webp (its first frame).
 * Nothing is laid over a picture's lower right corner, where the maker's mark is.
 */
export interface MediaItem {
  /** what the picture shows, for screen readers */
  alt: string;
  /** a short caption: what is going on */
  label: string;
  /** the picture's own size (the frame takes its proportions) */
  w: number;
  h: number;
  /** a film of it exists */
  film?: boolean;
  /** the files are in place */
  ready?: boolean;
}

export const MEDIA: Record<string, MediaItem> = {
  // the twelve methods
  "m-cementitious": { alt: "A brush spreading a grey cementitious waterproof coat over the concrete wall of an empty sump", label: "A cementitious coat, brushed on", w: 1280, h: 714 },
  "m-liquid-membrane": { alt: "A roller spreading a white liquid membrane across a terrace slab and up the parapet", label: "A liquid membrane, rolled on", w: 1280, h: 714 },
  "m-polyurethane": { alt: "A squeegee spreading a glossy grey polyurethane coat over a podium deck", label: "Polyurethane, spread in one seamless coat", w: 1280, h: 714 },
  "m-bituminous": { alt: "A brush laying a black bituminous coat on the outer face of a foundation wall in a trench", label: "A bituminous coat on a buried wall", w: 1280, h: 714 },
  "m-torch-on": { alt: "A gas torch fusing a rolled bitumen membrane down onto a flat roof", label: "A torch-on membrane, fused at the laps", w: 1280, h: 714 },
  "m-hdpe": { alt: "Hands pressing overlapping HDPE membrane sheets flat in a basement pit before the raft is cast", label: "HDPE sheets, laid before the pour", w: 1280, h: 714 },
  "m-crystalline": { alt: "A brush working a grey crystalline slurry into the porous wall of a concrete water tank", label: "Crystalline slurry, worked into the concrete", w: 1280, h: 714 },
  "m-acrylic": { alt: "A roller laying a bright white acrylic coat over an exposed roof terrace in the sun", label: "An acrylic coat on an exposed roof", w: 1280, h: 714 },
  "m-polyurea": { alt: "A worker in a protective suit spraying polyurea across a concrete podium deck", label: "Polyurea, sprayed hot", w: 1280, h: 714 },
  "m-injection": { alt: "Steel packers drilled along a damp crack in a basement wall, with resin being pumped in", label: "Resin injected through packers along a crack", w: 1280, h: 714 },
  "m-integral": { alt: "Liquid admixture poured from a measuring jug into a turning concrete mixer", label: "An admixture dosed in at the mixer", w: 1280, h: 714 },
  "m-waterstops": { alt: "A waterstop strip fixed along a concrete construction joint between steel bars", label: "A waterstop fixed in a construction joint", w: 1280, h: 714 },
  // kinds of product with no method of their own
  "p-powder-admix": { alt: "A bag of grey powder admixture tipped into a turning concrete mixer", label: "A powder admixture, added at the mixer", w: 1280, h: 714 },
  "p-plug": { alt: "A gloved hand pressing plugging mortar into a hole where water is running through a basement wall", label: "A plugging mortar, pressed into a running leak", w: 1280, h: 714 },
  "p-admixture": { alt: "Very fluid ready-mix concrete pouring down a chute and spreading across a reinforced slab", label: "Admixed concrete, flowing into place", w: 1280, h: 714 },
  "p-curing": { alt: "A knapsack sprayer misting white curing compound over a freshly finished slab", label: "A curing compound, sprayed on", w: 1280, h: 714 },
  "p-release": { alt: "A brush coating plywood formwork panels with release oil", label: "A release agent on the formwork", w: 1280, h: 714 },
  "p-floor": { alt: "A power trowel finishing an industrial floor dusted with floor hardener", label: "A floor hardener, trowelled in", w: 1280, h: 714 },
  "p-bonding": { alt: "A brush laying a milky bonding coat on old concrete just ahead of new mortar", label: "A bonding coat, just before new mortar", w: 1280, h: 714 },
  "p-epoxy": { alt: "A spatula spreading grey structural epoxy on the underside of a concrete beam", label: "Structural epoxy, spread on a beam", w: 1280, h: 714 },
  "p-grout": { alt: "Non-shrink grout poured into a form and flowing under a steel base plate", label: "A non-shrink grout, poured under a base plate", w: 1280, h: 714 },
  "p-anchor": { alt: "A threaded steel rod pushed into a resin-filled hole drilled in concrete", label: "A resin anchor, set in a drilled hole", w: 1280, h: 714 },
  "p-repair": { alt: "A trowel packing repair mortar into a broken-out section of a concrete column", label: "A repair mortar, packed into a broken section", w: 1280, h: 714 },
  "p-rebar": { alt: "A small brush priming cleaned, exposed steel bars in a broken-out concrete beam", label: "Exposed steel, cleaned and primed", w: 1280, h: 714 },
  "p-tile-adhesive": { alt: "A notched trowel combing tile adhesive on a screed as a large tile is lowered into place", label: "Tile adhesive, combed out with a notched trowel", w: 1280, h: 714 },
  "p-tile-grout": { alt: "A rubber float pressing grout into the joints of glossy bathroom floor tiles", label: "Grout, pressed into the tile joints", w: 1280, h: 714 },
  "p-aac": { alt: "Hands setting an AAC block on a thin bed of jointing mortar", label: "AAC blocks, laid on thin-bed mortar", w: 1280, h: 714 },
  "p-plaster": { alt: "A straight edge levelling ready-mix plaster on an AAC block wall", label: "Ready-mix plaster, levelled on a block wall", w: 1280, h: 714 },
};

export const mediaSrc = (key: string) => `/media/${key}.webp`;
export const mediaSrcSmall = (key: string) => `/media/${key}-m.webp`;
export const filmSrc = (key: string) => `/media/${key}.mp4`;
export const filmPoster = (key: string) => `/media/${key}-poster.webp`;
/** a picture is shown only once its files are in place */
export const mediaReady = (key: string | null | undefined): MediaItem | null => (key && MEDIA[key]?.ready ? MEDIA[key]! : null);
