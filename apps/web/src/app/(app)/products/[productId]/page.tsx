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
import { DeleteProductButton } from "@/components/delete-product-button";
import { DisconnectPluginButton } from "@/components/disconnect-plugin-button";
import { deleteProduct } from "./actions";

type ConnectionRow = {
  id: string;
  pluginSlug: string;
  config: unknown;
  lastSyncedAt: Date | null;
  snapshots: { key: string; value: number | null; metadata: unknown }[];
};

function renderWidget(connection: ConnectionRow) {
  const config = connection.config as Record<string, string>;
  const lastSyncedAt = connection.lastSyncedAt?.toISOString() ?? null;

  switch (connection.pluginSlug) {
    case "github":
      return (
        <RepoStatsWidget
          connectionId={connection.id}
          owner={config.owner}
          repo={config.repo}
          initialSnapshot={buildGithubSnapshot(connection.snapshots)}
          lastSyncedAt={lastSyncedAt}
        />
      );
    case "npm":
      return (
        <NpmStatsWidget
          connectionId={connection.id}
          packageName={config.packageName}
          initialSnapshot={buildNpmSnapshot(connection.snapshots)}
          lastSyncedAt={lastSyncedAt}
        />
      );
    case "vercel":
      return (
        <VercelStatsWidget
          connectionId={connection.id}
          projectName={config.projectName}
          initialSnapshot={buildVercelSnapshot(connection.snapshots)}
          lastSyncedAt={lastSyncedAt}
        />
      );
    case "cloudflare":
      return (
        <CloudflareStatsWidget
          connectionId={connection.id}
          zoneName={config.zoneName}
          initialSnapshot={buildCloudflareSnapshot(connection.snapshots)}
          lastSyncedAt={lastSyncedAt}
        />
      );
    default:
      return null;
  }
}

export default async function ProductPage({ params }: { params: Promise<{ productId: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { productId } = await params;
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      connections: {
        include: { snapshots: { orderBy: { occurredAt: "desc" }, take: 50 } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!product || product.ownerId !== user.id) notFound();

  const byPluginSlug = new Map<string, ConnectionRow[]>();
  for (const connection of product.connections) {
    const list = byPluginSlug.get(connection.pluginSlug) ?? [];
    list.push(connection);
    byPluginSlug.set(connection.pluginSlug, list);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-xl font-semibold text-ink-primary">{product.name}</h1>

      <div className="mt-6 flex flex-col gap-8">
        {Object.values(plugins).map((plugin) => {
          const connections = byPluginSlug.get(plugin.metadata.slug) ?? [];

          return (
            <div key={plugin.metadata.slug} className="flex flex-col gap-4">
              {connections.map((connection) => (
                <div key={connection.id}>
                  {renderWidget(connection)}
                  {!user.isDemo && (
                    <div className="mt-2 flex justify-end">
                      <DisconnectPluginButton
                        disconnectUrl={`/api/connections/${connection.id}/disconnect`}
                        name={plugin.metadata.name}
                      />
                    </div>
                  )}
                </div>
              ))}

              <Card className="flex flex-col items-start gap-3">
                <div>
                  <p className="text-sm font-medium text-ink-primary">
                    {connections.length === 0 ? `Connect ${plugin.metadata.name}` : `Add another ${plugin.metadata.name}`}
                  </p>
                  <p className="mt-1 text-xs text-ink-muted">{plugin.metadata.description}</p>
                </div>
                <a
                  href={`/products/${product.id}/settings/${plugin.metadata.slug}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-3.5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  {connections.length === 0 ? `Connect ${plugin.metadata.name}` : `Add another`}
                </a>
              </Card>
            </div>
          );
        })}
      </div>

      <IntegrationsGrid />

      {!user.isDemo && (
        <Card className="mt-10 border-red-500/20">
          <h2 className="text-sm font-medium text-red-300">Danger zone</h2>
          <p className="mt-1 text-xs text-ink-muted">Deleting a product removes all its connections and history.</p>
          <div className="mt-4">
            <DeleteProductButton productId={product.id} name={product.name} action={deleteProduct} />
          </div>
        </Card>
      )}
    </div>
  );
}
