import type { Plugin } from "@builderos/plugin-sdk";
import { githubPlugin } from "@builderos/plugin-github";
import { npmPlugin } from "@builderos/plugin-npm";
import { vercelPlugin } from "@builderos/plugin-vercel";
import { cloudflarePlugin } from "@builderos/plugin-cloudflare";

// Adding a new integration means adding one entry here — routes and pages
// dispatch on the slug generically, they never import a specific plugin.
export const plugins: Record<string, Plugin> = {
  github: githubPlugin,
  npm: npmPlugin,
  vercel: vercelPlugin,
  cloudflare: cloudflarePlugin,
};
