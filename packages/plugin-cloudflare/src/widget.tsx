"use client";

import { useState } from "react";
import { Cloud } from "lucide-react";
import { buildSnapshotFromMetrics, formatBytes, type CloudflareStatsSnapshot } from "./snapshot";

export interface CloudflareStatsWidgetProps {
  connectionId: string;
  zoneName: string;
  initialSnapshot: CloudflareStatsSnapshot;
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

function StatTile({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
      <div className="text-[11px] uppercase tracking-wider text-ink-muted">{label}</div>
      <div className="stat-number-gradient mt-1 font-mono text-2xl font-semibold tabular-nums">{value ?? "—"}</div>
    </div>
  );
}

export function CloudflareStatsWidget({ connectionId, zoneName, initialSnapshot, lastSyncedAt }: CloudflareStatsWidgetProps) {
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
          <Cloud className="h-5 w-5 text-ink-secondary" />
          <div>
            <h3 className="text-sm font-medium text-ink-primary">{zoneName}</h3>
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

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Requests (7d)" value={snapshot.requests7d?.toLocaleString("en-US") ?? null} />
        <StatTile label="Bandwidth (7d)" value={snapshot.bandwidthBytes7d !== null ? formatBytes(snapshot.bandwidthBytes7d) : null} />
        <StatTile label="Threats blocked" value={snapshot.threatsBlocked7d?.toLocaleString("en-US") ?? null} />
        <StatTile label="Pageviews (7d)" value={snapshot.pageviews7d?.toLocaleString("en-US") ?? null} />
      </div>

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
