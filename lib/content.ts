/**
 * RPC Constructions — single source of truth for site copy & data.
 *
 * Anything wrapped in square brackets — "[ … ]" — or marked PLACEHOLDER is
 * NOT real RPC information. Replace it with approved brand copy / facts
 * before launch. No RPC-specific facts have been invented here.
 */

export const brand = {
  name: "RPC Constructions",
  short: "RPC",
  taglineA: "Building",
  taglineB: "what lasts.",
  descriptor: "Construction · Waterproofing · Land to Roof",
  established: "Est. 2012",
  city: "Erode",
} as const;

export const nav = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
] as const;

export const contact = {
  email: "contact@rpcconstructions.com",
  phone: "+91 94428 95907",
  address: "142 Perundurai Road, Erode, Tamil Nadu 638011, India",
  hours: "Mon – Sat · 08:30 – 18:30 IST",
  /** PLACEHOLDER — replace "#" with the real profile URLs before launch */
  socials: [
    { label: "LinkedIn", href: "#" },
    { label: "Instagram", href: "#" },
    { label: "Facebook", href: "#" },
    { label: "WhatsApp", href: "https://wa.me/919442895907" },
  ],
  whatsapp: "https://wa.me/919442895907",
  mapQuery: "142 Perundurai Road, Erode, Tamil Nadu 638011",
  geo: { lat: 11.341, lng: 77.7172 },
  regions: ["Erode", "Coimbatore", "Tiruppur", "Salem", "Chennai"],
} as const;



/** The seven chapters of the hero film. Narrative copy, no company claims. */
export const heroStages = [
  { id: "01", key: "site", title: "The Site", line: "Every building begins as open ground — surveyed, understood, respected." },
  { id: "02", key: "blueprint", title: "Blueprint", line: "Lines before load. Every decision drawn, measured and resolved on paper first." },
  { id: "03", key: "foundation", title: "Foundation", line: "What no one will ever see carries everything they will." },
  { id: "04", key: "structure", title: "Structure", line: "Column, beam, slab — rising floor by floor with engineered precision." },
  { id: "05", key: "shell", title: "Envelope", line: "Walls close, glass is set, materials arrive at their final state." },
  { id: "06", key: "completion", title: "Completion", line: "Landscape, light and the quiet details that make a place feel finished." },
  { id: "07", key: "reveal", title: "Handover", line: "A project, born." },
] as const;

export type ProjectStatus = "Completed" | "Under construction" | "In design";

export interface Project {
  slug: string;
  name: string;
  location: string;
  type: string;
  area: string;
  year: string;
  status: ProjectStatus | string;
  image: string;
  summary: string;
  structuralSystem?: string;
  materials?: string;
  clientType?: string;
  /** the waterproofing system built into the project, land to roof */
  waterproofing?: string;
}

/**
 * SAMPLE PROJECTS — PLACEHOLDER. These are illustrative Tamil Nadu projects
 * written to show the layout; they are NOT real RPC commissions. Replace the
 * names, figures and photos with RPC's actual portfolio before launch.
 */
