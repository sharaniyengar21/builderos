"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

const CONCURRENCY = 3;

async function runInBatches(urls: string[], batchSize: number): Promise<void> {
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    await Promise.allSettled(batch.map((url) => fetch(url, { method: "POST" })));
  }
}

export function SyncAllButton({ syncUrls }: { syncUrls: string[] }) {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);

  async function handleSyncAll() {
    if (syncUrls.length === 0) return;
    setIsSyncing(true);
    try {
      await runInBatches(syncUrls, CONCURRENCY);
      router.refresh();
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <button
      onClick={handleSyncAll}
      disabled={isSyncing || syncUrls.length === 0}
      className="inline-flex items-center gap-2 rounded-lg border border-white/[0.12] px-3.5 py-2 text-sm font-medium text-ink-primary transition-colors duration-150 hover:border-white/25 hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
      {isSyncing ? "Syncing all…" : "Sync all"}
    </button>
  );
}
