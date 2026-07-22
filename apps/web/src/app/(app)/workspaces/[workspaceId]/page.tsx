import { notFound, redirect } from "next/navigation";
import { prisma } from "@builderos/db";
import { buildSnapshotFromMetrics as buildGithubSnapshot } from "@builderos/plugin-github";
import { RepoStatsWidget } from "@builderos/plugin-github/widget";
import { buildSnapshotFromMetrics as buildNpmSnapshot } from "@builderos/plugin-npm";
import { NpmStatsWidget } from "@builderos/plugin-npm/widget";
import { buildSnapshotFromMetrics as buildVercelSnapshot } from "@builderos/plugin-vercel";
import { VercelStatsWidget } from "@builderos/plugin-vercel/widget";
import { buildSnapshotFromMetrics as buildCloudflareSnapshot } from "@builderos/plugin-cloudflare";
import { CloudflareStatsWidget } from "@builderos/plugin-cloudflare/widget";
import { getCurrentUser } from "@/lib/current-user";
import { plugins } from "@/lib/plugins";
import { Card } from "@/components/ui/card";
import { IntegrationsGrid } from "@/components/integrations-grid";
import { DeleteWorkspaceButton } from "@/components/delete-workspace-button";
import { DisconnectPluginButton } from "@/components/disconnect-plugin-button";
import { deleteWorkspace } from "./actions";

type Connection = {
  pluginSlug: string;
  config: unknown;
  lastSyncedAt: Date | null;
  snapshots: { key: string; value: number | null; metadata: unknown }[];
};

function renderWidget(workspaceId: string, connection: Connection) {
  const config = connection.config as Record<string, string>;
  const lastSyncedAt = connection.lastSyncedAt?.toISOString() ?? null;

  switch (connection.pluginSlug) {
    case "github":
      return (
        <RepoStatsWidget
          workspaceId={workspaceId}
          owner={config.owner}
          repo={config.repo}
          initialSnapshot={buildGithubSnapshot(connection.snapshots)}
          lastSyncedAt={lastSyncedAt}
        />
      );
    case "npm":
      return (
        <NpmStatsWidget
          workspaceId={workspaceId}
          packageName={config.packageName}
          initialSnapshot={buildNpmSnapshot(connection.snapshots)}
          lastSyncedAt={lastSyncedAt}
        />
      );
    case "vercel":
      return (
        <VercelStatsWidget
          workspaceId={workspaceId}
          projectName={config.projectName}
          initialSnapshot={buildVercelSnapshot(connection.snapshots)}
          lastSyncedAt={lastSyncedAt}
        />
      );
    case "cloudflare":
      return (
        <CloudflareStatsWidget
          workspaceId={workspaceId}
          zoneName={config.zoneName}
          initialSnapshot={buildCloudflareSnapshot(connection.snapshots)}
          lastSyncedAt={lastSyncedAt}
        />
      );
    default:
      return null;
  }
}

export default async function WorkspacePage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { workspaceId } = await params;
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      connections: {
        include: { snapshots: { orderBy: { occurredAt: "desc" }, take: 50 } },
      },
    },
  });

  if (!workspace || workspace.ownerId !== user.id) notFound();

  const byPluginSlug = new Map(workspace.connections.map((c) => [c.pluginSlug, c]));

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-xl font-semibold text-ink-primary">{workspace.name}</h1>

      <div className="mt-6 flex flex-col gap-6">
        {Object.values(plugins).map((plugin) => {
          const connection = byPluginSlug.get(plugin.metadata.slug);

          if (connection) {
            return (
              <div key={plugin.metadata.slug}>
                {renderWidget(workspace.id, connection)}
                {!user.isDemo && (
                  <div className="mt-2 flex justify-end">
                    <DisconnectPluginButton
                      disconnectUrl={`/api/workspaces/${workspace.id}/plugins/${plugin.metadata.slug}/disconnect`}
                      name={plugin.metadata.name}
                    />
                  </div>
                )}
              </div>
            );
          }

          return (
            <Card key={plugin.metadata.slug} className="flex flex-col items-start gap-3">
              <div>
                <p className="text-sm font-medium text-ink-primary">Connect {plugin.metadata.name}</p>
                <p className="mt-1 text-xs text-ink-muted">{plugin.metadata.description}</p>
              </div>
              <a
                href={`/workspaces/${workspace.id}/settings/${plugin.metadata.slug}`}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-3.5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Connect {plugin.metadata.name}
              </a>
            </Card>
          );
        })}
      </div>

      <IntegrationsGrid />

      {!user.isDemo && (
        <Card className="mt-10 border-red-500/20">
          <h2 className="text-sm font-medium text-red-300">Danger zone</h2>
          <p className="mt-1 text-xs text-ink-muted">Deleting a workspace removes all its connections and history.</p>
          <div className="mt-4">
            <DeleteWorkspaceButton workspaceId={workspace.id} name={workspace.name} action={deleteWorkspace} />
          </div>
        </Card>
      )}
    </div>
  );
}
