import { plugins } from "./plugins";
import { accountPlugins } from "./account-plugins";
import { formatMetricValue } from "./format-metric";
import type { MetricChipData } from "@/components/metric-chip";

interface ConnectionForChip {
  pluginSlug: string;
  status: string;
  lastSyncError: string | null;
  snapshots: { key: string; value: number | null }[];
}

function latestValueForKey(snapshots: { key: string; value: number | null }[], key: string): number | null {
  for (const snapshot of snapshots) {
    if (snapshot.key === key) return snapshot.value;
  }
  return null;
}

// One rollup used at two scopes: a single product's connections, or every
// connection across every product + account-wide. Same function either way
// — "aggregate" is just "per-product" applied to a bigger list.
export function buildChips(connections: ConnectionForChip[]): MetricChipData[] {
  const byPlugin = new Map<string, ConnectionForChip[]>();
  for (const connection of connections) {
    const list = byPlugin.get(connection.pluginSlug) ?? [];
    list.push(connection);
    byPlugin.set(connection.pluginSlug, list);
  }

  const chips: MetricChipData[] = [];
  for (const [pluginSlug, conns] of byPlugin) {
    const plugin = plugins[pluginSlug] ?? accountPlugins[pluginSlug];
    if (!plugin) continue;

    const metricDef = plugin.metrics.find((m) => m.key === plugin.metadata.primaryMetricKey);
    // Structural facts (unit "none", e.g. "latest release") don't have a
    // meaningful sum — omit them from the compact chip rather than show NaN.
    if (metricDef?.unit === "none") continue;

    const values = conns.map((c) => latestValueForKey(c.snapshots, plugin.metadata.primaryMetricKey));
    const summed = values.every((v) => v !== null) ? (values as number[]).reduce((a, b) => a + b, 0) : null;
    const hasError = conns.some((c) => c.status === "ERROR");
    const errorMessage = conns.find((c) => c.lastSyncError)?.lastSyncError ?? null;

    chips.push({
      pluginSlug,
      label: metricDef?.label ?? plugin.metadata.name,
      value: formatMetricValue(summed, metricDef?.unit),
      hasError,
      errorMessage,
    });
  }

  return chips;
}
