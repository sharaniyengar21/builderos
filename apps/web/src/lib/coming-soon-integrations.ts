export interface ComingSoonIntegration {
  slug: string;
  name: string;
  description: string;
  iconName: "Package" | "Container" | "CreditCard" | "MessageSquare" | "Triangle" | "Cloud";
}

// Deliberately not part of lib/plugins.ts — that map is reserved for real,
// working Plugin objects. This is just data for an honest "not built yet" grid.
export const comingSoonIntegrations: ComingSoonIntegration[] = [
  { slug: "npm", name: "npm", description: "Downloads, version adoption, dependents.", iconName: "Package" },
  { slug: "docker", name: "Docker Hub", description: "Pulls, tags, image size over time.", iconName: "Container" },
  { slug: "stripe", name: "Stripe", description: "Revenue, subscriptions, churn.", iconName: "CreditCard" },
  { slug: "discord", name: "Discord", description: "Member growth, message activity.", iconName: "MessageSquare" },
  { slug: "vercel", name: "Vercel", description: "Deployments, build status, traffic.", iconName: "Triangle" },
  { slug: "cloudflare", name: "Cloudflare", description: "Requests, bandwidth, cache ratio.", iconName: "Cloud" },
];
