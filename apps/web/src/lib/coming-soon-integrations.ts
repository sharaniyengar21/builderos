export interface ComingSoonIntegration {
  slug: string;
  name: string;
  description: string;
  iconName: "Container" | "CreditCard" | "MessageSquare";
}

// Deliberately not part of lib/plugins.ts — that map is reserved for real,
// working Plugin objects. This is just data for an honest "not built yet" grid.
// npm/Vercel/Cloudflare moved out of this list once they became real plugins.
export const comingSoonIntegrations: ComingSoonIntegration[] = [
  { slug: "docker", name: "Docker Hub", description: "Pulls, tags, image size over time.", iconName: "Container" },
  { slug: "stripe", name: "Stripe", description: "Revenue, subscriptions, churn.", iconName: "CreditCard" },
  { slug: "discord", name: "Discord", description: "Member growth, message activity.", iconName: "MessageSquare" },
];
