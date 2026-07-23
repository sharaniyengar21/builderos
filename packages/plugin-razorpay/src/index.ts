import type { Plugin } from "@builderos/plugin-sdk";
import { fetchRevenueSnapshot, splitCredential, verifyCredentials } from "./client";

export { buildSnapshotFromMetrics, type RazorpayStatsSnapshot } from "./snapshot";

export const razorpayPlugin: Plugin = {
  metadata: {
    slug: "razorpay",
    name: "Razorpay",
    description: "Track revenue and payment volume across your business.",
    auth: {
      type: "basic",
      usernameLabel: "Key ID",
      passwordLabel: "Key secret",
      helpUrl: "https://dashboard.razorpay.com/app/keys",
    },
    configFields: [],
    primaryMetricKey: "razorpay.revenue_last_30d",
  },
  metrics: [
    { key: "razorpay.revenue_last_30d", label: "Revenue (30d)", unit: "currency" },
    { key: "razorpay.revenue_last_7d", label: "Revenue (7d)", unit: "currency" },
    { key: "razorpay.payments_count_last_30d", label: "Payments (30d)", unit: "count" },
  ],
  events: [{ key: "razorpay.sync.completed", label: "Sync completed" }],
  actions: [],
  widgets: [{ key: "revenue-stats", title: "Revenue stats" }],

  async connect(input) {
    if (!input.credential) {
      throw new Error("A Razorpay Key ID and Key secret are required");
    }
    const credentials = splitCredential(input.credential);
    await verifyCredentials(credentials);
    return { externalId: "primary", config: {}, credential: input.credential };
  },

  async sync(ctx) {
    const rawCredential = await ctx.getCredential();
    if (!rawCredential) {
      throw new Error("No Razorpay credentials stored for this connection");
    }
    const credentials = splitCredential(rawCredential);

    const startedAt = Date.now();
    const snapshot = await fetchRevenueSnapshot(credentials);
    const durationMs = Date.now() - startedAt;

    return {
      metrics: [
        { key: "razorpay.revenue_last_30d", value: snapshot.revenueLast30d },
        { key: "razorpay.revenue_last_7d", value: snapshot.revenueLast7d },
        { key: "razorpay.payments_count_last_30d", value: snapshot.paymentsCountLast30d },
        { key: "razorpay.currency", metadata: { currency: snapshot.currency } },
      ],
      events: [{ key: "razorpay.sync.completed", metadata: { durationMs } }],
    };
  },
};
