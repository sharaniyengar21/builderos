import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function computeExternalId(pluginSlug: string, config: unknown): string {
  const c = (config ?? {}) as Record<string, unknown>;
  switch (pluginSlug) {
    case "github":
      return `${c.owner}/${c.repo}`.toLowerCase();
    case "npm":
      return String(c.packageName).toLowerCase();
    case "vercel":
      return String(c.projectId);
    case "cloudflare":
      return String(c.zoneId);
    default:
      throw new Error(`No externalId rule for plugin "${pluginSlug}" — add one before backfilling`);
  }
}

async function main() {
  const connections = await prisma.pluginConnection.findMany({ where: { externalId: null } });
  for (const connection of connections) {
    const externalId = computeExternalId(connection.pluginSlug, connection.config);
    await prisma.pluginConnection.update({ where: { id: connection.id }, data: { externalId } });
  }
  console.log(`Backfilled externalId on ${connections.length} PluginConnection row(s).`);

  const accountConnections = await prisma.accountConnection.findMany({ where: { externalId: null } });
  for (const connection of accountConnections) {
    await prisma.accountConnection.update({ where: { id: connection.id }, data: { externalId: "primary" } });
  }
  console.log(`Backfilled externalId on ${accountConnections.length} AccountConnection row(s).`);

  const remaining =
    (await prisma.pluginConnection.count({ where: { externalId: null } })) +
    (await prisma.accountConnection.count({ where: { externalId: null } }));
  if (remaining > 0) {
    throw new Error(`${remaining} row(s) still have a NULL externalId — do not proceed to the next migration`);
  }
  console.log("Gate check passed: zero NULL externalId rows remain.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
