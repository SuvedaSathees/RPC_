"use client";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { visit } from "@/lib/visit";

/**
 * pages that open with their own loading screen, so the curtain would only get in its way
 * (the home page's plays on arrival and after a refresh; coming back to it, the curtain is used)
 */
const OWN_INTRO = new Set(["/"]);

/**
 * Route transition: a deep-navy curtain lifts off each new page.
 * Only opacity is animated on the content wrapper — a transform here would
 * break position: fixed / sticky and ScrollTrigger pinning below it.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // decided once per arrival, so the page is never re-wrapped (and remounted) while it is open
  const [own] = useState(() => !!pathname && OWN_INTRO.has(pathname) && !visit.homeShown);
  if (own) return <>{children}</>;
  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[70] bg-night"
        initial={{ clipPath: "inset(0 0 0% 0)" }}
        animate={{ clipPath: "inset(0 0 100% 0)" }}
        transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1], delay: 0.05 }}
      />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.25 }}>
        {children}
      </motion.div>
    </>
  );
}
