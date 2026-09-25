# Real Indian Construction – Shot Prompts (for Veo 3 / Kling / Runway / Sora)

## How to generate (keeps continuity between shots)
1. Generate shot 08 (completed building) FIRST as a still image. It becomes the "master" that fixes the building's design.
2. Generate every clip with the SAME camera block below pasted in, 16:9, 1920x1080, 4–5 s each.
3. Where the tool supports first/last frame (Veo 3 "frames to video", Kling "start + end frame"), use the final frame
   of each clip as the start frame of the next. This keeps the camera locked and the site consistent.
4. Name the clips 01.mp4 … 08.mp4, put them in `public/videos/real-clips/`, and run `node scripts/make-real-video.mjs`.

## Camera block (paste into EVERY prompt)
Locked-off aerial drone shot, high three-quarter view looking down at 40 degrees onto one corner of a square
urban plot, altitude about 35 metres, 35mm lens, very slow steady push-in, identical camera position and framing
in every shot. Shot on ARRI Alexa, natural Indian daylight, late-morning sun from the left, soft haze, real
shadows, real textures, shallow atmospheric depth, 24fps cinematic, photorealistic documentary footage.

## Negative block (paste into every prompt / negative field)
no text, no labels, no captions, no watermark, no logos, no cartoon, no animation, no CGI, no 3D render,
no low-poly, no isometric diorama, no cutaway, no floating parts, no plastic or artificial plants,
no morphing, no warped people, no unrealistic effects, no lens flares.

---

### 01 – Bare land
[Camera block] An empty flat plot of dusty red-brown Indian soil in a growing city suburb, dry grass tufts,
scattered stones, a few mature neem trees and a peepal tree at the plot edges, low boundary wall of exposed
brick, neighbouring two-storey concrete houses, overhead power lines, a stray dog crossing. Light breeze moves the leaves.

### 02 – Site layout / blueprint on ground
[Camera block] Same plot, cleared and levelled. Surveyor with a total station on a tripod, workers stretching
white nylon string lines between wooden pegs, grid lines marked on the soil in white lime powder showing the
column positions, a site engineer in a white helmet holding a rolled paper drawing, a tin-roof site office
and stacked red bricks in the corner.

### 03 – Excavation & foundation
[Camera block] Yellow JCB backhoe loader excavating, a tipper truck being loaded with soil, open pits with
PCC bed, workers in orange helmets and reflective vests tying steel rebar footing mats and column starter bars,
wooden shuttering around footings, cement bags and aggregate heaps, dust in the air.

### 04 – RCC frame
[Camera block] Reinforced concrete frame rising three to four floors: concrete columns, beams and slabs,
exposed rebar at the top floor, plywood and steel shuttering, dense steel props and bamboo supports under
the slab, a transit mixer truck and concrete boom pump pouring the top slab, workers spreading wet grey
concrete, a tower crane or hoist beside the structure.

### 05 – Brick walls
[Camera block] Same RCC frame, now at full height, red clay brick infill walls going up floor by floor,
masons laying bricks with mortar, bamboo scaffolding tied with coir rope around the facade, green shade net
on part of the scaffold, stacked bricks and sand piles on site, labourers carrying head-pans of mortar.

### 06 – Plaster & finishing
[Camera block] Building fully walled, facade half grey cement plaster and half freshly painted off-white,
aluminium window frames and glass being installed, workers on bamboo scaffolding painting, scaffolding
being removed from the lower floors, site cleaned, a paver-block driveway being laid.

### 07 – Landscaping
[Camera block] Scaffolding gone, gardeners planting real young trees (ashoka, neem, areca palms),
bougainvillea and hibiscus shrubs, laying fresh natural lawn turf, watering with a hose, wet soil, a
wheelbarrow, compound wall painted, main gate installed.

### 08 – Completed building (generate this as the master still first)
[Camera block] A finished modern Indian mid-rise building, six floors, off-white plaster and warm wood-tone
louvres, glass balconies with plants, flat roof with solar panels and water tank, lush real green landscaping,
mature trees, paver driveway, a parked car, warm window lights just switching on as the golden-hour sun
lowers, birds flying past. Completely real, architectural photography quality.