export const projects: Project[] = [
  {
    slug: "kaveri-residences",
    name: "Kaveri Residences",
    location: "Perundurai Road, Erode",
    type: "Residential",
    area: "[42,000 sq ft]",
    year: "[2024]",
    status: "Completed",
    image: "/images/projects/kaveri-residences-perundurai-road.jpg",
    summary: "A six-storey apartment block of three-bedroom homes with deep shaded balconies, rooftop solar and a landscaped front court — waterproofed from the raft to the terrace.",
    structuralSystem: "RCC framed structure on isolated footings",
    materials: "Fly-ash brick masonry, cement plaster, aluminium glazing, vitrified tile",
    clientType: "[Private Developer]",
    waterproofing: "HDPE membrane under the raft · DPC · PU terrace membrane · pond-tested wet areas",
  },
  {
    slug: "avinashi-corporate-centre",
    name: "Avinashi Corporate Centre",
    location: "Avinashi Road, Coimbatore",
    type: "Commercial",
    area: "[1,10,000 sq ft]",
    year: "[2023]",
    status: "Completed",
    image: "/images/projects/avinashi-corporate-centre-coimbatore.jpg",
    summary: "A G+8 office building with a double-glazed façade, a fully waterproofed basement and a column-free floor plate for flexible tenancies.",
    structuralSystem: "RCC core with flat-slab floors",
    materials: "Double-glazed unitised curtain wall, ACP cladding, granite flooring",
    clientType: "[Commercial Developer]",
    waterproofing: "Crystalline basement with PVC waterstops · PU roof membrane · sealed curtain-wall joints",
  },
  {
    slug: "thindal-courtyard-villa",
    name: "Thindal Courtyard Villa",
    location: "Thindal, Erode",
    type: "Villa",
    area: "[6,800 sq ft]",
    year: "[2024]",
    status: "Completed",
    image: "/images/projects/thindal-courtyard-villa-erode.jpg",
    summary: "A family home arranged around an open-to-sky courtyard, with sloped clay-tile roofs laid over a waterproof membrane, teak joinery and a garden verandah.",
    structuralSystem: "Load-bearing RCC frame with sloped RCC roof",
    materials: "Mangalore clay tile, Athangudi tile, teak wood, lime plaster",
    clientType: "[Private Client]",
    waterproofing: "Anti-termite + DPC plinth · membrane under clay tiles · 2-coat bathrooms, epoxy grout",
  },
  {
    slug: "sipcot-textile-processing-unit",
    name: "SIPCOT Textile Processing Unit",
    location: "SIPCOT Industrial Park, Perundurai",
    type: "Industrial",
    area: "[2,40,000 sq ft]",
    year: "[2025]",
    status: "Under construction",
    image: "/images/projects/sipcot-textile-unit-perundurai.jpg",
    summary: "A textile processing and warehousing facility with long-span steel sheds, leak-proof roofing, waterproofed trimix floors and rooftop solar.",
    structuralSystem: "Pre-engineered steel buildings on RCC pedestals",
    materials: "Colour-coated roof sheeting, precast compound wall, trimix flooring",
    clientType: "[Industrial Client]",
    waterproofing: "Integral-admixture trimix floors · sealed roof-sheet laps · storm-water drainage",
  },
  {
    slug: "anna-nagar-mixed-use",
    name: "Anna Nagar Mixed-Use",
    location: "Anna Nagar, Chennai",
    type: "Mixed-use",
    area: "[88,000 sq ft]",
    year: "[2026]",
    status: "In design",
    image: "/images/projects/anna-nagar-mixed-use-chennai.jpg",
    summary: "Street-level retail with offices and apartments above, over a waterproofed basement and planned around a shaded central courtyard.",
    structuralSystem: "RCC frame with post-tensioned transfer slab",
    materials: "Exposed concrete, terracotta jaali screens, glazing",
    clientType: "[Joint Development]",
    waterproofing: "Crystalline basement · PU podium & terrace · elastomeric façade coating",
  },
];

export interface ServiceItem {
  id: string;
  title: string;
  body: string;
  image: string;
  deliverables: string[];
  timeline: string;
  scale: string;
}

