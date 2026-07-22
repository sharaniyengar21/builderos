export interface RepoStatsSnapshot {
  stars: number | null;
  forks: number | null;
  openIssues: number | null;
  openPrs: number | null;
  latestRelease: { tag: string; publishedAt: string; url: string } | null;
}

interface KeyedMetric {
  key: string;
  value?: number | null;
  metadata?: unknown;
}

// Shared between the server-rendered workspace page (reading stored
// MetricSnapshot rows) and the client widget (reading a live sync response) —
// both just need "latest metric per key" turned into the stat-grid shape.
export function buildSnapshotFromMetrics(metrics: KeyedMetric[]): RepoStatsSnapshot {
  const latestByKey = new Map<string, KeyedMetric>();
  for (const metric of metrics) {
    if (!latestByKey.has(metric.key)) latestByKey.set(metric.key, metric);
  }

  const release = latestByKey.get("github.latest_release")?.metadata as
    | { tag: string; publishedAt: string; url: string }
    | undefined;

  return {
    stars: latestByKey.get("github.stars")?.value ?? null,
    forks: latestByKey.get("github.forks")?.value ?? null,
    openIssues: latestByKey.get("github.open_issues")?.value ?? null,
    openPrs: latestByKey.get("github.open_prs")?.value ?? null,
    latestRelease: release?.tag ? release : null,
  };
}
