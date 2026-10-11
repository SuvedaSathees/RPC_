/**
 * What RPC's "Types of Waterproofing Methods" document says beyond the method
 * table (lib/methods/data.ts): why waterproofing matters, what each of the
 * twenty application areas is protected against, RPC's own service
 * categories, the brands and what each specialises in, the Fosroc products
 * it names for each kind of method, and its recommendation on brands. The
 * wording is the document's, lightly tidied; nothing is added to it.
 */

export const DOC_INTRO =
  "Waterproofing methods are selected based on the structure, water exposure, surface condition and application requirements.";
export const DOC_WHY =
  "Waterproofing is essential in residential, commercial, industrial and infrastructure projects to help prevent water leakage, seepage, dampness and deterioration of structures.";

/** each application area's purpose, by the key it has in PLACES (lib/methods/data.ts), in the document's order */
export const AREA_PURPOSE: Readonly<Record<string, string>> = {
  terrace: "Prevents rainwater seepage through flat roofs, roof slabs and exposed terraces.",
  bathroom: "Protects floors, walls, shower areas and pipe penetrations from water leakage.",
  tank: "Waterproofing for overhead tanks, underground sumps and water-retaining structures.",
  basement: "Protects underground concrete structures against groundwater penetration and dampness.",
  balcony: "Prevents seepage into lower floors.",
  walls: "Controls rainwater penetration and damp patches.",
  podium: "Protects concrete slabs beneath landscaping and traffic areas.",
  planter: "Prevents water leakage from soil and irrigation.",
  pool: "Retains water and protects surrounding structures.",
  kitchen: "Protects floors around sinks and wet zones.",
  lift: "Reduces groundwater ingress into elevator pits.",
  joints: "Prevents leakage through structural joints.",
  cracks: "Treats leakage paths and suitable structural cracks.",
  parking: "Protects slabs exposed to rainwater and vehicle traffic.",
  industrial: "Protects against moisture and relevant chemical exposure.",
  bridge: "Protects decks and concrete components against water ingress.",
  tunnel: "Controls groundwater penetration.",
  sewage: "Provides waterproofing and chemical-resistant protection.",
  retaining: "Reduces water penetration through below-ground walls.",
  greenroof: "Protects slabs beneath planting and drainage layers.",
};

/** the document's recommended RPC service categories, each with the application area it covers */
export const SERVICE_CATEGORIES: readonly { title: string; area: string }[] = [
  { title: "Terrace waterproofing", area: "terrace" },
  { title: "Bathroom waterproofing", area: "bathroom" },
  { title: "Water tank waterproofing", area: "tank" },
  { title: "Basement waterproofing", area: "basement" },
  { title: "Balcony waterproofing", area: "balcony" },
  { title: "External wall waterproofing", area: "walls" },
  { title: "Garden and podium waterproofing", area: "podium" },
  { title: "Crack and leakage treatment", area: "cracks" },
];

/** the brands the document lists, and what each mainly specialises in */
export const BRAND_SPECIALITY: readonly { brand: string; speciality: string }[] = [
  { brand: "Fosroc", speciality: "Cementitious coatings, membranes, waterstops, integral waterproofing" },
  { brand: "Sika", speciality: "PU membranes, cementitious waterproofing, basement systems" },
  { brand: "Dr. Fixit", speciality: "Residential terraces, bathrooms, walls, crack treatment" },
  { brand: "Asian Paints SmartCare", speciality: "Roof coatings, exterior walls, interior damp-proofing" },
  { brand: "Berger HomeShield", speciality: "Roof coatings, damp-proofing, cementitious systems" },
  { brand: "ARDEX ENDURA", speciality: "Liquid membranes, sheet membranes, crystalline systems" },
  { brand: "MYK Schomburg", speciality: "Cementitious systems, waterproof coatings, membranes" },
  { brand: "Mapei", speciality: "Waterproofing membranes, cementitious coatings, sealants" },
  { brand: "STP Limited", speciality: "Bituminous coatings, membranes, waterproofing compounds" },
  { brand: "Sunanda", speciality: "Roof waterproofing, PU coatings, concrete protection" },
  { brand: "Penetron", speciality: "Crystalline waterproofing, concrete protection" },
  { brand: "MC-Bauchemie", speciality: "Injection waterproofing, concrete repair, membranes" },
  { brand: "CICO", speciality: "Integral waterproofing, coatings, repair chemicals" },
  { brand: "Kryton", speciality: "Integral crystalline concrete waterproofing" },
  { brand: "Perma", speciality: "Waterproof coatings, admixtures, repair solutions" },
];

/** the Fosroc products the document names for each kind of method; `slug` where the product is on RPC's list */
export const FOSROC_BY_METHOD: readonly { method: string; methods: readonly string[]; products: readonly { name: string; slug?: string }[] }[] = [
  {
    method: "Cementitious",
    methods: ["cementitious"],
    products: [
      { name: "Brushbond", slug: "fosroc-brushbond-grey" },
      { name: "Brushbond RFX", slug: "fosroc-brushbond-rfx-grey" },
      { name: "Nitocote CM210", slug: "fosroc-nitocote-cm210-white" },
    ],
  },
  {
    method: "Liquid-applied",
    methods: ["liquid-membrane"],
    products: [{ name: "Brushbond Roofguard", slug: "fosroc-brushbond-roofguard-white" }, { name: "Nitoproof systems" }],
  },
  {
    method: "Integral",
    methods: ["integral", "crystalline"],
    products: [
      { name: "Conplast WL Xtra", slug: "fosroc-conplast-wl-xtra" },
      { name: "Conplast Crystalline", slug: "fosroc-conplast-crystalline" },
    ],
  },
  { method: "Sheet membrane", methods: ["hdpe"], products: [{ name: "Proofex systems" }] },
  { method: "Joint waterproofing", methods: ["waterstops"], products: [{ name: "Supercast SW20", slug: "fosroc-supercast-sw20" }, { name: "Supercast SW30" }] },
];

/** the makers' sites the document gives for product references */
export const REFERENCE_SITES: readonly { name: string; url: string }[] = [
  { name: "fosroc.com", url: "https://www.fosroc.com" },
  { name: "ind.sika.com", url: "https://ind.sika.com" },
  { name: "drfixit.co.in", url: "https://www.drfixit.co.in" },
  { name: "asianpaints.com", url: "https://www.asianpaints.com" },
  { name: "ardexendura.com", url: "https://www.ardexendura.com" },
];

/** the document's recommendation: three groups of brands, compared on more than the name */
export const BRAND_GROUPS: readonly string[] = ["Professional project systems", "Residential waterproofing products", "Specialist waterproofing technologies"];
export const BRAND_ADVICE =
  "Compare options by technical suitability, local availability, project cost and warranty conditions rather than brand name alone.";