export const services: ServiceItem[] = [
  {
    id: "01",
    title: "Waterproofing",
    body: "Six stages of protection built into the construction itself — from the soil under the raft to the roof above — plus leak repair for existing buildings.",
    image: "/film/wp-final.jpg",
    deliverables: [
      "Anti-termite + HDPE membrane under the raft",
      "Crystalline basements, PVC waterstops & DPC",
      "Pond-tested bathrooms, kitchens & tanks",
      "PU roof membrane & elastomeric façade coating",
    ],
    timeline: "Every stage of the build",
    scale: "Homes to industrial sheds",
  },
  {
    id: "02",
    title: "Residential Construction",
    body: "Independent houses, villas and apartment blocks delivered turnkey — from soil test to handover, waterproofed from land to roof.",
    image: "/images/projects/kaveri-residences-perundurai-road.jpg",
    deliverables: [
      "Soil investigation & foundation design",
      "RCC frame & masonry with land-to-roof waterproofing",
      "Electrical, plumbing & HVAC services",
      "Flooring, joinery, painting & landscaping",
    ],
    timeline: "8 – 24 months",
    scale: "1,500 – 80,000 sq ft",
  },
  {
    id: "03",
    title: "Commercial Construction",
    body: "Offices, showrooms, hospitals and hotels built for heavy daily use — waterproofed basements, sealed façades and services coordinated from day one.",
    image: "/images/projects/avinashi-corporate-centre-coimbatore.jpg",
    deliverables: [
      "Flat-slab & long-span RCC structures",
      "Basement & podium waterproofing",
      "Fire safety, lifts & MEP coordination",
      "Shell-and-core or full fit-out delivery",
    ],
    timeline: "12 – 30 months",
    scale: "10,000 – 2,50,000 sq ft",
  },
  {
    id: "04",
    title: "Industrial Construction",
    body: "Factories, warehouses and processing units for SIPCOT and private industrial parks — engineered for load, logistics and fast commissioning.",
    image: "/images/projects/sipcot-textile-unit-perundurai.jpg",
    deliverables: [
      "Pre-engineered steel buildings (PEB)",
      "Heavy-duty trimix & VDF flooring",
      "Machine foundations & pits",
      "Leak-proof roofs, drainage & compound walls",
    ],
    timeline: "6 – 18 months",
    scale: "20,000 – 4,00,000 sq ft",
  },
  {
    id: "05",
    title: "Renovation & Leak Repair",
    body: "Leakage and dampness fixed at the source, structural strengthening and extensions of occupied buildings — planned to keep disruption to a minimum.",
    image: "/stages/08-plastering.jpg",
    deliverables: [
      "Leak & dampness survey, crack repair",
      "Jacketing, micro-concrete & retrofitting",
      "Terrace waterproofing & re-plastering",
      "Vertical & horizontal extensions",
    ],
    timeline: "2 – 10 months",
    scale: "Single floors to full buildings",
  },
  {
    id: "06",
    title: "Interiors",
    body: "Homes, offices and showrooms fitted out to the same drawings as the building — joinery, ceilings, lighting and finishes under one team.",
    image: "/images/interior-joinery.jpg",
    deliverables: [
      "Modular kitchens & wardrobes",
      "False ceilings & lighting design",
      "Custom joinery & wall panelling",
      "Waterproofed wet areas, stone & tile flooring",
    ],
    timeline: "1 – 6 months",
    scale: "Single rooms to full buildings",
  },
  {
    id: "07",
    title: "Project Management",
    body: "Independent management of cost, programme and quality for owners and developers — one accountable team from approvals to handover.",
    image: "/images/process-01.jpg",
    deliverables: [
      "DTCP / local-body plan approvals",
      "BOQ, tendering & cost control",
      "Programme scheduling & site supervision",
      "Pond tests, quality checks & handover documents",
    ],
    timeline: "Full project lifecycle",
    scale: "All project sizes",
  },
];

export const process = [
  { id: "01", title: "Planning", body: "Feasibility, soil and water-table survey and a clear brief — waterproofing is planned before anything is drawn.", image: "/images/process-01.jpg" },
  { id: "02", title: "Design", body: "Architecture and engineering resolved together, with every waterproofing layer detailed on the drawings.", image: "/images/process-02.jpg" },
  { id: "03", title: "Foundation", body: "Excavation, anti-termite, HDPE membrane and crystalline concrete — sealed before the pour.", image: "/images/process-03.jpg" },
  { id: "04", title: "Structure", body: "Columns, beams and slabs rise floor by floor — every pour with integral waterproofing.", image: "/images/process-04.jpg" },
  { id: "05", title: "Finishing", body: "Wet areas pond-tested, PU roof membrane and façade coating — then interiors.", image: "/images/process-05.jpg" },
  { id: "06", title: "Handover", body: "Inspected, leak-tested and documented — delivered dry and ready to live in.", image: "/images/process-06.jpg" },
] as const;

export const principles = [
  { title: "Trust", body: "Open books on cost, programme and site decisions — clients always know where their project stands." },
  { title: "Experience", body: "More than a decade of building across Erode, Coimbatore and Chennai, on tight urban plots and open industrial land." },
  { title: "Craftsmanship", body: "Straight lines, true levels and clean finishes — checked by our own engineers before any handover." },
  { title: "Engineering", body: "Structures designed and built to Indian Standards, with every drawing checked before it reaches site." },
  { title: "Quality", body: "Cube tests, pond tests and stage-wise inspections logged for every pour, every floor and every wet area." },
  { title: "On-time delivery", body: "Disciplined sequencing and weekly reporting so milestones are met without cutting corners." },
] as const;

