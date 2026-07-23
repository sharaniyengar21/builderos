import { PrismaClient, SnapshotKind } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@builderos.dev";

async function seedDemoConnection(
  ownerId: string,
  productId: string,
  pluginSlug: string,
  externalId: string,
  config: Record<string, unknown>,
  snapshots: { kind: SnapshotKind; key: string; value?: number; metadata?: Record<string, unknown> }[],
) {
  const connection = await prisma.connection.upsert({
    where: { productId_pluginSlug_externalId: { productId, pluginSlug, externalId } },
    update: {},
    create: {
      ownerId,
      productId,
      pluginSlug,
      externalId,
      status: "CONNECTED",
      config,
      credentialsEncrypted: null,
      lastSyncedAt: new Date(),
    },
  });

  const existingSnapshots = await prisma.metricSnapshot.count({ where: { connectionId: connection.id } });
  if (existingSnapshots === 0) {
    await prisma.metricSnapshot.createMany({
      data: snapshots.map((snapshot) => ({ connectionId: connection.id, ...snapshot })),
    });
  }
}

async function main() {
  const ownerEmail = process.env.OWNER_EMAIL || "owner@builderos.local";

  await prisma.user.upsert({
    where: { email: ownerEmail },
    update: {},
    create: { email: ownerEmail, name: "Owner", isDemo: false },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: { email: DEMO_EMAIL, name: "Demo", isDemo: true },
  });

  const demoProduct = await prisma.product.upsert({
    where: { slug: "demo" },
    update: {},
    create: { name: "BuilderOS Demo", slug: "demo", ownerId: demoUser.id },
  });

  await seedDemoConnection(demoUser.id, demoProduct.id, "github", "vercel/next.js", { owner: "vercel", repo: "next.js" }, [
    { kind: SnapshotKind.METRIC, key: "github.stars", value: 128_400 },
    { kind: SnapshotKind.METRIC, key: "github.forks", value: 27_100 },
    { kind: SnapshotKind.METRIC, key: "github.open_issues", value: 2_150 },
    { kind: SnapshotKind.METRIC, key: "github.open_prs", value: 410 },
    {
      kind: SnapshotKind.METRIC,
      key: "github.latest_release",
      metadata: { tag: "v15.1.0", publishedAt: "2026-06-01T00:00:00.000Z", url: "https://github.com/vercel/next.js/releases/tag/v15.1.0" },
    },
    { kind: SnapshotKind.EVENT, key: "github.sync.completed", metadata: { owner: "vercel", repo: "next.js", durationMs: 420, seed: true } },
  ]);

  await seedDemoConnection(demoUser.id, demoProduct.id, "npm", "next", { packageName: "next" }, [
    { kind: SnapshotKind.METRIC, key: "npm.downloads_last_day", value: 512_000 },
    { kind: SnapshotKind.METRIC, key: "npm.downloads_last_week", value: 3_400_000 },
    { kind: SnapshotKind.METRIC, key: "npm.downloads_last_month", value: 14_200_000 },
    { kind: SnapshotKind.METRIC, key: "npm.latest_version", metadata: { version: "15.1.0", publishedAt: "2026-06-01T00:00:00.000Z" } },
  ]);

  await seedDemoConnection(
    demoUser.id,
    demoProduct.id,
    "vercel",
    "prj_demo",
    { projectId: "prj_demo", projectName: "next-site", teamId: null },
    [
      { kind: SnapshotKind.METRIC, key: "vercel.deployments_last_24h", value: 6 },
      { kind: SnapshotKind.METRIC, key: "vercel.deployments_last_7d", value: 34 },
      {
        kind: SnapshotKind.METRIC,
        key: "vercel.latest_deployment_state",
        metadata: { state: "READY", url: "next-site.vercel.app", createdAt: Date.now() },
      },
    ],
  );

  await seedDemoConnection(
    demoUser.id,
    demoProduct.id,
    "cloudflare",
    "demo-zone",
    { zoneId: "demo-zone", zoneName: "example.com" },
    [
      { kind: SnapshotKind.METRIC, key: "cloudflare.requests_7d", value: 1_240_000 },
      { kind: SnapshotKind.METRIC, key: "cloudflare.bandwidth_bytes_7d", value: 84_000_000_000 },
      { kind: SnapshotKind.METRIC, key: "cloudflare.threats_blocked_7d", value: 320 },
      { kind: SnapshotKind.METRIC, key: "cloudflare.pageviews_7d", value: 210_000 },
    ],
  );

  // Deliberately no demo account-wide Connection for razorpay — the demo
  // account must never show real-looking business revenue.

  console.log(`Seeded owner (${ownerEmail}) and demo (${DEMO_EMAIL}) users.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
