import fs from "fs";
import path from "path";

const brainDir = "C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\904e1690-f38b-4fd0-b292-0cdbb5dd0411";
const imgExploded = path.join(brainDir, "realistic_exploded_anatomy_1790271897233.jpg");
const imgAssembled = path.join(brainDir, "realistic_assembled_building_1790271921568.jpg");
const imgStructure = path.join(brainDir, "realistic_structure_building_1790271954449.jpg");

const targetDir = path.resolve("public/images");

fs.copyFileSync(imgExploded, path.join(targetDir, "exploded.jpg"));
fs.copyFileSync(imgExploded, path.join(targetDir, "anatomy-exploded.jpg"));
fs.copyFileSync(imgAssembled, path.join(targetDir, "anatomy-assembled.jpg"));
fs.copyFileSync(imgStructure, path.join(targetDir, "anatomy-structure.jpg"));

console.log("Successfully copied realistic architectural anatomy images to public/images/");
