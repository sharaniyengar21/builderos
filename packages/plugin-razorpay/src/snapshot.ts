export interface RazorpayStatsSnapshot {
  revenueLast30d: number | null;
  revenueLast7d: number | null;
  paymentsCountLast30d: number | null;
  currency: string | null;
}

interface KeyedMetric {
  key: string;
  value?: number | null;
  metadata?: unknown;
}

export function buildSnapshotFromMetrics(metrics: KeyedMetric[]): RazorpayStatsSnapshot {
  const latestByKey = new Map<string, KeyedMetric>();
  for (const metric of metrics) {
    if (!latestByKey.has(metric.key)) latestByKey.set(metric.key, metric);
  }

  const currencyMeta = latestByKey.get("razorpay.currency")?.metadata as { currency: string | null } | undefined;

  return {
    revenueLast30d: latestByKey.get("razorpay.revenue_last_30d")?.value ?? null,
    revenueLast7d: latestByKey.get("razorpay.revenue_last_7d")?.value ?? null,
    paymentsCountLast30d: latestByKey.get("razorpay.payments_count_last_30d")?.value ?? null,
    currency: currencyMeta?.currency ?? null,
  };
}
