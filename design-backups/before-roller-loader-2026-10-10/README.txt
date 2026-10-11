Backup made on 10 Oct 2026, before the loading screen was changed from the five
terrace pictures to the roller version (bare concrete, a roller laying the coat
in passes that uncover the page).

To go back to the terrace-pictures loading screen, copy these three files over
the ones in the project (same paths):
  lib/loader/drop.ts
  components/home3/DropLoader.tsx
  components/home3/ArtHero.tsx
The terrace pictures it uses (public/media/loader-1.webp ... loader-5-m.webp) are
still in place.
