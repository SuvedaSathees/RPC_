# Hero stage plates: brief for the final photography

The hero plays 12 photographs of **one** project, in build order. The scroll,
captions, rail, build meter, camera readout and reveal are already wired to
them. To replace a stand-in, save the new image as `public/stages/<file>.jpg`
with exactly the same name. You don't need to change any code.

## Rules for all 12 images (this is what makes it feel like one project)

- **Same building, same plot, same camera.** The camera is locked off, as for
  a real time-lapse: eye level about 1.6 m, looking at the front-left
  three-quarter corner, from across the road, 35 mm lens, no fisheye.
- **Frame:** 16:9, at least 2560 × 1440 (3840 × 2160 is better). Keep the
  building inside the centre 70% of the frame. The site pans and zooms slowly,
  and the edges get cropped on phones.
- **Project:** G+6 residential RCC-frame building in an Indian city (for
  example a Bengaluru, Hyderabad or Chennai suburb). Plot about 24 m × 17 m.
  A 5 × 3 column grid. Balconies on the front face.
- **Keep across every image:** the neighbouring buildings, the two mature
  neem trees at the left boundary, the electricity pole, the road in front and
  the sky direction (sun from the left).
- **Look:** real photograph, natural light, no people posing, no text, no
  watermark, no CGI look, no low-poly models, no fisheye.

Paste this line at the start of every prompt (it keeps the images
consistent). Also reuse one seed, or one reference image, for all 12 in your
image tool:

> Photorealistic architectural construction photograph, Indian city suburb,
> locked-off tripod camera at eye level across the road, 35mm lens, 16:9,
> same plot and same camera position in every image, two mature neem trees on
> the left boundary, electricity pole and power lines, 3–5 storey neighbouring
> buildings behind, natural sunlight from the left, subtle haze, real textures,
> Canon R5 photo, no text, no watermark —

| File | Stage | Prompt (after the shared line) |
|---|---|---|
| `01-empty-plot.jpg` | Empty plot | an empty vacant plot of natural red-brown soil, uneven ground with dry grass patches and small shrubs, a few survey pegs with string, a tin-sheet boundary on one side, calm morning light |
| `02-site-preparation.jpg` | Site preparation | the same plot cleared and levelled, a JCB excavator digging footing pits, soil heaps, sand and 20 mm aggregate piles, bundles of TMT steel bars, green safety netting on the tin boundary, a site office container |
| `03-foundation.jpg` | Foundation | open excavation with PCC beds, isolated RCC footings with plywood shuttering, column starter bars sticking up, workers in helmets tying rebar, cement bags stacked on pallets |
| `04-rcc-columns.jpg` | RCC columns | ground-floor RCC columns cast to plinth and first floor, some still in steel shuttering, column reinforcement cages above, plinth beam done, backfilled site |
| `05-beams-and-slabs.jpg` | Beams & slabs | first and second floor slab and beams cast, wooden props and steel acrylic spans underneath, bamboo scaffolding on the front, rebar mat being tied on the top slab |
| `06-structural-frame.jpg` | Structural frame | the full G+6 RCC frame topped out, bare grey concrete with water-curing stains, props on the top floors, a tower crane or material hoist, bamboo/steel scaffolding on the front |
| `07-masonry-walls.jpg` | Block walls | red-brick / AAC block infill walls built between the frame on the lower four floors, upper floors still open, mortar joints visible, scaffolding and material hoist |
| `08-plastering.jpg` | Plastering | all walls done, external cement plaster going on from the top down: upper floors plastered grey, lower floors still brick, scaffolding with workers, curing water marks |
| `09-windows-and-glass.jpg` | Windows & glass | plaster complete, aluminium windows and glass being installed, MS balcony railings fixed, scaffolding coming down on the upper half |
| `10-exterior-finishing.jpg` | Exterior finishing | exterior painted warm white and sandstone beige, facade cladding on the entrance tower, scaffolding removed, site still dusty, compound wall under construction |
| `11-landscaping.jpg` | Landscaping | building complete, a new compound wall and gate, interlocking paver driveway, lawns being laid, young palms and areca plants, entrance canopy, afternoon light |
| `12-completed.jpg` | Completed | finished premium residential building at golden hour, warm light on the facade, glass reflecting the sky, mature landscaping, parked cars, security cabin at the gate, exterior lights just on, the road in front clean |

## Tips

- Generate **01** first. Then use it as the image reference (or its seed) for
  02–12, so the plot, trees and neighbours stay put.
- If one image drifts (a different camera angle, the trees move), regenerate
  just that image. A single mismatched frame breaks the effect.
- Real site photography of an RPC project, shot from a tripod on the same
  spot over the months, is the best possible version of this. It drops in
  exactly the same way.
- After you replace the files, run the site. You don't need a rebuild script.
  `scripts/build-stage-standins.py` only regenerates the temporary plates.
