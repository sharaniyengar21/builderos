import { prisma, SnapshotKind, ConnectionStatus } from "@builderos/db";
import { decryptCredential, encryptCredential } from "@builderos/plugin-sdk";
import { plugins } from "./plugins";

const DEMO_BLOCKED_MESSAGE =
  "This is demo data — self-host your own instance or sign in as yourself to connect a real repo.";

type DemoBlocked = { ok: true; demo: true; message: string };
type Failed = { ok: false; error: string };

export type ConnectPluginResult = { ok: true; demo?: false } | DemoBlocked | Failed;

export type SyncPluginResult =
  | { ok: true; demo?: false; metrics: { key: string; value?: number; metadata?: unknown }[]; lastSyncedAt: string }
  | DemoBlocked
  | Failed;

// Shared by the settings-page server action (direct call) and the sync API
// route (called from the client widget) — one implementation, two callers.
export async function connectPlugin(params: {
  workspaceId: string;
  pluginSlug: string;
  config: Record<string, unknown>;
  credential?: string;
}): Promise<ConnectPluginResult> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: params.workspaceId },
    include: { owner: true },
  });
  if (!workspace) return { ok: false, error: "Workspace not found" };
  if (workspace.owner.isDemo) return { ok: true, demo: true, message: DEMO_BLOCKED_MESSAGE };

  const plugin = plugins[params.pluginSlug];
  if (!plugin) return { ok: false, error: `Unknown plugin "${params.pluginSlug}"` };

  try {
    const result = await plugin.connect({
      workspaceId: params.workspaceId,
      config: params.config,
      credential: params.credential,
    });

    await prisma.pluginConnection.upsert({
      where: { workspaceId_pluginSlug: { workspaceId: params.workspaceId, pluginSlug: params.pluginSlug } },
      update: {
        status: ConnectionStatus.CONNECTED,
        config: result.config as any,
        ...(result.credential ? { credentialsEncrypted: encryptCredential(result.credential) } : {}),
        lastSyncError: null,
      },
      create: {
        workspaceId: params.workspaceId,
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

export async function disconnectPlugin(params: { workspaceId: string; pluginSlug: string }): Promise<ConnectPluginResult> {
  const connection = await prisma.pluginConnection.findUnique({
    where: { workspaceId_pluginSlug: { workspaceId: params.workspaceId, pluginSlug: params.pluginSlug } },
    include: { workspace: { include: { owner: true } } },
  });
  if (!connection) return { ok: false, error: "Not connected" };
  if (connection.workspace.owner.isDemo) return { ok: true, demo: true, message: DEMO_BLOCKED_MESSAGE };

  await prisma.pluginConnection.delete({ where: { id: connection.id } });
  return { ok: true };
}

export async function syncPlugin(params: { workspaceId: string; pluginSlug: string }): Promise<SyncPluginResult> {
  const connection = await prisma.pluginConnection.findUnique({
    where: { workspaceId_pluginSlug: { workspaceId: params.workspaceId, pluginSlug: params.pluginSlug } },
    include: { workspace: { include: { owner: true } } },
  });
  if (!connection) return { ok: false, error: "Not connected" };
  if (connection.workspace.owner.isDemo) return { ok: true, demo: true, message: DEMO_BLOCKED_MESSAGE };

  const plugin = plugins[params.pluginSlug];
  if (!plugin) return { ok: false, error: `Unknown plugin "${params.pluginSlug}"` };

  try {
    const result = await plugin.sync({
      connectionId: connection.id,
      workspaceId: params.workspaceId,
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
      prisma.pluginConnection.update({
        where: { id: connection.id },
        data: { status: ConnectionStatus.CONNECTED, lastSyncedAt: new Date(), lastSyncError: null },
      }),
    ]);

    return { ok: true, metrics: result.metrics, lastSyncedAt: new Date().toISOString() };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    await prisma.pluginConnection.update({
      where: { id: connection.id },
      data: { status: ConnectionStatus.ERROR, lastSyncError: message },
    });
    return { ok: false, error: message };
  }
}
