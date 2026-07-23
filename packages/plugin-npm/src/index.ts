import type { Plugin } from "@builderos/plugin-sdk";
import { fetchPackageSnapshot, verifyPackageExists } from "./client";

export { buildSnapshotFromMetrics, type NpmStatsSnapshot } from "./snapshot";

function requireString(config: Record<string, unknown>, key: string): string {
  const value = config[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`npm plugin config is missing "${key}"`);
  }
  return value.trim();
}

export const npmPlugin: Plugin = {
  metadata: {
    slug: "npm",
    name: "npm",
    description: "Track downloads and version adoption for an npm package.",
    auth: { type: "none" },
    configFields: [
      { name: "packageName", label: "Package name", placeholder: "e.g. next or @scope/name" },
    ],
    primaryMetricKey: "npm.downloads_last_week",
  },
  metrics: [
    { key: "npm.downloads_last_day", label: "Downloads (24h)", unit: "count" },
    { key: "npm.downloads_last_week", label: "Downloads (7d)", unit: "count" },
    { key: "npm.downloads_last_month", label: "Downloads (30d)", unit: "count" },
    { key: "npm.latest_version", label: "Latest version", unit: "none" },
  ],
  events: [{ key: "npm.sync.completed", label: "Sync completed" }],
  actions: [],
  widgets: [{ key: "package-stats", title: "Package stats" }],

  async connect(input) {
    const packageName = requireString(input.config, "packageName");
    await verifyPackageExists(packageName);
    return { externalId: packageName.toLowerCase(), config: { packageName } };
  },

  async sync(ctx) {
    const packageName = requireString(ctx.config, "packageName");
    const startedAt = Date.now();
    const snapshot = await fetchPackageSnapshot(packageName);
    const durationMs = Date.now() - startedAt;

    return {
      metrics: [
        { key: "npm.downloads_last_day", value: snapshot.downloadsLastDay },
        { key: "npm.downloads_last_week", value: snapshot.downloadsLastWeek },
        { key: "npm.downloads_last_month", value: snapshot.downloadsLastMonth },
        {
          key: "npm.latest_version",
          metadata: { version: snapshot.latestVersion, publishedAt: snapshot.publishedAt },
        },
      ],
      events: [{ key: "npm.sync.completed", metadata: { packageName, durationMs } }],
    };
  },
};
