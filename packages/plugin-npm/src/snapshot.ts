export interface NpmStatsSnapshot {
  downloadsLastDay: number | null;
  downloadsLastWeek: number | null;
  downloadsLastMonth: number | null;
  latestVersion: { version: string; publishedAt: string | null } | null;
}

interface KeyedMetric {
  key: string;
  value?: number | null;
  metadata?: unknown;
}

export function buildSnapshotFromMetrics(metrics: KeyedMetric[]): NpmStatsSnapshot {
  const latestByKey = new Map<string, KeyedMetric>();
  for (const metric of metrics) {
    if (!latestByKey.has(metric.key)) latestByKey.set(metric.key, metric);
  }

  const version = latestByKey.get("npm.latest_version")?.metadata as
    | { version: string; publishedAt: string | null }
    | undefined;

  return {
    downloadsLastDay: latestByKey.get("npm.downloads_last_day")?.value ?? null,
    downloadsLastWeek: latestByKey.get("npm.downloads_last_week")?.value ?? null,
    downloadsLastMonth: latestByKey.get("npm.downloads_last_month")?.value ?? null,
    latestVersion: version?.version ? version : null,
  };
}
