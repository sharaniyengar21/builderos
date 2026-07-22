"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

const KIND_CLASSES = {
  error: "border-red-500/20 bg-red-500/10 text-red-300",
  info: "border-accent-electric/20 bg-accent-electric/10 text-accent-electric",
};

export function Alert({ kind, children }: { kind: keyof typeof KIND_CLASSES; children: ReactNode }) {
  return (
    <AnimatePresence>
      <motion.p
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className={`rounded-lg border px-3 py-2 text-sm ${KIND_CLASSES[kind]}`}
      >
        {children}
      </motion.p>
    </AnimatePresence>
  );
}
