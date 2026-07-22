import { prisma, SnapshotKind, ConnectionStatus } from "@builderos/db";
import { decryptCredential, encryptCredential } from "@builderos/plugin-sdk";
import { accountPlugins } from "./account-plugins";

const DEMO_BLOCKED_MESSAGE =
  "This is demo data — self-host your own instance or sign in as yourself to connect a real account.";

type DemoBlocked = { ok: true; demo: true; message: string };
type Failed = { ok: false; error: string };

export type ConnectAccountPluginResult = { ok: true; demo?: false } | DemoBlocked | Failed;

export type SyncAccountPluginResult =
  | { ok: true; demo?: false; metrics: { key: string; value?: number; metadata?: unknown }[]; lastSyncedAt: string }
  | DemoBlocked
  | Failed;

// Mirrors plugin-actions.ts exactly, keyed by ownerId instead of
// workspaceId. The demo guard here checks user.isDemo directly rather than
// via a workspace indirection — the public demo login must never be able to
// write real credentials into the shared demo account's AccountConnection.
export async function connectAccountPlugin(params: {
  ownerId: string;
  pluginSlug: string;
  config: Record<string, unknown>;
  credential?: string;
}): Promise<ConnectAccountPluginResult> {
  const user = await prisma.user.findUnique({ where: { id: params.ownerId } });
  if (!user) return { ok: false, error: "Account not found" };
  if (user.isDemo) return { ok: true, demo: true, message: DEMO_BLOCKED_MESSAGE };

  const plugin = accountPlugins[params.pluginSlug];
  if (!plugin) return { ok: false, error: `Unknown plugin "${params.pluginSlug}"` };

  try {
    const result = await plugin.connect({ config: params.config, credential: params.credential });

    await prisma.accountConnection.upsert({
      where: { ownerId_pluginSlug: { ownerId: params.ownerId, pluginSlug: params.pluginSlug } },
      update: {
        status: ConnectionStatus.CONNECTED,
        config: result.config as any,
        ...(result.credential ? { credentialsEncrypted: encryptCredential(result.credential) } : {}),
        lastSyncError: null,
      },
      create: {
        ownerId: params.ownerId,
        pluginSlug: params.pluginSlug,
        status: ConnectionStatus.CONNECTED,
        config: result.config as any,
        credentialsEncrypted: result.credential ? encryptCredential(result.credential) : null,
      },
    });

    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Connect failed" };
  }
}

export async function disconnectAccountPlugin(params: { ownerId: string; pluginSlug: string }): Promise<ConnectAccountPluginResult> {
  const connection = await prisma.accountConnection.findUnique({
    where: { ownerId_pluginSlug: { ownerId: params.ownerId, pluginSlug: params.pluginSlug } },
    include: { owner: true },
  });
  if (!connection) return { ok: false, error: "Not connected" };
  if (connection.owner.isDemo) return { ok: true, demo: true, message: DEMO_BLOCKED_MESSAGE };

  await prisma.accountConnection.delete({ where: { id: connection.id } });
  return { ok: true };
}

export async function syncAccountPlugin(params: { ownerId: string; pluginSlug: string }): Promise<SyncAccountPluginResult> {
  const connection = await prisma.accountConnection.findUnique({
    where: { ownerId_pluginSlug: { ownerId: params.ownerId, pluginSlug: params.pluginSlug } },
    include: { owner: true },
  });
  if (!connection) return { ok: false, error: "Not connected" };
  if (connection.owner.isDemo) return { ok: true, demo: true, message: DEMO_BLOCKED_MESSAGE };

  const plugin = accountPlugins[params.pluginSlug];
  if (!plugin) return { ok: false, error: `Unknown plugin "${params.pluginSlug}"` };

  try {
    const result = await plugin.sync({
      connectionId: connection.id,
      config: connection.config as Record<string, unknown>,
      getCredential: async () =>
        connection.credentialsEncrypted ? decryptCredential(connection.credentialsEncrypted) : null,
    });

    await prisma.$transaction([
      ...result.metrics.map((metric) =>
        prisma.accountMetricSnapshot.create({
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
        prisma.accountMetricSnapshot.create({
          data: {
            connectionId: connection.id,
            kind: SnapshotKind.EVENT,
            key: event.key,
            metadata: event.metadata as any,
            occurredAt: event.occurredAt ?? new Date(),
          },
        }),
      ),
      prisma.accountConnection.update({
        where: { id: connection.id },
        data: { status: ConnectionStatus.CONNECTED, lastSyncedAt: new Date(), lastSyncError: null },
      }),
    ]);

    return { ok: true, metrics: result.metrics, lastSyncedAt: new Date().toISOString() };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    await prisma.accountConnection.update({
      where: { id: connection.id },
      data: { status: ConnectionStatus.ERROR, lastSyncError: message },
    });
    return { ok: false, error: message };
  }
}
