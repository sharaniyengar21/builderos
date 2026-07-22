import type { ButtonHTMLAttributes } from "react";

function cx(...classes: (string | false | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

const VARIANT_CLASSES = {
  primary: "bg-gradient-brand text-white hover:opacity-90",
  secondary: "border border-white/[0.12] text-ink-primary hover:border-white/25 hover:bg-white/[0.05]",
  ghost: "text-ink-secondary hover:text-ink-primary",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANT_CLASSES;
  isLoading?: boolean;
}

export function Button({ variant = "primary", isLoading, className, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
        VARIANT_CLASSES[variant],
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
