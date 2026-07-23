import type { Plugin } from "@builderos/plugin-sdk";
import { fetchAnalyticsSnapshot, verifyZone } from "./client";

export { buildSnapshotFromMetrics, formatBytes, type CloudflareStatsSnapshot } from "./snapshot";

function requireString(config: Record<string, unknown>, key: string): string {
  const value = config[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Cloudflare plugin config is missing "${key}"`);
  }
  return value.trim();
}

export const cloudflarePlugin: Plugin = {
  metadata: {
    slug: "cloudflare",
    name: "Cloudflare",
    description: "Track requests, bandwidth, and threats blocked for a zone.",
    auth: {
      type: "pat",
      label: "API token",
      helpUrl: "https://dash.cloudflare.com/profile/api-tokens",
    },
    configFields: [
      { name: "zoneId", label: "Zone ID", placeholder: "e.g. 023e105f4ecef8ad9ca31a8372d0c353" },
    ],
    primaryMetricKey: "cloudflare.requests_7d",
  },
  metrics: [
    { key: "cloudflare.requests_7d", label: "Requests (7d)", unit: "count" },
    { key: "cloudflare.bandwidth_bytes_7d", label: "Bandwidth (7d)", unit: "none" },
    { key: "cloudflare.threats_blocked_7d", label: "Threats blocked (7d)", unit: "count" },
    { key: "cloudflare.pageviews_7d", label: "Pageviews (7d)", unit: "count" },
  ],
  events: [{ key: "cloudflare.sync.completed", label: "Sync completed" }],
  actions: [],
  widgets: [{ key: "zone-stats", title: "Zone stats" }],

  async connect(input) {
    const zoneId = requireString(input.config, "zoneId");
    if (!input.credential) {
      throw new Error("A Cloudflare API token is required");
    }
    const zone = await verifyZone(zoneId, input.credential);
    return { externalId: zone.id, config: { zoneId: zone.id, zoneName: zone.name }, credential: input.credential };
  },

  async sync(ctx) {
    const zoneId = requireString(ctx.config, "zoneId");
    const token = await ctx.getCredential();
    if (!token) {
      throw new Error("No Cloudflare token stored for this connection");
    }

    const startedAt = Date.now();
    const snapshot = await fetchAnalyticsSnapshot(zoneId, token);
    const durationMs = Date.now() - startedAt;

    return {
      metrics: [
        { key: "cloudflare.requests_7d", value: snapshot.requests7d },
        { key: "cloudflare.bandwidth_bytes_7d", value: snapshot.bandwidthBytes7d },
        { key: "cloudflare.threats_blocked_7d", value: snapshot.threatsBlocked7d },
        { key: "cloudflare.pageviews_7d", value: snapshot.pageviews7d },
      ],
      events: [{ key: "cloudflare.sync.completed", metadata: { zoneId, durationMs } }],
    };
  },
};
