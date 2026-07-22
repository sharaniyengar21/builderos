export interface VercelProject {
  id: string;
  name: string;
}

export interface VercelDeployment {
  url: string;
  state: string;
  createdAt: number;
}

export interface VercelDeploymentsSnapshot {
  deploymentsLast24h: number;
  deploymentsLast7d: number;
  latestDeployment: VercelDeployment | null;
}

class VercelApiError extends Error {}

function withTeam(url: string, teamId?: string): string {
  if (!teamId) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}teamId=${encodeURIComponent(teamId)}`;
}

export async function verifyProject(projectIdOrName: string, token: string, teamId?: string): Promise<VercelProject> {
  const url = withTeam(`https://api.vercel.com/v9/projects/${encodeURIComponent(projectIdOrName)}`, teamId);
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

  if (response.status === 401 || response.status === 403) {
    throw new VercelApiError("That Vercel token was rejected — check it has access to this project");
  }
  if (response.status === 404) {
    throw new VercelApiError(`Vercel project "${projectIdOrName}" was not found`);
  }
  if (!response.ok) {
    throw new VercelApiError(`Vercel API request failed (HTTP ${response.status})`);
  }
  const json = await response.json();
  return { id: json.id, name: json.name };
}

export async function fetchDeploymentsSnapshot(
  projectId: string,
  token: string,
  teamId?: string,
): Promise<VercelDeploymentsSnapshot> {
  const url = withTeam(`https://api.vercel.com/v6/deployments?projectId=${encodeURIComponent(projectId)}&limit=50`, teamId);
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

  if (!response.ok) {
    throw new VercelApiError(`Vercel deployments request failed (HTTP ${response.status})`);
  }
  const json = await response.json();
  const deployments: { url: string; state: string; created: number }[] = json.deployments ?? [];

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const weekMs = 7 * dayMs;

  const deploymentsLast24h = deployments.filter((d) => now - d.created <= dayMs).length;
  const deploymentsLast7d = deployments.filter((d) => now - d.created <= weekMs).length;
  const latest = deployments[0];

  return {
    deploymentsLast24h,
    deploymentsLast7d,
    latestDeployment: latest ? { url: latest.url, state: latest.state, createdAt: latest.created } : null,
  };
}
