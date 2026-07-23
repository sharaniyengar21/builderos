"use client";

import { useState } from "react";
import { Package, ExternalLink } from "lucide-react";
import { buildSnapshotFromMetrics, type NpmStatsSnapshot } from "./snapshot";

export interface NpmStatsWidgetProps {
  connectionId: string;
  packageName: string;
  initialSnapshot: NpmStatsSnapshot;
  lastSyncedAt: string | null;
}

interface SyncResponse {
  ok: boolean;
  demo?: boolean;
  message?: string;
  error?: string;
  metrics?: { key: string; value?: number; metadata?: unknown }[];
  lastSyncedAt?: string;
}

function StatTile({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
      <div className="text-[11px] uppercase tracking-wider text-ink-muted">{label}</div>
      <div className="stat-number-gradient mt-1 font-mono text-2xl font-semibold tabular-nums">
        {value === null ? "—" : value.toLocaleString("en-US")}
      </div>
    </div>
  );
}

export function NpmStatsWidget({ connectionId, packageName, initialSnapshot, lastSyncedAt }: NpmStatsWidgetProps) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [syncedAt, setSyncedAt] = useState(lastSyncedAt);
  const [status, setStatus] = useState<{ kind: "idle" | "info" | "error"; message?: string }>({ kind: "idle" });
  const [isSyncing, setIsSyncing] = useState(false);

  async function handleSync() {
    setIsSyncing(true);
    setStatus({ kind: "idle" });
    try {
      const response = await fetch(`/api/connections/${connectionId}/sync`, { method: "POST" });
      const data: SyncResponse = await response.json();

      if (!data.ok) {
        setStatus({ kind: "error", message: data.error ?? "Sync failed" });
        return;
      }
      if (data.demo) {
        setStatus({ kind: "info", message: data.message });
        return;
      }
      if (data.metrics) {
        setSnapshot(buildSnapshotFromMetrics(data.metrics));
        setSyncedAt(data.lastSyncedAt ?? new Date().toISOString());
      }
    } catch {
      setStatus({ kind: "error", message: "Could not reach the sync endpoint" });
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="glass-surface rounded-xl p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Package className="h-5 w-5 text-ink-secondary" />
          <div>
            <h3 className="text-sm font-medium text-ink-primary">{packageName}</h3>
            <p className="font-mono text-xs text-ink-muted">
              {syncedAt ? `Last synced ${new Date(syncedAt).toLocaleString()}` : "Not synced yet"}
            </p>
          </div>
        </div>
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="inline-flex items-center gap-2 rounded-lg border border-white/[0.12] px-3.5 py-2 text-sm font-medium text-ink-primary transition-colors duration-150 hover:border-white/25 hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSyncing && (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          {isSyncing ? "Syncing…" : "Sync now"}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <StatTile label="Downloads (24h)" value={snapshot.downloadsLastDay} />
        <StatTile label="Downloads (7d)" value={snapshot.downloadsLastWeek} />
        <StatTile label="Downloads (30d)" value={snapshot.downloadsLastMonth} />
      </div>

      {snapshot.latestVersion && (
        <a
          href={`https://www.npmjs.com/package/${packageName}`}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1 text-xs text-ink-secondary hover:text-ink-primary"
        >
          v{snapshot.latestVersion.version}
          <ExternalLink className="h-3 w-3" />
        </a>
      )}

      {status.kind !== "idle" && (
        <p
          className={`mt-3 rounded-lg border px-3 py-2 text-sm ${
            status.kind === "error"
              ? "border-red-500/20 bg-red-500/10 text-red-300"
              : "border-accent-electric/20 bg-accent-electric/10 text-accent-electric"
          }`}
        >
          {status.message}
        </p>
      )}
    </div>
  );
}