/** Company story, vision and mission (About page). Review wording before launch. */
export const company = {
  story: [
    "RPC Constructions was founded in Erode in 2012 with a simple idea: a building should be planned with care, engineered with rigour and built to outlast the people who made it.",
    "From our first independent homes we have grown into a design-and-build practice delivering residences, commercial buildings and industrial facilities across Tamil Nadu — with the same engineers following every project from soil test to handover.",
    "In a monsoon climate, most building failures start with water. So we waterproof every project in six stages — from the soil under the raft to the roof above — as part of the construction, not as an afterthought.",
  ],
  vision: "To be Tamil Nadu’s most trusted name in construction — known for buildings that stand dry for generations and a way of working clients recommend to their families.",
  mission: [
    "Deliver every project safely, on schedule and to the agreed budget.",
    "Build to Indian Standards with tested materials and inspected workmanship.",
    "Waterproof every building from land to roof, and leak-test it before handover.",
    "Keep clients informed with transparent costs and weekly progress reporting.",
    "Invest in our engineers, site teams and the communities we build in.",
  ],
} as const;

/**
 * PLACEHOLDER — founder / managing director. Replace the name, message and
 * portrait (public/images/founder.jpg) with the real details before launch.
 */
export const founder = {
  name: "[Founder Name]",
  role: "Founder & Managing Director",
  qualifications: "[B.E. Civil Engineering]",
  image: "" as string, // e.g. "/images/founder.jpg"
  message: [
    "When we started RPC, we promised every client one thing — that we would build their project as carefully as we would build our own home.",
    "That promise still guides every drawing we check and every slab we pour. Our engineers stay on site, our costs stay open, and our work carries our name for generations.",
  ],
} as const;

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  qualifications?: string;
}

/** Leadership team. PLACEHOLDER — replace with the real team before launch. */
export const team: readonly TeamMember[] = [
  { name: "[Name]", role: "Head of Engineering", qualifications: "[B.E. Civil / M.E. Structural]", bio: "Leads structural design review, drawings and quality control across all sites." },
  { name: "[Name]", role: "Head of Projects", qualifications: "[B.E. Civil]", bio: "Runs site planning, programme and contractor coordination from start to handover." },
  { name: "[Name]", role: "Head of Design", qualifications: "[B.Arch]", bio: "Guides architecture, interiors and material selection with every client." },
] as const;

/** Registrations. PLACEHOLDER — keep only the ones RPC actually holds. */
export const accreditations = [
  { code: "GST", title: "GST Registered", detail: "[GSTIN to be added]" },
  { code: "MSME", title: "Udyam Registered", detail: "[Udyam number to be added]" },
  { code: "PWD", title: "Registered Contractor", detail: "[Class & registration number to be added]" },
  { code: "ISO", title: "ISO 9001", detail: "[Only if certified — otherwise remove]" },
] as const;

export const technicalCapabilities = [
  {
    title: "Soil investigation & foundation design",
    description: "Bore-hole data and plate-load tests drive the choice of isolated, raft or pile foundations for each site.",
  },
  {
    title: "Structural design to Indian Standards",
    description: "RCC and steel structures designed to IS 456, IS 800 and IS 1893 (seismic), and checked independently.",
  },
  {
    title: "3D coordination before construction",
    description: "Architecture, structure and services modelled together, so clashes are solved on screen — not on site.",
  },
  {
    title: "Tested materials, inspected work",
    description: "Cube tests, steel and cement certificates and stage-wise inspection records for every floor.",
  },
] as const;

export const engagementModels = [
  {
    model: "Design & Build (Turnkey)",
    description: "One contract covering architecture, engineering, approvals and construction — a single team accountable for everything.",
    benefit: "Fixed scope, single point of responsibility.",
  },
  {
    model: "Construction Only",
    description: "You bring the approved drawings; we build them with our site teams, materials and quality systems.",
    benefit: "Competitive pricing on a clear BOQ.",
  },
  {
    model: "Project Management",
    description: "RPC manages the contractors, programme and cost on your behalf, reporting directly to you.",
    benefit: "Independent oversight and full cost transparency.",
  },
] as const;

