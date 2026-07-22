export interface VercelStatsSnapshot {
  deploymentsLast24h: number | null;
  deploymentsLast7d: number | null;
  latestDeployment: { url: string; state: string; createdAt: number } | null;
}

interface KeyedMetric {
  key: string;
  value?: number | null;
  metadata?: unknown;
}

export function buildSnapshotFromMetrics(metrics: KeyedMetric[]): VercelStatsSnapshot {
  const latestByKey = new Map<string, KeyedMetric>();
  for (const metric of metrics) {
    if (!latestByKey.has(metric.key)) latestByKey.set(metric.key, metric);
  }

  const latest = latestByKey.get("vercel.latest_deployment_state")?.metadata as
    | { url: string; state: string; createdAt: number }
    | undefined;

  return {
    deploymentsLast24h: latestByKey.get("vercel.deployments_last_24h")?.value ?? null,
    deploymentsLast7d: latestByKey.get("vercel.deployments_last_7d")?.value ?? null,
    latestDeployment: latest?.state ? latest : null,
  };
}
