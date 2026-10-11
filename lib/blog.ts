/**
 * Blog — practical waterproofing notes from RPC's engineers for homes and
 * buildings in Erode, Coimbatore and across Tamil Nadu. Posts are plain data
 * so they can later move to a CMS without touching the pages.
 *
 * Advice in posts is general guidance — every building differs.
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
  category: "Planning" | "Terraces" | "Bathrooms" | "Tanks & basements" | "Maintenance";
  date: string; // ISO
  readMinutes: number;
  cover: string;
  coverAlt: string;
  author: string;
  sections: BlogSection[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "questions-to-ask-a-waterproofing-contractor",
    title: "10 questions to ask a waterproofing contractor",
    excerpt:
      "Before anyone touches your terrace or bathroom, ask these ten questions. The answers tell you whether the leak will stay fixed.",
    category: "Planning",
    date: "2026-09-18",
    readMinutes: 4,
    cover: "/images/waterproofing/house-wet-zones.jpg",
    coverAlt: "A three-storey house with its terraces, bathrooms, sump and pool glowing where waterproofing is needed",
    author: "RPC Engineering Team",
    sections: [
      {
        paragraphs: [
          "Most waterproofing fails for one of two reasons: the wrong system for the surface, or the right system applied badly. Neither shows on the day the work is finished. Both show in the first heavy rain.",
          "Take these questions to every contractor you meet, in Erode, Coimbatore or anywhere else. A good one will be glad you asked.",
        ],
      },
      {
        heading: "About the diagnosis",
        list: [
          "Will you inspect the whole building, or only the spot that is leaking?",
          "Where do you think the water is getting in, and how will you confirm it before work starts?",
          "Could the cause be a plumbing line, a structural crack or a blocked outlet rather than failed waterproofing?",
        ],
      },
      {
        heading: "About the system",
        list: [
          "Which system do you recommend for this surface, and why that one over the alternatives?",
          "Which brand and product, how many coats, and what finished thickness?",
          "How will corners, pipe openings, drains and joints be treated?",
        ],
      },
      {
        heading: "About the work, and after it",
        list: [
          "How will the surface be prepared before anything is applied?",
          "Will bathrooms and terraces be flooded and checked before tiles or screed go over them?",
          "Who will be on site, and how often has the team laid this system before?",
          "What warranty do you give in writing, and what exactly does it cover?",
        ],
        tip: "Get the answers on paper. A quote that names the product, the number of coats and the test is far easier to hold a contractor to than a price per square foot.",
      },
    ],
  },
  {
    slug: "terrace-waterproofing-systems-erode",
    title: "Terrace waterproofing in Erode: choosing a system that lasts",
    excerpt:
      "PU, acrylic, torch-on membrane or a cementitious coat? What each one suits, and the edge details that matter more than the product.",
    category: "Terraces",
    date: "2026-09-10",
    readMinutes: 5,
    cover: "/images/waterproofing/terrace-parapet-outlet.jpg",
    coverAlt: "Terrace corner with the waterproofing turned up the parapet wall and dressed into a rainwater outlet",
    author: "RPC Engineering Team",
    sections: [
      {
        paragraphs: [
          "A terrace in Erode or Coimbatore has a hard life. Months of strong sun make the slab expand and contract, opening hairline cracks, and then the monsoon arrives to find them. Whatever goes on top has to stay flexible, resist UV and shed water quickly.",
        ],
      },
      {
        heading: "Four systems, four different jobs",
        list: [
          "Polyurethane (PU) liquid membrane: seamless and very elastic, a strong choice for exposed terraces, ideally finished with a UV-resistant or reflective top coat.",
          "Acrylic elastomeric coating: quick to apply and easy to recoat, suited to terraces with light foot traffic and modest budgets.",
          "APP/SBS torch-on membrane: thick bitumen sheets heat-welded at the laps, robust on large flat roofs and podiums, usually protected by screed or tiles.",
          "Cementitious coating: rigid and economical, better under tiles or screed than left bare in the sun.",
        ],
      },
      {
        heading: "The edges decide it",
        paragraphs: [
          "Terrace leaks usually begin at an edge rather than in the middle of the slab: where the slab meets the parapet, around rainwater outlets, at pipe and solar-stand fixings, and under water tanks. Whichever system you choose, it must be turned up the parapet, coved at the corners and dressed into every outlet.",
          "Slope matters as much as the membrane. Water that stands for days after rain will eventually find its way through almost anything.",
        ],
      },
      {
        heading: "When to do the work",
        paragraphs: [
          "Plan terrace work for dry weather, so each coat cures properly and the finished terrace can be flood-tested before the rains. Around Erode and Coimbatore that means finishing well before the northeast monsoon arrives in October.",
        ],
        tip: "A white reflective top coat earns its cost twice: it shields the membrane from UV, and it keeps the rooms below noticeably cooler in April and May.",
      },
    ],
  },
  {
    slug: "bathroom-leakage-repair",
    title: "Bathroom leakage: why the ceiling below gets damp",
    excerpt:
      "A damp patch under a bathroom is rarely the tiles’ fault. How water escapes a wet area, and how it is fixed for good.",
    category: "Bathrooms",
    date: "2026-08-28",
    readMinutes: 5,
    cover: "/images/waterproofing/bathroom-wet-zone.jpg",
    coverAlt: "Bathroom with the waterproofed shower area and floor drain highlighted beneath the tiles",
    author: "RPC Engineering Team",
    sections: [
      {
        paragraphs: [
          "A stain on the ceiling below a bathroom is one of the most common leaks in homes across Erode and Coimbatore. The tiles above usually look perfect, which is exactly why the problem lasts so long.",
        ],
      },
      {
        heading: "Where the water escapes",
        list: [
          "Through cement grout between tiles, which absorbs water and cracks with time",
          "Around the floor trap and pipe openings, where the slab was broken for plumbing",
          "At the junction of wall and floor, and up the wall behind the shower",
          "From a leaking concealed pipe, which no amount of waterproofing can stop",
        ],
      },
      {
        heading: "How it is fixed properly",
        paragraphs: [
          "The first job is to tell waterproofing failure apart from plumbing failure. A pressure test on the supply lines and a pond test on the floor separate the two.",
          "If the waterproofing has gone, the tiles come up. The sunken slab is cleaned, every pipe opening gets a sealing collar, and two coats go on the floor and at least 300 mm up the walls, full height inside the shower. The floor is flooded for 48 hours, and only then retiled with epoxy grout.",
        ],
      },
      {
        heading: "Can it be done without breaking tiles?",
        paragraphs: [
          "Sometimes. Where water is only getting through the grout, raking it out and regrouting with epoxy can stop it, and injection helps in particular cases. But once water is sitting in the sunken slab, only opening it up lasts.",
        ],
        tip: "After the repair, let the stained ceiling dry out for a few weeks before repainting it. Paint over a damp slab blisters within months.",
      },
    ],
  },
  {
    slug: "sump-and-water-tank-waterproofing",
    title: "Sump and water tank waterproofing: keeping drinking water clean",
    excerpt:
      "A leaking sump wastes water and can let dirty groundwater in. How tanks are sealed inside and out, and why the product must be safe for drinking water.",
    category: "Tanks & basements",
    date: "2026-08-14",
    readMinutes: 4,
    cover: "/images/waterproofing/sump-cutaway.jpg",
    coverAlt: "Cutaway of an underground sump beside a house, sealed on the inside and wrapped on the outside",
    author: "RPC Engineering Team",
    sections: [
      {
        paragraphs: [
          "Most homes in Erode and Coimbatore rely on an underground sump and an overhead tank. A sump that leaks does two kinds of damage: it loses water you have paid for, and when the ground is wet it can draw groundwater and drainage in.",
        ],
      },
      {
        heading: "Inside the tank",
        list: [
          "A crystalline treatment on every inside face, which grows into the pores of the concrete and seals hairline cracks",
          "Only products certified as safe for contact with drinking water",
          "Coved corners and sealed joints where the walls meet the base",
        ],
      },
      {
        heading: "Outside, and where pipes pass through",
        list: [
          "PVC waterstops at construction joints, cast in while the tank is built",
          "A membrane or bitumen coat on the outer walls before backfilling",
          "Puddle flanges where the inlet, outlet and overflow pipes cross the wall",
        ],
      },
      {
        heading: "Testing before use",
        paragraphs: [
          "A new or repaired tank is filled and the water level marked. If the level holds over a few days, allowing for evaporation in an overhead tank, it is drained, cleaned, rinsed and put back into service.",
        ],
        tip: "If the sump level drops overnight while nothing is drawing water, check the float valve and the pipe joints first. If they are sound, the tank itself needs looking at.",
      },
    ],
  },
  {
    slug: "waterproofing-before-the-monsoon",
    title: "Waterproofing checklist before the monsoon",
    excerpt:
      "Most leaks begin at a few predictable places. A walk from the terrace to the sump, and what to fix before the rains reach Erode and Coimbatore.",
    category: "Maintenance",
    date: "2026-07-30",
    readMinutes: 4,
    cover: "/images/waterproofing/terrace-before-monsoon.jpg",
    coverAlt: "Rooftop terrace of a villa with glass railings, seen from above",
    author: "RPC Engineering Team",
    sections: [
      {
        paragraphs: [
          "Water always finds the weakest joint. An hour spent walking around the building before the monsoon can save a repaint, damp walls and spoilt furniture.",
        ],
      },
      {
        heading: "On the terrace",
        list: [
          "Clear the rainwater outlets and check that water runs to them without pooling",
          "Look for cracks in the screed or membrane, especially along the parapet",
          "Check around the feet of water tanks, solar stands and pipe supports",
        ],
      },
      {
        heading: "On the outside walls",
        list: [
          "Hairline cracks in plaster near columns, beams and lintels",
          "Sealant around window frames, AC pipes and cable entries",
          "Sunshades (chajjas) that hold water instead of shedding it",
        ],
      },
      {
        heading: "Inside, and below ground",
        list: [
          "Bathroom floor and wall junctions, and the ceilings beneath them",
          "Skirting with salt deposits or bubbling paint, a sign of rising damp",
          "The sump lid, and whether the sump level holds overnight",
        ],
        tip: "Photograph every damp patch with the date on it. If one grows after the first rains, you know the leak is active and roughly when it started.",
      },
    ],
  },
  {
    slug: "basement-waterproofing-coimbatore",
    title: "Basement waterproofing for homes and offices in Coimbatore",
    excerpt:
      "A basement takes water from the soil around it, not just from above. What keeps a car park or cellar dry, and why it is decided before the concrete is poured.",
    category: "Tanks & basements",
    date: "2026-07-16",
    readMinutes: 4,
    cover: "/images/waterproofing/basement-car-park.jpg",
    coverAlt: "Basement car park with the waterproofed joints in its walls and floor highlighted",
    author: "RPC Engineering Team",
    sections: [
      {
        paragraphs: [
          "A car park under an office on Avinashi Road, or a cellar under a house in Erode, sits in the ground. Unlike a terrace, it is attacked from outside: by rainwater soaking through the backfill and, after a heavy monsoon, by groundwater pressing on the walls and floor.",
        ],
      },
      {
        heading: "Planned before the pour",
        list: [
          "An HDPE or bituminous membrane under the raft, with welded or sealed laps",
          "A crystalline admixture or coating for the retaining walls",
          "PVC waterstops at every construction joint between pours",
          "A protection board and a drainage layer before the backfill goes in",
        ],
      },
      {
        heading: "Repairing a basement that already leaks",
        paragraphs: [
          "Once a basement is built, its outside face is out of reach, so repairs work from inside. Active leaks at cracks and joints are stopped with polyurethane injection, and the inner faces are treated with crystalline or cementitious systems made to resist water pushing from behind.",
        ],
      },
      {
        heading: "Keep water away from the walls",
        paragraphs: [
          "Drainage outside does half the work: storm-water drains that lead away from the building, paving sloped outwards, and downpipes that discharge well clear of the basement walls.",
        ],
        tip: "If you are building with a basement, ask for the waterproofing to be shown on the structural drawings. If it is not on paper, it is rarely done right on site.",
      },
    ],
  },
];

export const blogCategories = ["All", ...Array.from(new Set(blogPosts.map((p) => p.category)))] as const;

export const getPost = (slug: string) => blogPosts.find((p) => p.slug === slug);

export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
