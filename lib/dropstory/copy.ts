/**
 * Copy for the drop story and the methods index. Method names and their
 * application areas are RPC's own list; the explanations are general
 * descriptions of how each method works, not project claims.
 */

export const STORY = {
  hero: {
    kicker: "RPC Constructions, Erode",
    title: "We keep water out.",
    body: "Water gets into a building in four places: the terrace, the bathroom, the basement and the tank. Follow one raindrop down through a house to see the method we use at each.",
    cue: "Scroll to follow the drop",
  },
  stages: [
    {
      key: "s1",
      place: "Terrace",
      method: "Polyurethane (PU) waterproofing",
      short: "PU",
      body: "A primer, then a seamless, elastic PU membrane across the whole terrace and up every parapet wall, finished with a UV-resistant topcoat. There are no joints for rain to open, so it can only run to the outlet.",
      used: "roofs, terraces and podium decks",
    },
    {
      key: "s2",
      place: "Bathroom",
      method: "Cementitious waterproofing",
      short: "Cementitious",
      body: "Two brushed coats over the slab and up the walls, under the screed and tiles. Water that gets through the grout stops on the coating and runs to the floor drain instead of into the slab below.",
      used: "bathrooms, toilets, water tanks and basements",
    },
    {
      key: "s3",
      place: "Basement",
      method: "HDPE sheet membrane",
      short: "HDPE sheet",
      body: "When the water table rises, groundwater presses on the basement from outside. A tough HDPE sheet wraps the outer walls and runs under the raft, with a protection board against the soil, so the water never reaches the concrete.",
      used: "basements, foundations and underground structures",
    },
    {
      key: "s4",
      place: "Sump",
      method: "Crystalline waterproofing",
      short: "Crystalline",
      body: "Crystalline treatment reacts with moisture in the concrete and grows crystals inside its pores, sealing the tank from within. If a hairline crack lets water in later, the crystals grow again and close it.",
      used: "concrete tanks, basements and water-retaining structures",
    },
  ],
  final: {
    title: "RPC Constructions",
    body: "Those are four of the twelve waterproofing methods we use. We pick one for each surface by its exposure and water pressure, and plan it into the drawings before work starts.",
    primary: { label: "See all 12 methods", href: "#methods" },
    secondary: { label: "Book a free inspection", href: "/contact#enquiry" },
  },
} as const;

export interface Method {
  name: string;
  areas: string;
  /** which chapter of the story shows it, if any */
  story?: string;
}
export interface MethodGroup {
  key: "roof" | "wet" | "below" | "concrete" | "joints";
  title: string;
  note: string;
  methods: Method[];
}

export const METHOD_GROUPS: MethodGroup[] = [
  {
    key: "roof",
    title: "Roofs and terraces",
    note: "Sun, rain and movement. Membranes that stay elastic and resist UV.",
    methods: [
      { name: "Polyurethane (PU) waterproofing", areas: "Roofs, terraces, podium decks", story: "Terrace" },
      { name: "Liquid membrane waterproofing", areas: "Terraces, roofs, balconies" },
      { name: "APP / SBS torch-on membrane", areas: "Flat roofs, terraces, podiums" },
      { name: "Acrylic elastomeric waterproofing", areas: "Exposed roofs, terraces, external surfaces" },
      { name: "Polyurea waterproofing", areas: "Roofs, podiums, industrial structures" },
    ],
  },
  {
    key: "wet",
    title: "Bathrooms and wet areas",
    note: "Water every day, under tiles. Coatings that bond to the slab.",
    methods: [{ name: "Cementitious waterproofing", areas: "Bathrooms, toilets, water tanks, basements", story: "Bathroom" }],
  },
  {
    key: "below",
    title: "Below ground",
    note: "Constant pressure from soil and groundwater. Barriers on the outside face.",
    methods: [
      { name: "HDPE sheet membrane waterproofing", areas: "Basements, foundations, underground structures", story: "Basement" },
      { name: "Bituminous coating waterproofing", areas: "Foundations, retaining walls, basements" },
    ],
  },
  {
    key: "concrete",
    title: "Inside the concrete",
    note: "The concrete itself made water-resistant, for tanks and slabs.",
    methods: [
      { name: "Crystalline waterproofing", areas: "Concrete tanks, basements, water-retaining structures", story: "Sump" },
      { name: "Integral waterproofing admixtures", areas: "Concrete slabs, foundations, water-retaining concrete" },
    ],
  },
  {
    key: "joints",
    title: "Joints and cracks",
    note: "Where pours meet and where leaks start. Sealed or injected.",
    methods: [
      { name: "Joint waterproofing / waterstops", areas: "Construction joints, expansion joints, basements" },
      { name: "Injection grouting (PU / epoxy)", areas: "Concrete cracks, leakage points, construction joints" },
    ],
  },
];
