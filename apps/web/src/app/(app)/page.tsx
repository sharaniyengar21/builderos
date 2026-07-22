import { redirect } from "next/navigation";
import { FolderPlus, IndianRupee } from "lucide-react";
import { prisma } from "@builderos/db";
import { buildSnapshotFromMetrics as buildRazorpaySnapshot } from "@builderos/plugin-razorpay";
import { RazorpayRevenueWidget } from "@builderos/plugin-razorpay/widget";
import { getCurrentUser } from "@/lib/current-user";
import { plugins } from "@/lib/plugins";
import { formatMetricValue } from "@/lib/format-metric";
import { Card } from "@/components/ui/card";
import { WorkspaceGrid } from "@/components/workspace-grid";
import { SyncAllButton } from "@/components/sync-all-button";
import type { MetricChipData } from "@/components/metric-chip";

function buildChips(
  connections: {
    pluginSlug: string;
    status: string;
    lastSyncError: string | null;
    snapshots: { key: string; value: number | null }[];
  }[],
): MetricChipData[] {
  const chips: MetricChipData[] = [];

  for (const connection of connections) {
    const plugin = plugins[connection.pluginSlug];
    if (!plugin) continue;

    const metricDef = plugin.metrics.find((m) => m.key === plugin.metadata.primaryMetricKey);
    const latestByKey = new Map<string, { key: string; value: number | null }>();
    for (const snapshot of connection.snapshots) {
      if (!latestByKey.has(snapshot.key)) latestByKey.set(snapshot.key, snapshot);
    }
    const primarySnapshot = latestByKey.get(plugin.metadata.primaryMetricKey);

    chips.push({
      pluginSlug: connection.pluginSlug,
      label: metricDef?.label ?? plugin.metadata.name,
      value: formatMetricValue(primarySnapshot?.value, metricDef?.unit),
      hasError: connection.status === "ERROR",
      errorMessage: connection.lastSyncError,
    });
  }

  return chips;
}

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [workspaces, accountConnections] = await Promise.all([
    prisma.workspace.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: "asc" },
      include: {
        connections: {
          include: { snapshots: { orderBy: { occurredAt: "desc" }, take: 50 } },
        },
      },
    }),
    prisma.accountConnection.findMany({
      where: { ownerId: user.id },
      include: { snapshots: { orderBy: { occurredAt: "desc" }, take: 50 } },
    }),
  ]);

  const razorpayConnection = accountConnections.find((c) => c.pluginSlug === "razorpay");

  const syncUrls = [
    ...workspaces.flatMap((w) => w.connections.map((c) => `/api/workspaces/${w.id}/plugins/${c.pluginSlug}/sync`)),
    ...accountConnections.map((c) => `/api/account/plugins/${c.pluginSlug}/sync`),
  ];

  const workspaceCards = workspaces.map((workspace) => ({
    id: workspace.id,
    name: workspace.name,
    chips: buildChips(workspace.connections),
  }));

  return (
    <div className="mx-auto max-w-4xl">
      {razorpayConnection ? (
        <div className="mb-8">
          <RazorpayRevenueWidget
            initialSnapshot={buildRazorpaySnapshot(razorpayConnection.snapshots)}
            lastSyncedAt={razorpayConnection.lastSyncedAt?.toISOString() ?? null}
          />
        </div>
      ) : !user.isDemo ? (
        <Card className="mb-8 flex flex-col items-start gap-3">
          <IndianRupee className="h-6 w-6 text-accent-electric" />
          <div>
            <p className="text-sm font-medium text-ink-primary">Connect Razorpay</p>
            <p className="mt-1 text-xs text-ink-muted">Track revenue across your whole business.</p>
          </div>
          <a
            href="/settings/account/razorpay"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-3.5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Connect Razorpay
          </a>
        </Card>
      ) : null}

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink-primary">Your workspaces</h1>
        <div className="flex items-center gap-2">
          <SyncAllButton syncUrls={syncUrls} />
          <a
            href="/workspaces/new"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-3.5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <FolderPlus className="h-4 w-4" />
            New workspace
          </a>
        </div>
      </div>

      {workspaceCards.length === 0 ? (
        <Card className="mt-6 flex flex-col items-center gap-3 py-10 text-center">
          <FolderPlus className="h-6 w-6 text-ink-muted" />
          <p className="text-sm text-ink-muted">No workspaces yet — create one to connect a repo.</p>
        </Card>
      ) : (
        <div className="mt-6">
          <WorkspaceGrid workspaces={workspaceCards} />
        </div>
      )}
    </div>
  );
}
