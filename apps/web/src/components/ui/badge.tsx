import type { ReactNode } from "react";

const TONE_CLASSES: Record<string, string> = {
  demo: "bg-accent-electric/15 text-accent-electric",
  "coming-soon": "bg-white/[0.06] text-ink-muted",
  connected: "bg-emerald-500/15 text-emerald-400",
  error: "bg-red-500/15 text-red-400",
};

export function Badge({ tone, children }: { tone: keyof typeof TONE_CLASSES; children: ReactNode }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]}`}>{children}</span>
  );
}
