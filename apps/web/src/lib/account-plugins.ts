import type { Plugin } from "@builderos/plugin-sdk";
import { razorpayPlugin } from "@builderos/plugin-razorpay";

// Account-wide integrations — one per business, not tied to a product.
// Same registry pattern as lib/plugins.ts, just a separate namespace since
// these persist as a Connection with productId: null.
export const accountPlugins: Record<string, Plugin> = {
  razorpay: razorpayPlugin,
};