export const departments = [
  { name: "New projects & tenders", email: "projects@rpcconstructions.com", phone: "+91 94428 95907" },
  { name: "Vendors & suppliers", email: "purchase@rpcconstructions.com", phone: "+91 94428 95907" },
  { name: "Careers", email: "careers@rpcconstructions.com", phone: "+91 94428 95907" },
] as const;

export const faqs = [
  {
    question: "Is waterproofing included in every RPC project?",
    answer: "Yes. Every building gets six stages of waterproofing as part of the construction — anti-termite treatment and an HDPE membrane under the raft, crystalline concrete and waterstops in the foundation, a damp-proof course at plinth, integral admixture in every pour, pond-tested wet areas, and a PU membrane with elastomeric coating on the roof and façade.",
  },
  {
    question: "Can you fix leakage in an existing building?",
    answer: "Yes. We survey the leak or dampness, trace it to the source and repair it — terrace, bathrooms, basements, water tanks or external walls — with the same systems we use in new construction.",
  },
  {
    question: "When is the optimal time to engage RPC?",
    answer: "Ideally during early feasibility or conceptual design. Early involvement allows our engineering team to provide buildability advice, value-engineer structural systems, and establish accurate budgets before municipal plan sanctions.",
  },
  {
    question: "Do you oversee planning permissions and building control?",
    answer: "Yes. Our team manages all statutory approvals including DTCP / municipal corporation planning applications, structural stability certificates, utility connections, and final completion sign-offs.",
  },
  {
    question: "What scale of commissions do you undertake?",
    answer: "We deliver bespoke private residences, commercial complexes, and industrial facilities. We are structured to give every commission dedicated director-level attention.",
  },
  {
    question: "Can we visit current RPC construction sites?",
    answer: "Yes. Prospective clients are welcomed to inspect our active sites and completed projects in Erode, Coimbatore, Chennai, and surrounding regions by appointment to witness our craftsmanship and site standards firsthand.",
  },
] as const;

/** value: a number animates (count-up). PLACEHOLDER figures — confirm before launch. */
export const stats: { value: number | string; suffix: string; label: string }[] = [
  { value: 148, suffix: "+", label: "Projects" },
  { value: 14, suffix: "+", label: "Years" },
  { value: 92, suffix: "+", label: "Clients" },
  { value: 14, suffix: "", label: "Cities" },
];

/** Anatomy section: each system, the waterproofing technique used on it, and how it is done. */
export const anatomy = [
  { key: "roof", label: "Roof", note: "PU membrane + heat-reflective coat", technique: "PU liquid membrane", steps: ["Slab cleaned & primed", "2 coats of PU, turned up the parapet", "White reflective coat keeps it cool"], image: "/images/anatomy-wp-roof.jpg", alt: "Worker rolling a PU waterproofing membrane on a terrace, with a white heat-reflective top coat" },
  { key: "windows", label: "Windows", note: "Sealed frames, drip grooves, silicone joints", technique: "Sealed frames & drip grooves", steps: ["Gap round the frame sealed with silicone", "Sill sloped outward", "Drip groove under the sunshade"], image: "/images/anatomy-wp-windows.jpg", alt: "Worker sealing an aluminium window frame with silicone under a sunshade with a drip groove, above a sloped granite sill" },
  { key: "walls", label: "Walls", note: "Waterproof plaster + elastomeric façade paint", technique: "Waterproof plaster + elastomeric paint", steps: ["Brick wall", "Plaster with waterproof admixture", "Elastomeric paint bridges hairline cracks"], image: "/images/anatomy-wp-walls.jpg", alt: "Cutaway of an external wall: brick, waterproof plaster and elastomeric paint being applied" },
  { key: "interior", label: "Wet areas", note: "2-coat wet areas, pond-tested, epoxy grout", technique: "2-coat coating + pond test", steps: ["Pipe openings sealed with collars", "2 coats on floor & 300 mm up walls", "Flooded 48 h, then tiled with epoxy grout"], image: "/images/anatomy-wp-interior.jpg", alt: "Bathroom coated with grey waterproofing and flooded for a pond test, next to a finished tiled area" },
  { key: "structure", label: "Structure", note: "Integral waterproofing admixture in every pour", technique: "Integral waterproofing admixture", steps: ["Admixture dosed into every batch", "Dense, low-permeability concrete", "Vibrated & cured — no path for water"], image: "/images/anatomy-wp-structure.jpg", alt: "Worker adding waterproofing admixture to the concrete mixer during a slab pour" },
  { key: "foundation", label: "Foundation", note: "Anti-termite, HDPE membrane, crystalline + DPC", technique: "Anti-termite + HDPE membrane", steps: ["Soil treated with anti-termite", "HDPE sheet with welded laps under the raft", "Crystalline coat & waterstops at joints"], image: "/images/anatomy-wp-foundation.jpg", alt: "Anti-termite spraying and a black HDPE membrane laid under the raft reinforcement" },
] as const;

