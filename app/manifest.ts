import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RPC Constructions",
    short_name: "RPC",
    description: "Design-and-build construction company in Erode, Tamil Nadu.",
    start_url: "/",
    display: "standalone",
    background_color: "#eeeae3",
    theme_color: "#0d1420",
    icons: [{ src: "/logo.png", sizes: "512x512", type: "image/png" }],
  };
}
