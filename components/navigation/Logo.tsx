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

export function Wordmark({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const mark = size === "lg" ? "h-14 w-14" : size === "sm" ? "h-9 w-9" : "h-12 w-12";
  return (
    <span className={`inline-flex items-center ${size === "sm" ? "gap-2.5" : "gap-3"} ${className}`}>
      <LogoMark className={`${mark} shrink-0`} />
      <span className="flex flex-col leading-none">
        <span className={`${size === "lg" ? "text-[24px]" : size === "sm" ? "text-[16px]" : "text-[20px]"} font-semibold tracking-[0.14em] text-current`}>RPC</span>
        <span className={`mt-1 ${size === "lg" ? "text-[11px]" : size === "sm" ? "text-[8.5px]" : "text-[10px]"} font-medium uppercase tracking-[0.3em] opacity-70`}>Constructions</span>
      </span>
    </span>
  );
}
