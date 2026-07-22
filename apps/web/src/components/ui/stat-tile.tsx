export function StatTile({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
      <div className="text-[11px] uppercase tracking-wider text-ink-muted">{label}</div>
      <div className="stat-number-gradient mt-1 font-mono text-2xl font-semibold tabular-nums">
        {value === null ? "—" : value.toLocaleString()}
      </div>
    </div>
  );
}
