/**
 * The twelve waterproofing methods, from RPC's "Types of Waterproofing Methods"
 * document: their order, names and main application areas are the document's;
 * the twenty places a building lets water in are its list of application
 * areas; the brands worth comparing by job and how to choose between them are
 * its own recommendation. "How it works" and the two notes on each method are
 * plain, general descriptions of the method (no claims about any one product).
 * Products are linked only where RPC's product list says a product is that kind
 * of product.
 */

export type MethodGroup = "coat" | "sheet" | "concrete" | "joint";
export type Zone = "roof" | "wet" | "tank" | "below" | "walls" | "deck" | "joint" | "crack";

export interface Method {
  no: number;
  key: string;
  /** a two-letter mark for the table */
  symbol: string;
  name: string;
  /** the name on its tile */
  short: string;
  group: MethodGroup;
  /** main application areas, as the document lists them */
  areas: string;
  /** how it goes on */
  applied: string;
  how: string;
  notes: readonly [string, string];
  /** where it is used, for the side-by-side table (from the document's areas) */
  zones: readonly Zone[];
  /** products on RPC's list that are this kind of product */
  products: readonly string[];
  /** products that help with this kind of job, and why */
  related?: readonly { slug: string; why: string }[];
}

export const METHOD_GROUPS: readonly { key: MethodGroup; label: string; line: string }[] = [
  { key: "coat", label: "Coatings", line: "Brushed, rolled, trowelled or sprayed on" },
  { key: "sheet", label: "Sheets", line: "Made in a factory, laid on site" },
  { key: "concrete", label: "In the concrete", line: "Part of the concrete itself" },
  { key: "joint", label: "Joints and cracks", line: "Sealing the lines water follows" },
];

