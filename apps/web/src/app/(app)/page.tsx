import { redirect } from "next/navigation";
import { FolderPlus, IndianRupee } from "lucide-react";
import { prisma } from "@builderos/db";
import { buildSnapshotFromMetrics as buildRazorpaySnapshot } from "@builderos/plugin-razorpay";
import { RazorpayRevenueWidget } from "@builderos/plugin-razorpay/widget";
import { getCurrentUser } from "@/lib/current-user";
import { buildChips } from "@/lib/rollup";
import { Card } from "@/components/ui/card";
import { ProductGrid } from "@/components/product-grid";
import { SyncAllButton } from "@/components/sync-all-button";
import { MetricChip } from "@/components/metric-chip";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [products, connections] = await Promise.all([
    prisma.product.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: "asc" },
    }),
    prisma.connection.findMany({
      where: { ownerId: user.id },
      include: { snapshots: { orderBy: { occurredAt: "desc" }, take: 50 } },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const razorpayConnection = connections.find((c) => c.pluginSlug === "razorpay" && c.productId === null);
  const syncUrls = connections.map((c) => `/api/connections/${c.id}/sync`);

  const productCards = products.map((product) => ({
    id: product.id,
    name: product.name,
    chips: buildChips(connections.filter((c) => c.productId === product.id)),
  }));

  const aggregateChips = buildChips(connections);

  return (
    <div className="mx-auto max-w-4xl">
      {aggregateChips.length > 0 && (
        <Card className="mb-8">
          <h2 className="text-sm font-medium text-ink-secondary">Overview</h2>
          <p className="mt-1 text-xs text-ink-muted">Rolled up across every product you own.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {aggregateChips.map((chip) => (
              <MetricChip key={chip.pluginSlug} {...chip} />
            ))}
          </div>
        </Card>
      )}

      {razorpayConnection ? (
        <div className="mb-8">
          <RazorpayRevenueWidget
            connectionId={razorpayConnection.id}
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
        <h1 className="text-xl font-semibold text-ink-primary">Your products</h1>
        <div className="flex items-center gap-2">
          <SyncAllButton syncUrls={syncUrls} />
          <a
            href="/products/new"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-3.5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <FolderPlus className="h-4 w-4" />
            New product
          </a>
        </div>
      </div>

      {productCards.length === 0 ? (
        <Card className="mt-6 flex flex-col items-center gap-3 py-10 text-center">
          <FolderPlus className="h-6 w-6 text-ink-muted" />
          <p className="text-sm text-ink-muted">No products yet — create one to connect a repo or package.</p>
        </Card>
      ) : (
        <div className="mt-6">
          <ProductGrid products={productCards} />
        </div>
      )}
    </div>
  );
}
