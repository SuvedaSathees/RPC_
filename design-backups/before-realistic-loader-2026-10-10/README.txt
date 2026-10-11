Backup made on 10 Oct 2026, before the loading screen was changed from the
drawn version to the realistic one (five AI pictures of one terrace).

To go back to the drawn loading screen, copy these three files over the ones
in the project (same paths):
  lib/loader/drop.ts
  components/home3/DropLoader.tsx
  components/home3/ArtHero.tsx
The new pictures in public/media/loader-*.webp can stay; the old files don't use them.
