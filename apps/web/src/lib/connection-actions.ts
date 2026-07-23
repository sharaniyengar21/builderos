import { prisma, SnapshotKind, ConnectionStatus } from "@builderos/db";
import { decryptCredential, encryptCredential, type Plugin } from "@builderos/plugin-sdk";
import { plugins } from "./plugins";
import { accountPlugins } from "./account-plugins";

const DEMO_BLOCKED_MESSAGE =
  "This is demo data — self-host your own instance or sign in as yourself to connect a real one.";

type DemoBlocked = { ok: true; demo: true; message: string };
type Failed = { ok: false; error: string };

export type ConnectResult = { ok: true; demo?: false; connectionId: string } | DemoBlocked | Failed;
export type ActionResult = { ok: true; demo?: false } | DemoBlocked | Failed;
export type SyncResult =
  | { ok: true; demo?: false; metrics: { key: string; value?: number; metadata?: unknown }[]; lastSyncedAt: string }
  | DemoBlocked
  | Failed;

function resolvePlugin(pluginSlug: string): Plugin | undefined {
  return plugins[pluginSlug] ?? accountPlugins[pluginSlug];
}

// Replaces plugin-actions.ts + account-plugin-actions.ts. Product-scoped and
// account-wide connections are the same row shape now (productId null =
// account-wide) so there's one implementation instead of two parallel ones.
export async function connectConnection(params: {
  ownerId: string;
  productId: string | null;
  pluginSlug: string;
  plugin: Plugin;
  config: Record<string, unknown>;
  credential?: string;
}): Promise<ConnectResult> {
  const user = await prisma.user.findUnique({ where: { id: params.ownerId } });
  if (!user) return { ok: false, error: "Account not found" };
  if (user.isDemo) return { ok: true, demo: true, message: DEMO_BLOCKED_MESSAGE };

  try {
    const result = await params.plugin.connect({
      productId: params.productId ?? undefined,
      config: params.config,
      credential: params.credential,
    });

    const existing = await prisma.connection.findFirst({
      where: { productId: params.productId, pluginSlug: params.pluginSlug, externalId: result.externalId },
    });

    const data = {
      status: ConnectionStatus.CONNECTED,
      config: result.config as any,
      ...(result.credential ? { credentialsEncrypted: encryptCredential(result.credential) } : {}),
      lastSyncError: null,
    };

    const connection = existing
      ? await prisma.connection.update({ where: { id: existing.id }, data })
      : await prisma.connection.create({
          data: {
            ...data,
            ownerId: params.ownerId,
            productId: params.productId,
            pluginSlug: params.pluginSlug,
            externalId: result.externalId,
          },
        });

    return { ok: true, connectionId: connection.id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Connect failed" };
  }
}

export async function disconnectConnection(connectionId: string): Promise<ActionResult> {
  const connection = await prisma.connection.findUnique({
    where: { id: connectionId },
    include: { owner: true },
  });
  if (!connection) return { ok: false, error: "Not connected" };
  if (connection.owner.isDemo) return { ok: true, demo: true, message: DEMO_BLOCKED_MESSAGE };

  await prisma.connection.delete({ where: { id: connection.id } });
  return { ok: true };
}

export async function syncConnection(connectionId: string): Promise<SyncResult> {
  const connection = await prisma.connection.findUnique({
    where: { id: connectionId },
    include: { owner: true },
  });
  if (!connection) return { ok: false, error: "Not connected" };
  if (connection.owner.isDemo) return { ok: true, demo: true, message: DEMO_BLOCKED_MESSAGE };

  const plugin = resolvePlugin(connection.pluginSlug);
  if (!plugin) return { ok: false, error: `Unknown plugin "${connection.pluginSlug}"` };

  try {
    const result = await plugin.sync({
      connectionId: connection.id,
      productId: connection.productId ?? undefined,
      config: connection.config as Record<string, unknown>,
      getCredential: async () =>
        connection.credentialsEncrypted ? decryptCredential(connection.credentialsEncrypted) : null,
    });

    await prisma.$transaction([
      ...result.metrics.map((metric) =>
        prisma.metricSnapshot.create({
          data: {
            connectionId: connection.id,
            kind: SnapshotKind.METRIC,
            key: metric.key,
            value: metric.value ?? null,
            metadata: metric.metadata as any,
          },
        }),
      ),
      ...(result.events ?? []).map((event) =>
        prisma.metricSnapshot.create({
          data: {
            connectionId: connection.id,
            kind: SnapshotKind.EVENT,
            key: event.key,
            metadata: event.metadata as any,
            occurredAt: event.occurredAt ?? new Date(),
          },
        }),
      ),
      prisma.connection.update({
        where: { id: connection.id },
        data: { status: ConnectionStatus.CONNECTED, lastSyncedAt: new Date(), lastSyncError: null },
      }),
    ]);

    return { ok: true, metrics: result.metrics, lastSyncedAt: new Date().toISOString() };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    await prisma.connection.update({
      where: { id: connection.id },
      data: { status: ConnectionStatus.ERROR, lastSyncError: message },
    });
    return { ok: false, error: message };
  }
}
