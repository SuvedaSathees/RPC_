"use client";
import dynamic from "next/dynamic";
import { useQualityContext } from "@/components/providers/QualityProvider";

// WebGL is browser-only: never server-render it, and keep three.js out of the main chunk.
const Experience = dynamic(() => import("./Experience"), { ssr: false, loading: () => null });

export function ExperienceLoader() {
  const quality = useQualityContext();
  if (!quality || quality === "static") return null;
  return <Experience quality={quality} />;
}
