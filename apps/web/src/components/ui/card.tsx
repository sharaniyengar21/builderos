import type { HTMLAttributes } from "react";

function cx(...classes: (string | false | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx("rounded-xl border border-white/[0.08] bg-white/[0.03] p-5", className)}
      {...props}
    />
  );
}

export function GlassCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("glass-surface rounded-xl p-5", className)} {...props} />;
}