export const manifesto =
  "A building is a promise made in concrete and kept dry for generations. We plan it with care, waterproof it from land to roof and build it to outlast us.";


/**
 * Homepage hero — "Land to Roof" waterproofing story. 8 scroll steps:
 * intro, the six waterproofing stages, finale. One film clip per step.
 */
export type WaterproofStep = {
  key: string;
  rail: string;
  eyebrow: string;
  title: string;
  titleEm?: string;
  technique?: string;
  process?: readonly string[];
  body?: string;
};

export const waterproofSteps: readonly WaterproofStep[] = [
  {
    key: "intro",
    rail: "Site",
    eyebrow: "Waterproofing · Land to Roof",
    title: "Waterproofed from",
    titleEm: "land to roof.",
    body: "Six stages of protection built into the construction itself — not patched on later. Scroll to see how.",
  },
  {
    key: "land",
    rail: "Excavation",
    eyebrow: "Land & excavation",
    title: "Protection starts before the first brick",
    technique: "Anti-termite treatment + HDPE membrane under the raft",
    process: ["Excavate & compact the base", "PCC levelling course", "Anti-termite soil treatment", "HDPE sheets — sealed 100 mm overlaps, turned up the sides"],
  },
  {
    key: "foundation",
    rail: "Foundation",
    eyebrow: "Foundation & basement",
    title: "Blocks groundwater for good",
    technique: "Crystalline waterproofing + PVC waterstops at joints",
    process: ["PVC waterstops at every construction joint", "Raft & walls poured with crystalline admixture", "Crystalline slurry coat on exposed faces", "Protected backfill against basement walls"],
  },
  {
    key: "plinth",
    rail: "Plinth",
    eyebrow: "Plinth",
    title: "Stops rising damp at ground level",
    technique: "DPC — Damp Proof Course",
    process: ["Level & clean the plinth beam top", "40 mm DPC concrete with waterproofing compound", "Bitumen coat over the DPC", "Cure fully before masonry starts"],
  },
  {
    key: "structure",
    rail: "Structure",
    eyebrow: "Walls & slabs",
    title: "Waterproofing built into the structure",
    technique: "Integral waterproofing admixture in concrete & plaster",
    process: ["Admixture dosed at batching", "Dense, low-permeability columns, beams & slabs", "Waterproof plaster mix on walls", "Controlled curing for crack-free concrete"],
  },
  {
    key: "wet",
    rail: "Wet areas",
    eyebrow: "Bathrooms, kitchen & tanks",
    title: "Leak-free wet areas",
    technique: "2-component cementitious coating + epoxy grout",
    process: ["Seal pipe penetrations & round the corners", "2 coats — 300 mm up walls, 1.8 m in showers", "24–48 h pond test before tiling", "Epoxy-grouted tiles · tanks & sump coated inside"],
  },
  {
    key: "roof",
    rail: "Roof & façade",
    eyebrow: "Terrace & exterior",
    title: "The final shield against rain and sun",
    technique: "PU liquid membrane on the roof + elastomeric façade coating",
    process: ["Prime, reinforce cracks & parapet corners", "2-coat PU membrane with parapet upturn", "Heat-reflective white top coat", "Crack-bridging elastomeric paint on the façade"],
  },
  {
    key: "finale",
    rail: "Monsoon",
    eyebrow: "Monsoon-proof",
    title: "Built to stay",
    titleEm: "dry.",
    body: "Six layers of protection, one accountable team. Get a stage-wise waterproofing plan for your site.",
  },
];
