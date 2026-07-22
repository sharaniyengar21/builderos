import type { Plugin } from "@builderos/plugin-sdk";
import { fetchRepoSnapshot, verifyRepoAccess } from "./client";

export { buildSnapshotFromMetrics, type RepoStatsSnapshot } from "./snapshot";

function requireString(config: Record<string, unknown>, key: string): string {
  const value = config[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`GitHub plugin config is missing "${key}"`);
  }
  return value.trim();
}

export const githubPlugin: Plugin = {
  metadata: {
    slug: "github",
    name: "GitHub",
    description: "Track stars, forks, open issues/PRs, and releases for a repository.",
    auth: {
      type: "pat",
      label: "Personal access token",
      helpUrl: "https://github.com/settings/tokens",
    },
  },
  metrics: [
    { key: "github.stars", label: "Stars", unit: "count" },
    { key: "github.forks", label: "Forks", unit: "count" },
    { key: "github.open_issues", label: "Open issues", unit: "count" },
    { key: "github.open_prs", label: "Open pull requests", unit: "count" },
    { key: "github.latest_release", label: "Latest release", unit: "none" },
  ],
  events: [{ key: "github.sync.completed", label: "Sync completed" }],
  actions: [],
  widgets: [{ key: "repo-stats", title: "Repository stats" }],

  async connect(input) {
    const owner = requireString(input.config, "owner");
    const repo = requireString(input.config, "repo");
    if (!input.credential) {
      throw new Error("A personal access token is required to connect a GitHub repository");
    }
    await verifyRepoAccess(owner, repo, input.credential);
    return { config: { owner, repo }, credential: input.credential };
  },

  async sync(ctx) {
    const owner = requireString(ctx.config, "owner");
    const repo = requireString(ctx.config, "repo");
    const token = await ctx.getCredential();
    if (!token) {
      throw new Error("No GitHub token stored for this connection");
    }

    const startedAt = Date.now();
    const snapshot = await fetchRepoSnapshot(owner, repo, token);
    const durationMs = Date.now() - startedAt;

    return {
      metrics: [
        { key: "github.stars", value: snapshot.stars },
        { key: "github.forks", value: snapshot.forks },
        { key: "github.open_issues", value: snapshot.openIssues },
        { key: "github.open_prs", value: snapshot.openPrs },
        {
          key: "github.latest_release",
          metadata: snapshot.latestRelease ?? { tag: null },
        },
      ],
      events: [{ key: "github.sync.completed", metadata: { owner, repo, durationMs } }],
    };
  },
};
