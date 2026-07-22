import type { InputHTMLAttributes } from "react";

function cx(...classes: (string | false | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

function baseInputClasses(className?: string): string {
  return cx(
    "w-full rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus-visible:border-accent-electric/60",
    className,
  );
}

export function TextField(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="text" {...props} className={baseInputClasses(props.className)} />;
}

export function PasswordField(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="password" {...props} className={baseInputClasses(props.className)} />;
}