export const METHODS: readonly Method[] = [
  {
    no: 1,
    key: "cementitious",
    symbol: "Cm",
    name: "Cementitious waterproofing",
    short: "Cementitious",
    group: "coat",
    areas: "Bathrooms, toilets, water tanks, basements",
    applied: "Brushed or trowelled on, in coats",
    how: "A cement-based slurry that bonds to concrete and masonry and cures into a hard, waterproof skin. It goes onto damp, pre-wetted surfaces, which suits wet rooms, tanks and sumps.",
    notes: ["Easy to apply and to tile over", "Standard grades are rigid; where cracks may move, a flexible grade is used"],
    zones: ["wet", "tank", "below"],
    products: ["fosroc-brushbond-grey", "fosroc-brushbond-rfx-grey", "fosroc-nitocote-cm210-white", "sika-seal-550", "sika-seal-551"],
  },
  {
    no: 2,
    key: "liquid-membrane",
    symbol: "Lm",
    name: "Liquid membrane waterproofing",
    short: "Liquid membrane",
    group: "coat",
    areas: "Terraces, roofs, balconies",
    applied: "Rolled, brushed or sprayed on, in coats",
    how: "A liquid applied in coats that cures into one seamless, rubbery membrane, with no laps or joints for water to find.",
    notes: ["Follows any shape: parapets, outlets and pipe sleeves", "Needs a clean, dry surface and its full thickness built up coat by coat"],
    zones: ["roof"],
    products: ["fosroc-brushbond-roofguard-white", "fosroc-brushbond-roofguard-terracotta"],
  },
  {
    no: 3,
    key: "polyurethane",
    symbol: "Pu",
    name: "Polyurethane (PU) waterproofing",
    short: "Polyurethane",
    group: "coat",
    areas: "Roofs, terraces, podium decks",
    applied: "Rolled or sprayed on",
    how: "A liquid polyurethane that cures into a tough, highly elastic membrane, which stretches with the slab as it heats and cools.",
    notes: ["Bridges cracks that open and close with the weather", "Needs a dry, primed surface; where it is exposed, many systems add a UV-resistant top coat"],
    zones: ["roof", "deck"],
    products: [],
  },
  {
    no: 4,
    key: "bituminous",
    symbol: "Bt",
    name: "Bituminous coating waterproofing",
    short: "Bituminous",
    group: "coat",
    areas: "Foundations, retaining walls, basements",
    applied: "Brushed or sprayed on",
    how: "A bitumen-based coat on concrete that will be buried. Bitumen repels water and stays slightly flexible.",
    notes: ["Made for the outer faces of foundations and retaining walls", "Sunlight breaks it down, so it is covered by soil or protection board"],
    zones: ["below"],
    products: [],
  },
  {
    no: 5,
    key: "torch-on",
    symbol: "Ap",
    name: "APP / SBS torch-on membrane",
    short: "APP / SBS torch-on",
    group: "sheet",
    areas: "Flat roofs, terraces, podiums",
    applied: "Sheets fused down with a gas torch",
    how: "Factory-made sheets of modified bitumen, rolled out and fused to the slab with a torch. Each sheet laps over the next and the laps are sealed with heat.",
    notes: ["An even, factory-controlled thickness", "Laps and edges are where it can fail, so they need skilled torching"],
    zones: ["roof", "deck"],
    products: [],
  },
  {
    no: 6,
    key: "hdpe",
    symbol: "Hd",
    name: "HDPE sheet membrane waterproofing",
    short: "HDPE sheet",
    group: "sheet",
    areas: "Basements, foundations, underground structures",
    applied: "Sheets laid before the pour, laps taped",
    how: "Tough high-density polyethylene sheets laid against the outside of a basement or under a raft, so the structure is wrapped in one continuous barrier.",
    notes: ["Stands up to ground water and roots", "Laps, corners and pipes passing through need careful detailing"],
    zones: ["below"],
    products: ["sikaproof-312-hdpe", "sikaproof-sandwich-tape-100"],
  },
  {
    no: 7,
    key: "crystalline",
    symbol: "Cr",
    name: "Crystalline waterproofing",
    short: "Crystalline",
    group: "concrete",
    areas: "Concrete tanks, basements, water-retaining structures",
    applied: "Mixed into the concrete, or brushed on as a slurry",
    how: "Chemicals that react with water and cement to grow crystals inside the pores and hairline cracks of the concrete, blocking water from within.",
    notes: ["Works within the concrete, so there is no surface layer to peel off", "Seals hairline cracks, not cracks that keep moving"],
    zones: ["tank", "below"],
    products: ["fosroc-conplast-crystalline"],
  },
  {
    no: 8,
    key: "acrylic",
    symbol: "Ac",
    name: "Acrylic elastomeric waterproofing",
    short: "Acrylic elastomeric",
    group: "coat",
    areas: "Exposed roofs, terraces, external surfaces",
    applied: "Rolled or sprayed on",
    how: "A thick, flexible acrylic coating for surfaces that face the weather. It stretches over fine cracks, and light colours reflect the sun.",
    notes: ["Keeps exposed roofs and walls dry, and light shades keep them cooler", "For surfaces open to the air, not under standing water or below ground"],
    zones: ["roof", "walls"],
    products: [],
  },
  {
    no: 9,
    key: "polyurea",
    symbol: "Py",
    name: "Polyurea waterproofing",
    short: "Polyurea",
    group: "coat",
    areas: "Roofs, podiums, industrial structures",
    applied: "Sprayed hot, with special equipment",
    how: "A two-part coating sprayed hot that sets in seconds into a very tough, elastic membrane.",
    notes: ["Back in use quickly, and hard-wearing under traffic", "Needs specialist spray equipment and careful surface preparation"],
    zones: ["roof", "deck"],
    products: [],
  },
  {
    no: 10,
    key: "injection",
    symbol: "In",
    name: "Injection grouting (PU / epoxy)",
    short: "Injection grouting",
    group: "joint",
    areas: "Concrete cracks, leakage points, construction joints",
    applied: "Pumped into the crack through small packers",
    how: "Resin pumped into a leaking crack or joint through small packers drilled along it. Polyurethane resins foam to stop running water; epoxy resins bond a dry crack back together.",
    notes: ["Seals a leak from inside, without breaking the structure open", "If a crack keeps moving, its cause is treated as well"],
    zones: ["crack", "joint"],
    products: [],
    related: [{ slug: "fosroc-rendroc-plug", why: "Stops an active leak quickly" }],
  },
  {
    no: 11,
    key: "integral",
    symbol: "Ia",
    name: "Integral waterproofing admixtures",
    short: "Integral admixtures",
    group: "concrete",
    areas: "Concrete slabs, foundations, water-retaining concrete",
    applied: "Mixed into concrete or mortar",
    how: "Added while concrete or mortar is mixed, so the whole mass is less permeable and water has a harder way through from the start.",
    notes: ["Works through the full thickness, wherever the concrete goes", "Helps, but does not seal joints or cracks on its own"],
    zones: ["tank", "below"],
    products: ["fosroc-conplast-wl-xtra", "fosroc-conplast-crystalline"],
  },
  {
    no: 12,
    key: "waterstops",
    symbol: "Ws",
    name: "Joint waterproofing / waterstops",
    short: "Joints and waterstops",
    group: "joint",
    areas: "Construction joints, expansion joints, basements",
    applied: "Cast into the joint as the concrete is poured",
    how: "Strips set into the joints between pours. Hydrophilic waterstops, used in construction joints, swell when water reaches them and press tight against the concrete; expansion joints take flexible waterstops and sealants that allow movement.",
    notes: ["Seals the weakest line in a tank or basement: the joint between pours", "Cast-in waterstops are fixed before the pour, so they are planned in from the start"],
    zones: ["joint", "below"],
    products: ["fosroc-supercast-sw20", "sikaswell-a2010-bar"],
  },
];

