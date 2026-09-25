import fs from "fs";
import path from "path";

const brainDir = "C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\904e1690-f38b-4fd0-b292-0cdbb5dd0411";
const imgExploded = path.join(brainDir, "realistic_exploded_anatomy_1790271897233.jpg");
const imgAssembled = path.join(brainDir, "realistic_assembled_building_1790271921568.jpg");
const imgStructure = path.join(brainDir, "realistic_structure_building_1790271954449.jpg");
const imgDusk = path.join(brainDir, "realistic_hero_final_dusk_1790273061618.jpg");
const imgCraftDetail = path.join(brainDir, "architectural_facade_craft_detail_1790273749546.jpg");
const imgInteriorCraft = path.join(brainDir, "luxury_interior_joinery_craft_1790274018303.jpg");

export function syncAnatomyAssets() {
  try {
    const targetDir = path.resolve(process.cwd(), "public/images");
    if (fs.existsSync(imgExploded)) {
      fs.copyFileSync(imgExploded, path.join(targetDir, "exploded.jpg"));
      fs.copyFileSync(imgExploded, path.join(targetDir, "anatomy-exploded.jpg"));
    }
    if (fs.existsSync(imgAssembled)) {
      fs.copyFileSync(imgAssembled, path.join(targetDir, "anatomy-assembled.jpg"));
    }
    if (fs.existsSync(imgStructure)) {
      fs.copyFileSync(imgStructure, path.join(targetDir, "anatomy-structure.jpg"));
    }
    if (fs.existsSync(imgDusk)) {
      fs.copyFileSync(imgDusk, path.join(targetDir, "hero-final.jpg"));
      fs.copyFileSync(imgDusk, path.join(targetDir, "hero-film-final.jpg"));
      fs.copyFileSync(imgDusk, path.join(targetDir, "final-cta-dusk.jpg"));
    }
    if (fs.existsSync(imgCraftDetail)) {
      fs.copyFileSync(imgCraftDetail, path.join(targetDir, "detail-01.jpg"));
      fs.copyFileSync(imgCraftDetail, path.join(targetDir, "architectural-craft-detail.jpg"));
    }
    if (fs.existsSync(imgInteriorCraft)) {
      fs.copyFileSync(imgInteriorCraft, path.join(targetDir, "detail-02.jpg"));
      fs.copyFileSync(imgInteriorCraft, path.join(targetDir, "interior-joinery.jpg"));
    }
  } catch (err) {
    console.error("Failed to sync anatomy assets:", err);
  }
}
