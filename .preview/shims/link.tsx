import type { AnchorHTMLAttributes, ReactNode } from "react";
// Single-page preview: routes map to sections of the film.
const MAP: Record<string, string> = { "/": "#top", "/projects": "#projects", "/about": "#about", "/services": "#services", "/contact": "#contact-cta", "/#process": "#process" };
export default function Link({ href, children, ...rest }: { href: string; children?: ReactNode } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const h = MAP[href] ?? (href.startsWith("/#") ? href.slice(1) : href);
  return <a href={h} {...rest}>{children}</a>;
}
