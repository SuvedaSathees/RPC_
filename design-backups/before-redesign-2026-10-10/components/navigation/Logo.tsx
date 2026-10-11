import Image from "next/image";
import logoImg from "@/components/ui/logo.png";

/**
 * Official RPC cube mark.
 */
export function LogoMark({ className = "", title = "RPC Constructions" }: { className?: string; title?: string }) {
  return (
    <Image
      src={logoImg}
      alt={title}
      width={128}
      height={128}
      className={`object-contain ${className}`}
      priority
    />
  );
}

/**
 * The logo lockup: the cube mark and the name, drawn as one graphic (the name
 * is part of the logo, not running text, so it keeps its own proportions at
 * every size). Wrap it in a link or give the page its own text for the name.
 */
export function Wordmark({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const mark = size === "lg" ? "h-14 w-14" : size === "sm" ? "h-9 w-9" : "h-12 w-12";
  const h = size === "lg" ? 40 : size === "sm" ? 29 : 35;
  const font = { fontFamily: "var(--font-inter-tight), ui-sans-serif, system-ui, sans-serif" };
  return (
    <span className={`inline-flex items-center ${size === "sm" ? "gap-2.5" : "gap-3"} ${className}`}>
      <LogoMark className={`${mark} shrink-0`} />
      <svg viewBox="0 0 132 35" height={h} width={Math.round((h * 132) / 35)} aria-hidden="true" focusable="false" className="block shrink-0 overflow-visible">
        <text x="0" y="15.6" fill="currentColor" style={{ ...font, fontWeight: 600, fontSize: 19.2, letterSpacing: 2.7 }}>
          RPC
        </text>
        <text x="0" y="32.4" fill="currentColor" fillOpacity={0.7} style={{ ...font, fontWeight: 500, fontSize: 10.2, letterSpacing: 3.05 }}>
          CONSTRUCTIONS
        </text>
      </svg>
    </span>
  );
}
