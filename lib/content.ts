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
  descriptor: "Architecture · Engineering · Construction",
  established: "Est. 2012",
  city: "Erode",
} as const;

export const nav = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
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
    summary: "A six-storey apartment block of three-bedroom homes with deep shaded balconies, timber-tone louvres, rooftop solar and a landscaped front court.",
    structuralSystem: "RCC framed structure on isolated footings",
    materials: "Fly-ash brick masonry, cement plaster, aluminium glazing, vitrified tile",
    clientType: "[Private Developer]",
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
    summary: "A G+8 office building with a double-glazed façade, vertical sun fins and a column-free floor plate for flexible tenancies.",
    structuralSystem: "RCC core with flat-slab floors",
    materials: "Double-glazed unitised curtain wall, ACP cladding, granite flooring",
    clientType: "[Commercial Developer]",
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
    summary: "A family home arranged around an open-to-sky courtyard, with sloped clay-tile roofs, teak joinery and a garden verandah.",
    structuralSystem: "Load-bearing RCC frame with sloped RCC roof",
    materials: "Mangalore clay tile, Athangudi tile, teak wood, lime plaster",
    clientType: "[Private Client]",
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
    summary: "A textile processing and warehousing facility with long-span pre-engineered steel sheds, loading bays and rooftop solar.",
    structuralSystem: "Pre-engineered steel buildings on RCC pedestals",
    materials: "Colour-coated roof sheeting, precast compound wall, trimix flooring",
    clientType: "[Industrial Client]",
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
    summary: "Street-level retail with two floors of offices and four floors of apartments above, planned around a shaded central courtyard.",
    structuralSystem: "RCC frame with post-tensioned transfer slab",
    materials: "Exposed concrete, terracotta jaali screens, glazing",
    clientType: "[Joint Development]",
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
    title: "Residential Construction",
    body: "Independent houses, villas and apartment blocks delivered turnkey — from soil test and structural design to handover with every approval in place.",
    image: "/images/projects/kaveri-residences-perundurai-road.jpg",
    deliverables: [
      "Soil investigation & foundation design",
      "RCC frame, masonry & waterproofing",
      "Electrical, plumbing & HVAC services",
      "Flooring, joinery, painting & landscaping",
    ],
    timeline: "8 – 24 months",
    scale: "1,500 – 80,000 sq ft",
  },
  {
    id: "02",
    title: "Commercial Construction",
    body: "Offices, showrooms, hospitals and hotels built for heavy daily use, with façades, services and fit-out coordinated from day one.",
    image: "/images/projects/avinashi-corporate-centre-coimbatore.jpg",
    deliverables: [
      "Flat-slab & long-span RCC structures",
      "Glass façade & ACP cladding systems",
      "Fire safety, lifts & MEP coordination",
      "Shell-and-core or full fit-out delivery",
    ],
    timeline: "12 – 30 months",
    scale: "10,000 – 2,50,000 sq ft",
  },
  {
    id: "03",
    title: "Industrial Construction",
    body: "Factories, warehouses and processing units for SIPCOT and private industrial parks — engineered for load, logistics and fast commissioning.",
    image: "/images/projects/sipcot-textile-unit-perundurai.jpg",
    deliverables: [
      "Pre-engineered steel buildings (PEB)",
      "Heavy-duty trimix & VDF flooring",
      "Machine foundations & pits",
      "Roads, drainage & compound walls",
    ],
    timeline: "6 – 18 months",
    scale: "20,000 – 4,00,000 sq ft",
  },
  {
    id: "04",
    title: "Renovation & Retrofit",
    body: "Structural strengthening, extensions and complete refurbishments of occupied buildings — planned to keep disruption to a minimum.",
    image: "/stages/08-plastering.jpg",
    deliverables: [
      "Structural audit & crack repair",
      "Jacketing, micro-concrete & retrofitting",
      "Terrace waterproofing & re-plastering",
      "Vertical & horizontal extensions",
    ],
    timeline: "2 – 10 months",
    scale: "Single floors to full buildings",
  },
  {
    id: "05",
    title: "Interiors",
    body: "Homes, offices and showrooms fitted out to the same drawings as the building — joinery, ceilings, lighting and finishes under one team.",
    image: "/images/interior-joinery.jpg",
    deliverables: [
      "Modular kitchens & wardrobes",
      "False ceilings & lighting design",
      "Custom joinery & wall panelling",
      "Stone, tile & wooden flooring",
    ],
    timeline: "1 – 6 months",
    scale: "Single rooms to full buildings",
  },
  {
    id: "06",
    title: "Project Management",
    body: "Independent management of cost, programme and quality for owners and developers — one accountable team from approvals to handover.",
    image: "/images/process-01.jpg",
    deliverables: [
      "DTCP / local-body plan approvals",
      "BOQ, tendering & cost control",
      "Programme scheduling & site supervision",
      "Quality testing & handover documents",
    ],
    timeline: "Full project lifecycle",
    scale: "All project sizes",
  },
];

