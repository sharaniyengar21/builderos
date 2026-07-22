import type { Plugin } from "@builderos/plugin-sdk";
import { fetchDeploymentsSnapshot, verifyProject } from "./client";

export { buildSnapshotFromMetrics, type VercelStatsSnapshot } from "./snapshot";

function requireString(config: Record<string, unknown>, key: string): string {
  const value = config[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Vercel plugin config is missing "${key}"`);
  }
  return value.trim();
}

function optionalString(config: Record<string, unknown>, key: string): string | undefined {
  const value = config[key];
  return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;
}

export const vercelPlugin: Plugin = {
  metadata: {
    slug: "vercel",
    name: "Vercel",
    description: "Track deployments and build status for a project.",
    auth: {
      type: "pat",
      label: "Personal access token",
      helpUrl: "https://vercel.com/account/tokens",
    },
    configFields: [
      { name: "projectIdOrName", label: "Project ID or name", placeholder: "prj_xxx or my-project" },
      { name: "teamId", label: "Team ID (optional)", placeholder: "team_xxx" },
    ],
    primaryMetricKey: "vercel.deployments_last_24h",
  },
  metrics: [
    { key: "vercel.deployments_last_24h", label: "Deployments (24h)", unit: "count" },
    { key: "vercel.deployments_last_7d", label: "Deployments (7d)", unit: "count" },
    { key: "vercel.latest_deployment_state", label: "Latest deployment", unit: "none" },
  ],
  events: [{ key: "vercel.sync.completed", label: "Sync completed" }],
  actions: [],
  widgets: [{ key: "deployment-stats", title: "Deployment stats" }],

  async connect(input) {
    const projectIdOrName = requireString(input.config, "projectIdOrName");
    const teamId = optionalString(input.config, "teamId");
    if (!input.credential) {
      throw new Error("A Vercel personal access token is required");
    }
    const project = await verifyProject(projectIdOrName, input.credential, teamId);
    return {
      config: { projectId: project.id, projectName: project.name, teamId: teamId ?? null },
      credential: input.credential,
    };
  },

  async sync(ctx) {
    const projectId = requireString(ctx.config, "projectId");
    const teamId = optionalString(ctx.config, "teamId");
    const token = await ctx.getCredential();
    if (!token) {
      throw new Error("No Vercel token stored for this connection");
    }

    const startedAt = Date.now();
    const snapshot = await fetchDeploymentsSnapshot(projectId, token, teamId);
    const durationMs = Date.now() - startedAt;

    return {
      metrics: [
        { key: "vercel.deployments_last_24h", value: snapshot.deploymentsLast24h },
        { key: "vercel.deployments_last_7d", value: snapshot.deploymentsLast7d },
        {
          key: "vercel.latest_deployment_state",
          metadata: snapshot.latestDeployment ? { ...snapshot.latestDeployment } : { state: null },
        },
      ],
      events: [{ key: "vercel.sync.completed", metadata: { projectId, durationMs } }],
    };
  },
};
