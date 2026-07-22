export interface MetricChipData {
  pluginSlug: string;
  label: string;
  value: string;
  hasError: boolean;
  errorMessage?: string | null;
}

export function MetricChip({ label, value, hasError, errorMessage }: MetricChipData) {
  return (
    <span
      title={hasError ? errorMessage ?? "Last sync failed" : undefined}
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-mono ${
        hasError
          ? "border border-red-500/30 bg-red-500/10 text-red-300"
          : "bg-white/[0.06] text-ink-secondary"
      }`}
    >
      {hasError && <span className="h-1.5 w-1.5 rounded-full bg-red-400" />}
      {label} {value}
    </span>
  );
}