export const process = [
  { id: "01", title: "Planning", body: "Feasibility, site survey and a clear brief — the project is defined before it is drawn.", image: "/images/process-01.jpg" },
  { id: "02", title: "Design", body: "Architecture and engineering resolved together, so what is drawn is what can be built.", image: "/images/process-02.jpg" },
  { id: "03", title: "Foundation", body: "Excavation, reinforcement and pour — the unseen work everything else depends on.", image: "/images/process-03.jpg" },
  { id: "04", title: "Structure", body: "The frame rises: columns, beams and slabs, floor by floor.", image: "/images/process-04.jpg" },
  { id: "05", title: "Finishing", body: "Envelope, services and interiors brought to their final, considered state.", image: "/images/process-05.jpg" },
  { id: "06", title: "Handover", body: "Inspected, documented and delivered — ready to be lived and worked in.", image: "/images/process-06.jpg" },
] as const;

export const principles = [
  { title: "Trust", body: "Open books on cost, programme and site decisions — clients always know where their project stands." },
  { title: "Experience", body: "More than a decade of building across Erode, Coimbatore and Chennai, on tight urban plots and open industrial land." },
  { title: "Craftsmanship", body: "Straight lines, true levels and clean finishes — checked by our own engineers before any handover." },
  { title: "Engineering", body: "Structures designed and built to Indian Standards, with every drawing checked before it reaches site." },
  { title: "Quality", body: "Cube tests, material checks and stage-wise inspections logged for every pour and every floor." },
  { title: "On-time delivery", body: "Disciplined sequencing and weekly reporting so milestones are met without cutting corners." },
] as const;

/** Company story, vision and mission (About page). Review wording before launch. */
export const company = {
  story: [
    "RPC Constructions was founded in Erode in 2012 with a simple idea: a building should be planned with care, engineered with rigour and built to outlast the people who made it.",
    "From our first independent homes we have grown into a design-and-build practice delivering residences, commercial buildings and industrial facilities across Tamil Nadu — with the same engineers following every project from soil test to handover.",
  ],
  vision: "To be Tamil Nadu’s most trusted name in construction — known for buildings that stand for generations and a way of working clients recommend to their families.",
  mission: [
    "Deliver every project safely, on schedule and to the agreed budget.",
    "Build to Indian Standards with tested materials and inspected workmanship.",
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

export const anatomy = [
  { key: "roof", label: "Roof", note: "Waterproofed terrace, solar-ready" },
  { key: "windows", label: "Windows", note: "Aluminium & glass, sealed" },
  { key: "walls", label: "Walls", note: "Fly-ash brick, plastered both sides" },
  { key: "interior", label: "Interior", note: "Services, finishes & joinery" },
  { key: "structure", label: "Structure", note: "RCC columns, beams & slabs" },
  { key: "foundation", label: "Foundation", note: "Footings sized from the soil test" },
] as const;

export const manifesto =
  "A building is a promise made in concrete and kept for generations. We plan it with care, engineer it with rigour and build it to outlast us.";

