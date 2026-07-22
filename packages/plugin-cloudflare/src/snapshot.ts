export interface CloudflareStatsSnapshot {
  requests7d: number | null;
  bandwidthBytes7d: number | null;
  threatsBlocked7d: number | null;
  pageviews7d: number | null;
}

interface KeyedMetric {
  key: string;
  value?: number | null;
}

export function buildSnapshotFromMetrics(metrics: KeyedMetric[]): CloudflareStatsSnapshot {
  const latestByKey = new Map<string, KeyedMetric>();
  for (const metric of metrics) {
    if (!latestByKey.has(metric.key)) latestByKey.set(metric.key, metric);
  }

  return {
    requests7d: latestByKey.get("cloudflare.requests_7d")?.value ?? null,
    bandwidthBytes7d: latestByKey.get("cloudflare.bandwidth_bytes_7d")?.value ?? null,
    threatsBlocked7d: latestByKey.get("cloudflare.threats_blocked_7d")?.value ?? null,
    pageviews7d: latestByKey.get("cloudflare.pageviews_7d")?.value ?? null,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes;
  let unitIndex = -1;
  do {
    value /= 1024;
    unitIndex++;
  } while (value >= 1024 && unitIndex < units.length - 1);
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}
