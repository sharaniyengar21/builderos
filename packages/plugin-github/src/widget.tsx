"use client";

import { useState } from "react";
import { buildSnapshotFromMetrics, type RepoStatsSnapshot } from "./snapshot";

export interface RepoStatsWidgetProps {
  workspaceId: string;
  owner: string;
  repo: string;
  initialSnapshot: RepoStatsSnapshot;
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
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      <div className="text-xs uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-neutral-100">
        {value === null ? "—" : value.toLocaleString()}
      </div>
    </div>
  );
}

export function RepoStatsWidget({ workspaceId, owner, repo, initialSnapshot, lastSyncedAt }: RepoStatsWidgetProps) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [syncedAt, setSyncedAt] = useState(lastSyncedAt);
  const [status, setStatus] = useState<{ kind: "idle" | "info" | "error"; message?: string }>({ kind: "idle" });
  const [isSyncing, setIsSyncing] = useState(false);

  async function handleSync() {
    setIsSyncing(true);
    setStatus({ kind: "idle" });
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/plugins/github/sync`, { method: "POST" });
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
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-neutral-300">
            {owner}/{repo}
          </h3>
          <p className="text-xs text-neutral-500">
            {syncedAt ? `Last synced ${new Date(syncedAt).toLocaleString()}` : "Not synced yet"}
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="rounded-md bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-900 disabled:opacity-50"
        >
          {isSyncing ? "Syncing…" : "Sync now"}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Stars" value={snapshot.stars} />
        <StatTile label="Forks" value={snapshot.forks} />
        <StatTile label="Open issues" value={snapshot.openIssues} />
        <StatTile label="Open PRs" value={snapshot.openPrs} />
      </div>

      {snapshot.latestRelease && (
        <p className="mt-3 text-sm text-neutral-400">
          Latest release:{" "}
          <a href={snapshot.latestRelease.url} className="underline" target="_blank" rel="noreferrer">
            {snapshot.latestRelease.tag}
          </a>
        </p>
      )}

      {status.kind !== "idle" && (
        <p className={`mt-3 text-sm ${status.kind === "error" ? "text-red-400" : "text-blue-400"}`}>
          {status.message}
        </p>
      )}
    </div>
  );
}
