import type { Plugin } from "@builderos/plugin-sdk";
import { githubPlugin } from "@builderos/plugin-github";

// Adding a new integration means adding one entry here — routes and pages
// dispatch on the slug generically, they never import a specific plugin.
export const plugins: Record<string, Plugin> = {
  github: githubPlugin,
};