/**
 * The twenty places from the document's list of application areas, each with
 * the methods whose own application areas (in the document's method table)
 * name that place. Where the document names no method for a place, the list
 * is empty and the page says so rather than guessing.
 */
export const PLACES: readonly { key: string; label: string; methods: readonly number[] }[] = [
  { key: "terrace", label: "Terrace and roof", methods: [2, 3, 5, 8, 9] },
  { key: "bathroom", label: "Bathroom and toilet", methods: [1] },
  { key: "tank", label: "Water tank and sump", methods: [1, 7, 11] },
  { key: "basement", label: "Basement and foundation", methods: [1, 4, 6, 7, 11, 12] },
  { key: "balcony", label: "Balcony and utility areas", methods: [2] },
  { key: "walls", label: "External walls and façades", methods: [8] },
  { key: "podium", label: "Podium decks", methods: [3, 5, 9] },
  { key: "planter", label: "Garden and planter boxes", methods: [] },
  { key: "pool", label: "Swimming pools", methods: [] },
  { key: "kitchen", label: "Kitchen and wet areas", methods: [] },
  { key: "lift", label: "Lift pits", methods: [] },
  { key: "joints", label: "Construction and expansion joints", methods: [10, 12] },
  { key: "cracks", label: "Concrete cracks", methods: [10] },
  { key: "parking", label: "Parking decks", methods: [] },
  { key: "industrial", label: "Industrial floors", methods: [] },
  { key: "bridge", label: "Bridges and flyovers", methods: [] },
  { key: "tunnel", label: "Tunnels and underground structures", methods: [6] },
  { key: "sewage", label: "Sewage and effluent treatment tanks", methods: [] },
  { key: "retaining", label: "Retaining walls", methods: [4] },
  { key: "greenroof", label: "Roof gardens and green roofs", methods: [] },
];

/** the side-by-side table's columns */
export const ZONES: readonly { key: Zone; label: string }[] = [
  { key: "roof", label: "Roofs and terraces" },
  { key: "wet", label: "Bathrooms and wet areas" },
  { key: "tank", label: "Tanks and water-retaining" },
  { key: "below", label: "Basements and foundations" },
  { key: "walls", label: "External walls" },
  { key: "deck", label: "Podiums and industrial" },
  { key: "joint", label: "Construction joints" },
  { key: "crack", label: "Cracks and leaks" },
];

/** the document's "brands worth evaluating", by job */
export const BRANDS_BY_JOB: readonly { job: string; brands: string }[] = [
  { job: "Terrace and roof", brands: "Fosroc, Dr. Fixit, SmartCare, Berger, Sika" },
  { job: "Bathroom and toilet", brands: "Fosroc, Sika, ARDEX ENDURA, Dr. Fixit" },
  { job: "Basement and foundation", brands: "Fosroc, Sika, Mapei, ARDEX ENDURA" },
  { job: "Water tanks", brands: "Fosroc, Sika, MYK Schomburg" },
  { job: "Crystalline waterproofing", brands: "Penetron, Kryton, Fosroc, ARDEX ENDURA" },
  { job: "PU injection and crack leakage", brands: "Sika, Fosroc, MC-Bauchemie" },
  { job: "APP and bituminous membranes", brands: "STP, Fosroc, ARDEX ENDURA" },
];

/** how the document says to choose between them */
export const CHOOSING: readonly { title: string; line: string }[] = [
  { title: "Technical suitability", line: "Does it suit the surface, the water and the movement on this job?" },
  { title: "Local availability", line: "Can it be had in Erode when the job needs it, with the right accessories?" },
  { title: "Project cost", line: "What the whole system costs on this area, not just one tin." },
  { title: "Warranty conditions", line: "What the maker and the applicator stand behind, and for how long." },
];
