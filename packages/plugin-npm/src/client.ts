export interface NpmPackageSnapshot {
  latestVersion: string;
  publishedAt: string | null;
  downloadsLastDay: number;
  downloadsLastWeek: number;
  downloadsLastMonth: number;
}

class NpmApiError extends Error {}

function encodePackageName(name: string): string {
  return name
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export async function verifyPackageExists(packageName: string): Promise<void> {
  const response = await fetch(`https://registry.npmjs.org/${encodePackageName(packageName)}`);
  if (response.status === 404) {
    throw new NpmApiError(`Package "${packageName}" was not found on npm`);
  }
  if (!response.ok) {
    throw new NpmApiError(`npm registry request failed (HTTP ${response.status})`);
  }
}

async function fetchDownloads(packageName: string, period: "last-day" | "last-week" | "last-month"): Promise<number> {
  const response = await fetch(`https://api.npmjs.org/downloads/point/${period}/${encodePackageName(packageName)}`);
  if (!response.ok) {
    // npm's downloads API 404s for packages with no recorded download history yet — treat as zero.
    if (response.status === 404) return 0;
    throw new NpmApiError(`npm downloads API request failed (HTTP ${response.status})`);
  }
  const json = await response.json();
  return typeof json.downloads === "number" ? json.downloads : 0;
}

export async function fetchPackageSnapshot(packageName: string): Promise<NpmPackageSnapshot> {
  const encoded = encodePackageName(packageName);
  const [registryResponse, day, week, month] = await Promise.all([
    fetch(`https://registry.npmjs.org/${encoded}`),
    fetchDownloads(packageName, "last-day"),
    fetchDownloads(packageName, "last-week"),
    fetchDownloads(packageName, "last-month"),
  ]);

  if (!registryResponse.ok) {
    throw new NpmApiError(`Package "${packageName}" not found on npm (HTTP ${registryResponse.status})`);
  }
  const registry = await registryResponse.json();
  const latestVersion = registry["dist-tags"]?.latest ?? null;
  if (!latestVersion) {
    throw new NpmApiError(`Could not determine the latest version for "${packageName}"`);
  }

  return {
    latestVersion,
    publishedAt: registry.time?.[latestVersion] ?? null,
    downloadsLastDay: day,
    downloadsLastWeek: week,
    downloadsLastMonth: month,
  };
}
