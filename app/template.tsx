"use client";
import { motion } from "framer-motion";

/**
 * Route transition: a brand-blue curtain lifts off each new page.
 * Only opacity is animated on the content wrapper — a transform here would
 * break position: fixed / sticky and ScrollTrigger pinning below it.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[70] bg-rpc-deep"
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
