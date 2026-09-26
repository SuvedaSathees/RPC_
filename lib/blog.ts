/**
 * Blog — practical notes from RPC's engineers for people planning to build
 * in Tamil Nadu. Posts are plain data so they can later move to a CMS
 * without touching the pages.
 *
 * Figures in posts are indicative guidance, not quotes — every site differs.
 */

export interface BlogSection {
  heading?: string;
  paragraphs?: string[];
  list?: string[];
  tip?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: "Planning" | "Engineering" | "Materials" | "Industrial" | "Maintenance";
  date: string; // ISO
  readMinutes: number;
  cover: string;
  coverAlt: string;
  author: string;
  sections: BlogSection[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "questions-to-ask-before-hiring-a-building-contractor",
    title: "10 questions to ask before hiring a building contractor",
    excerpt:
      "The right questions at the first meeting save months of stress later. Here is the checklist our engineers would use if they were the client.",
    category: "Planning",
    date: "2026-09-18",
    readMinutes: 6,
    cover: "/images/projects/kaveri-residences-perundurai-road.jpg",
    coverAlt: "Completed apartment building by RPC Constructions on Perundurai Road, Erode",
    author: "RPC Engineering Team",
    sections: [
      {
        paragraphs: [
          "Choosing a contractor is the single decision that shapes cost, quality and your peace of mind for the next year or more. A polished brochure tells you very little — a short, honest conversation tells you a lot.",
          "Take this list to your first meeting. A good contractor will be glad you asked.",
        ],
      },
      {
        heading: "Before the drawings",
        list: [
          "Who will be my single point of contact, and will the engineer who plans the job also visit the site?",
          "Can I visit a project you have completed — and one that is under construction right now?",
          "Do you do soil investigation before designing the foundation?",
          "Who prepares the structural design, and is it checked against the relevant Indian Standard codes?",
        ],
      },
      {
        heading: "On cost and contract",
        list: [
          "Is the quote itemised, with the brand and grade of cement, steel and fittings named?",
          "What is included — approvals, electrical, plumbing, compound wall, sump, painting?",
          "How are variations priced if I change something midway?",
          "What is the payment schedule, and is it linked to finished stages rather than dates?",
        ],
      },
      {
        heading: "On site and after handover",
        list: [
          "How often will I get progress updates, and in what form — photos, site visits, a written report?",
          "What warranty do you give on structure and waterproofing, and who do I call if something goes wrong?",
        ],
        tip: "Ask for everything important in writing. A clear scope document protects both you and the contractor.",
      },
    ],
  },
  {
    slug: "planning-your-house-construction-budget-in-erode",
    title: "Planning your house construction budget in Erode",
    excerpt:
      "What actually drives the cost of a new home — and how to set a realistic budget before you meet an architect or contractor.",
    category: "Planning",
    date: "2026-09-10",
    readMinutes: 7,
    cover: "/images/projects/thindal-courtyard-villa-erode.jpg",
    coverAlt: "Two-storey villa with clay-tile roof in Thindal, Erode",
    author: "RPC Engineering Team",
    sections: [
      {
        paragraphs: [
          "Almost every enquiry we receive starts with the same question: how much will it cost? The honest answer is that the built-up area is only the starting point. Specification, soil, design and site conditions move the number far more than most people expect.",
        ],
      },
      {
        heading: "The five things that move your budget most",
        list: [
          "Built-up area and number of floors — the obvious one, but plan for balconies, staircase and headroom too.",
          "Foundation — weak or expansive soil can call for deeper footings or a raft, which changes the structural cost.",
          "Specification level — flooring, windows, sanitaryware and electrical fittings can vary several times in price.",
          "Design complexity — cantilevers, large spans and double-height spaces need more steel and formwork.",
          "Site access and services — narrow roads, water availability and power supply affect time and labour.",
        ],
      },
      {
        heading: "How to set a realistic budget",
        paragraphs: [
          "Start with the rooms you need rather than a square-foot figure you have heard from a friend. Then decide your specification level early — it is the biggest lever you control.",
          "Keep a contingency of around 8–10% for changes and unknowns, and budget separately for approvals, the compound wall, sump and landscaping, which are often left out of headline rates.",
        ],
        tip: "Ask for an itemised estimate. Two quotes with the same total can hide very different materials.",
      },
    ],
  },
  {
    slug: "choosing-the-right-foundation-for-your-site",
    title: "Choosing the right foundation for your site",
    excerpt:
      "Isolated footing, combined footing or raft? Why the answer starts with a soil test — and what it means for your building.",
    category: "Engineering",
    date: "2026-08-28",
    readMinutes: 5,
    cover: "/stages/03-foundation.jpg",
    coverAlt: "Foundation footings and reinforcement being prepared on a construction site",
    author: "RPC Engineering Team",
    sections: [
      {
        paragraphs: [
          "The foundation is the part of your building no one will ever see — and the part everything else depends on. Getting it right is not about using more concrete; it is about matching the foundation to the ground.",
        ],
      },
      {
        heading: "Start with a soil investigation",
        paragraphs: [
          "A soil test tells the structural engineer how much load the ground can safely carry, how deep firm strata lies and whether the soil swells or shrinks with moisture. Without it, the foundation is a guess.",
        ],
      },
      {
        heading: "Common foundation types",
        list: [
          "Isolated footings — a pad under each column; economical on firm, uniform soil.",
          "Combined footings — used when columns are close together or near a boundary.",
          "Raft foundation — one continuous slab under the building; useful on weak or variable soil.",
          "Pile foundations — for heavy loads or where firm strata is deep below the surface.",
        ],
      },
      {
        heading: "What we check on site",
        list: [
          "Excavation depth and bearing surface before any concrete is placed",
          "Reinforcement size, spacing and cover against the drawings",
          "Concrete grade, slump and curing — footings need proper curing too",
        ],
        tip: "Never skip the soil test to save money. It costs a small fraction of the foundation it protects.",
      },
    ],
  },
  {
    slug: "rcc-frame-vs-pre-engineered-steel-for-factories",
    title: "RCC frame or pre-engineered steel for your factory?",
    excerpt:
      "Both work. The right choice depends on span, speed, crane loads and how you plan to expand. A practical comparison for industrial owners.",
    category: "Industrial",
    date: "2026-08-14",
    readMinutes: 6,
    cover: "/images/projects/sipcot-textile-unit-perundurai.jpg",
    coverAlt: "Pre-engineered steel factory building under construction",
    author: "RPC Engineering Team",
    sections: [
      {
        paragraphs: [
          "For warehouses, textile units and processing plants, the structural system is one of the first decisions — and it affects cost, programme and how easily the building can grow.",
        ],
      },
      {
        heading: "When pre-engineered steel (PEB) makes sense",
        list: [
          "Large column-free spans for machinery layout or storage",
          "Fast programmes — frames are fabricated off-site while foundations are built",
          "Future expansion — end walls can be designed to extend",
          "Lighter structure, which can reduce foundation sizes",
        ],
      },
      {
        heading: "When an RCC frame makes sense",
        list: [
          "Multi-storey blocks, offices and amenity buildings",
          "Heavy floor loads on upper levels",
          "Better inherent fire resistance and thermal mass",
          "Where local labour and materials make concrete more economical",
        ],
      },
      {
        heading: "Often the answer is both",
        paragraphs: [
          "Many of our industrial projects combine a PEB production shed with an RCC administrative and utility block. Deciding early — with the process layout in hand — avoids costly redesign later.",
        ],
        tip: "Share your machinery layout and any crane requirements before structural design begins.",
      },
    ],
  },
  {
    slug: "waterproofing-before-the-monsoon",
    title: "Waterproofing checklist before the monsoon",
    excerpt:
      "Most leaks start at a few predictable places. Here is where to look — and what to fix — before the rains arrive.",
    category: "Maintenance",
    date: "2026-07-30",
    readMinutes: 4,
    cover: "/stages/08-plastering.jpg",
    coverAlt: "Building exterior being plastered and finished",
    author: "RPC Engineering Team",
    sections: [
      {
        paragraphs: [
          "Water always finds the weakest joint. A short inspection before the monsoon can save repainting, damp walls and damaged interiors.",
        ],
      },
      {
        heading: "Walk the roof",
        list: [
          "Clear rainwater outlets and check the slope drains towards them",
          "Look for cracks in the terrace screed and parapet junctions",
          "Check the waterproofing layer around water tanks and solar stands",
        ],
      },
      {
        heading: "Check the walls and openings",
        list: [
          "Hairline cracks in external plaster, especially near columns and beams",
          "Sealant around window frames and AC pipe openings",
          "Sunshade and chajja tops that hold water",
        ],
      },
      {
        heading: "Inside the building",
        list: [
          "Bathroom floors and wall junctions — the most common source of damp",
          "Kitchen sink and utility areas",
          "Basement or ground-floor walls showing salt or peeling paint",
        ],
        tip: "Fix the cause, not just the stain. Repainting over damp only hides the problem for a season.",
      },
    ],
  },
  {
    slug: "what-to-expect-at-each-stage-of-construction",
    title: "What to expect at each stage of construction",
    excerpt:
      "From soil test to handover — a simple guide to the stages of building, how long each takes and what you should check.",
    category: "Planning",
    date: "2026-07-16",
    readMinutes: 8,
    cover: "/stages/06-structural-frame.jpg",
    coverAlt: "Reinforced concrete frame of a building under construction",
    author: "RPC Engineering Team",
    sections: [
      {
        paragraphs: [
          "Knowing what happens next makes the whole process calmer. Here is how a typical RPC project moves from an empty plot to a finished building.",
        ],
      },
      {
        heading: "1. Planning and approvals",
        paragraphs: ["Site survey, soil test, brief and concept design. Drawings are prepared and submitted for the required approvals."],
      },
      {
        heading: "2. Foundation",
        paragraphs: ["Setting out, excavation, footings or raft and plinth beam. This is where the soil report and structural design meet the ground."],
      },
      {
        heading: "3. Structure",
        paragraphs: ["Columns, beams and slabs rise floor by floor. Each slab is checked for reinforcement and cover before the concrete pour."],
      },
      {
        heading: "4. Masonry and services",
        paragraphs: ["Walls go up, and electrical conduits and plumbing lines are laid before plastering so nothing is cut out later."],
      },
      {
        heading: "5. Finishes",
        paragraphs: ["Plaster, waterproofing, flooring, doors and windows, painting and fixtures — the stage where the building starts to feel like yours."],
      },
      {
        heading: "6. Handover",
        paragraphs: ["Final inspection, snag list, cleaning and handover of documents and warranties."],
        tip: "Ask for a stage-wise schedule at the start, and link payments to completed stages.",
      },
    ],
  },
];

export const blogCategories = ["All", ...Array.from(new Set(blogPosts.map((p) => p.category)))] as const;

export const getPost = (slug: string) => blogPosts.find((p) => p.slug === slug);

export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
