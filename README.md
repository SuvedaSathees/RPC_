# RPC Constructions — architectural film website

A scroll-driven, real-time WebGL film: the visitor scrolls an empty site into a
finished building, then moves through projects, process and anatomy sections
built in the same visual language.

**Stack:** Next.js 16 (App Router) · React 19 · strict TypeScript · React Three Fiber · three.js · drei ·
@react-three/postprocessing · GSAP + ScrollTrigger · Lenis · Framer Motion · Tailwind CSS v4 · Lucide.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

---

## 1. Experience map

| # | Section | Where | Technique |
|---|---------|-------|-----------|
| — | Preloader | `components/transitions/Preloader.tsx` | Holds until the scene has rendered its first frames |
| 01–07 | **Hero film** — Site → Blueprint → Foundation → Structure → Envelope → Completion → Handover | `components/hero/Hero.tsx` + `components/three/*` | Live WebGL, scroll-scrubbed camera path, 760vh sticky section |
| 01 | Manifesto | `components/intro/Manifesto.tsx` | Word-by-word ink-in, scrubbed |
| 02 | Projects | `components/projects/ProjectsShowcase.tsx` | Pinned horizontal track, focus scaling, presentation-board metadata |
| 03 | **Blueprint → Reality** (signature) | `components/blueprint/BlueprintReality.tsx` | Same camera, four states; a survey line wipes each stage in |
| 04 | Process | `components/process/Process.tsx` | Pinned; each stage rises into frame from below |
| 05 | **Anatomy** (exploded building) | `components/exploded/Exploded.tsx` | Live WebGL — six systems separate, hold, reassemble |
| 06 | Services | `components/services/Services.tsx` | Editorial index, accordion + cursor-following image |
| 07 | About | `components/about/About.tsx` | Statement, six principles, parallax image |
| 08 | Stats | `components/stats/Stats.tsx` | Count-up (numbers) / rise (placeholders) |
| 09 | Final CTA | `components/contact/FinalCTA.tsx` | Live WebGL — completed building at dusk, camera pulls away |

Sub-pages: `/projects`, `/about`, `/services`, `/contact`.

## 2. How the film works

* **One canvas for the whole page.** `components/three/Experience.tsx` is a single fixed `<Canvas>`
  behind everything. Hero, Anatomy and Final CTA are *transparent* sections — windows onto it; every
  other section is opaque and passes over it. When no 3D section is on screen the render loop is
  stopped (`frameloop="never"`) and the canvas hidden.
* **Scroll → state, not scroll → React.** ScrollTriggers write raw progress to a mutable store
  (`lib/three/store.ts`). A GSAP ticker damps it (`tickScene`) — that damping is the "weight" of the
  camera. Nothing in the loop causes React re-renders.
* **Choreography is pure maths** (`lib/three/choreography.ts`): camera keyframes (Catmull-Rom through
  shots), blueprint amount, time of day and explode factor are all derived from progress. The same
  functions drive the live scene and the offline stills, so they always match.
* **The building is procedural and parametric** (`lib/three/building.ts`). Every element is a box with
  a schedule window and a *build anchor* — columns grow from their base, slabs are decked bay by bay,
  glazing is lowered from the top, foundations rise from the ground, temporary works sink away.
  Nothing pops into existence. Elements are grouped into instanced meshes per layer × material
  (~40 draw calls for the whole site).
* **Materials evolve**: raw grey concrete → finished; primer → bronze fins; interiors light up; sky,
  fog and sun move from day to dusk; the whole world turns RPC blue for the blueprint chapter.

## 3. Performance & accessibility

| Tier | Who | What |
|------|-----|------|
| `high` | desktop, ≥ 1200px, > 4 cores | DPR ≤ 1.75, 4K shadow map, N8AO, bloom, MSAA |
| `medium` | tablets / smaller laptops | DPR ≤ 1.4, 2K shadows, half-res AO, SMAA |
| `low` | phones | DPR ≤ 1.1, 1K shadows, no post-processing, fewer trees, no pointer parallax |
| `static` | `prefers-reduced-motion`, no WebGL | No canvas at all — composed stills, no scrubbing, no smooth scroll |

* drei `PerformanceMonitor` lowers DPR further if frame rate drops.
* Three.js is code-split behind `next/dynamic({ ssr: false })` — it never server-renders and isn't
  in the main chunk.
* No HDRs, GLBs or textures are downloaded: reflections use a procedural `Lightformer` studio,
  concrete noise is generated on a canvas.
* Force a tier for testing: `/?quality=low` (`high|medium|low|static`).
* Skip link, semantic landmarks, `aria-hidden` canvas, keyboard-operable menu and service accordion,
  visible focus states, reduced-motion fallbacks in every animated section.

## 4. Content & placeholders

**All copy and data live in `lib/content.ts`.** Anything in `[ square brackets ]` is a placeholder —
no RPC facts (projects, figures, contact details, history) were invented. Replace before launch:

* brand tagline (currently the brief's example "Building what lasts.")
* project names, locations, areas, years, status
* service descriptions, principles copy, company paragraph
* statistics (`value: 42` animates; `"XX"` is shown as a placeholder)
* contact details, socials, meta description, `metadataBase` domain in `app/layout.tsx`
* the contact form is not connected — see the TODO in `components/contact/ContactForm.tsx`
* the logo (`components/navigation/Logo.tsx`) is a vector interpretation of the supplied PNG —
  swap in the official artwork

### Imagery
Every image in `public/images` is rendered **from the site's own 3D scene** (massing variants in
`lib/three/variants.ts`), so the placeholders already match the film's look. Replace with real
project photography when available (same filenames, or edit `lib/content.ts`). To re-render:

```bash
NEXT_PUBLIC_STUDIO=1 npx next dev -p 3100     # enables /studio/render (404 otherwise)
node scripts/render-stills.mjs                # all stills → public/images
node scripts/render-stills.mjs "project-0[12]" # regex filter
```
`/studio/render?p=0.5&cam=front-left&variant=villa&tod=0.6` renders any moment of the film.

## 5. Structure

```
app/            routes, layout (fonts, providers), template (route curtain), globals.css (tokens)
components/
  three/        Experience (canvas), Scene, Building, Blueprint, Crane, World (sky/terrain/lights), materials
  hero/ intro/ projects/ blueprint/ process/ exploded/ services/ about/ stats/ contact/
  navigation/   Nav (desktop + fullscreen mobile), Logo
  transitions/  Preloader, PageHeader
  providers/    SmoothScroll (Lenis ↔ ScrollTrigger), QualityProvider
  ui/           Primitives, Reveal, ParallaxImage
lib/
  content.ts    all copy + data
  three/        store (scroll state), choreography (camera + timeline maths), building (procedural model), variants
  gsap/ utils/
public/         fonts (self-hosted), images (rendered stills), icon.svg
scripts/        still renderer + screenshot helpers (Playwright)
```

## 6. Tuning cheatsheet

* Camera shots — `heroCams` in `lib/three/choreography.ts`
* Chapter timing — `T` in `lib/three/building.ts` and `WINDOWS` in `components/hero/Hero.tsx`
* Camera weight — `LAMBDA` in `lib/three/store.ts` (lower = heavier)
* Palette — `@theme` in `app/globals.css`; 3D palette in `components/three/materials.ts` and `World.tsx`
* Building massing — `defaultBuilding` in `lib/three/building.ts`
