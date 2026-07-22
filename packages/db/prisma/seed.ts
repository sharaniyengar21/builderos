import { PrismaClient, SnapshotKind } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@builderos.dev";

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

  const demoWorkspace = await prisma.workspace.upsert({
    where: { slug: "demo" },
    update: {},
    create: { name: "BuilderOS Demo", slug: "demo", ownerId: demoUser.id },
  });

  const demoConnection = await prisma.pluginConnection.upsert({
    where: { workspaceId_pluginSlug: { workspaceId: demoWorkspace.id, pluginSlug: "github" } },
    update: {},
    create: {
      workspaceId: demoWorkspace.id,
      pluginSlug: "github",
      status: "CONNECTED",
      config: { owner: "vercel", repo: "next.js" },
      credentialsEncrypted: null,
      lastSyncedAt: new Date(),
    },
  });

  const existingSnapshots = await prisma.metricSnapshot.count({
    where: { connectionId: demoConnection.id },
  });

  if (existingSnapshots === 0) {
    await prisma.metricSnapshot.createMany({
      data: [
        { connectionId: demoConnection.id, kind: SnapshotKind.METRIC, key: "github.stars", value: 128_400 },
        { connectionId: demoConnection.id, kind: SnapshotKind.METRIC, key: "github.forks", value: 27_100 },
        { connectionId: demoConnection.id, kind: SnapshotKind.METRIC, key: "github.open_issues", value: 2_150 },
        { connectionId: demoConnection.id, kind: SnapshotKind.METRIC, key: "github.open_prs", value: 410 },
        {
          connectionId: demoConnection.id,
          kind: SnapshotKind.METRIC,
          key: "github.latest_release",
          metadata: { tag: "v15.1.0", publishedAt: "2026-06-01T00:00:00.000Z", url: "https://github.com/vercel/next.js/releases/tag/v15.1.0" },
        },
        {
          connectionId: demoConnection.id,
          kind: SnapshotKind.EVENT,
          key: "github.sync.completed",
          metadata: { owner: "vercel", repo: "next.js", durationMs: 420, seed: true },
        },
      ],
    });
  }

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
