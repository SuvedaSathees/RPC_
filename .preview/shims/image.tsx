import type { CSSProperties } from "react";
type P = { src: string; alt: string; fill?: boolean; className?: string; sizes?: string; priority?: boolean; loading?: "eager" | "lazy"; fetchPriority?: "high" | "low" | "auto"; style?: CSSProperties };
export default function Image({ src, alt, fill, className, priority, loading, fetchPriority, style }: P) {
  const s: CSSProperties = fill ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...style } : { ...style };
  return <img src={src.replace(/^\//, "")} alt={alt} className={className} style={s} loading={priority ? "eager" : loading ?? "lazy"} fetchPriority={priority ? "high" : fetchPriority} decoding="async" />;
}
