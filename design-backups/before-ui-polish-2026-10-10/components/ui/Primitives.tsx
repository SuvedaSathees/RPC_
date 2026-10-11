import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Magnetic } from "./Magnetic";

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("eyebrow", className)}>{children}</p>;
}

/** "(03) — Label" section marker used across the page */
export function SectionMarker({ index, label, className }: { index: string; label: string; className?: string }) {
  return (
    <div className={cn("eyebrow flex items-center gap-3", className)}>
      <span className="opacity-50">({index})</span>
      <span className="h-px w-8 bg-current opacity-30" />
      <span>{label}</span>
    </div>
  );
}

export function ArrowLink({
  href,
  children,
  variant = "solid",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: "solid" | "light" | "ghost";
  className?: string;
}) {
  return (
    <Magnetic>
      <Link href={href} className={cn("btn", `btn-${variant}`, className)}>
        <span>{children}</span>
        <span className="btn-icon" aria-hidden>
          <ArrowUpRight size={15} strokeWidth={1.5} />
        </span>
      </Link>
    </Magnetic>
  );
}

/** Label/value pair used for project metadata */
export function Meta({ label, value, className }: { label: string; value: ReactNode; className?: string }) {
  return (
    <div className={cn("border-t border-current/15 pt-3", className)}>
      <dt className="eyebrow mb-1.5 opacity-50">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}
