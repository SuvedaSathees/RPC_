import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import path from "node:path";
const root = path.resolve(__dirname, "..");
const sh = (f: string) => path.resolve(__dirname, "shims", f);
export default defineConfig({
  root: __dirname,
  plugins: [react(), tailwind(), viteSingleFile()],
  resolve: {
    alias: [
      { find: "next/image", replacement: sh("image.tsx") },
      { find: "next/link", replacement: sh("link.tsx") },
      { find: "next/navigation", replacement: sh("navigation.ts") },
      { find: "next/dynamic", replacement: sh("dynamic.tsx") },
      { find: /^@\//, replacement: root + "/" },
    ],
  },
  define: { "process.env.NODE_ENV": '"production"', "process.env.NEXT_PUBLIC_STUDIO": '""' },
  build: { outDir: path.resolve(__dirname, "dist"), assetsInlineLimit: 100000000, cssCodeSplit: false, chunkSizeWarningLimit: 10000 },
  logLevel: "warn",
});
