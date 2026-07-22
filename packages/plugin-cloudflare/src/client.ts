export interface CloudflareZone {
  id: string;
  name: string;
}

export interface CloudflareAnalyticsSnapshot {
  requests7d: number;
  bandwidthBytes7d: number;
  threatsBlocked7d: number;
  pageviews7d: number;
}

class CloudflareApiError extends Error {}

async function parseCloudflareResponse(response: Response, notFoundMessage: string): Promise<any> {
  const json = await response.json().catch(() => null);

  if (response.status === 401 || response.status === 403) {
    throw new CloudflareApiError(
      "That Cloudflare API token was rejected — check it has Zone → Analytics → Read access",
    );
  }
  if (response.status === 404) {
    throw new CloudflareApiError(notFoundMessage);
  }
  if (!response.ok || json?.success === false) {
    const message = json?.errors?.[0]?.message;
    throw new CloudflareApiError(message ? `Cloudflare API error: ${message}` : `Cloudflare API request failed (HTTP ${response.status})`);
  }
  return json;
}

export async function verifyZone(zoneId: string, token: string): Promise<CloudflareZone> {
  const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseCloudflareResponse(response, `Cloudflare zone "${zoneId}" was not found`);
  return { id: json.result.id, name: json.result.name };
}

export async function fetchAnalyticsSnapshot(zoneId: string, token: string): Promise<CloudflareAnalyticsSnapshot> {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/analytics/dashboard?since=-10080&until=0`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const json = await parseCloudflareResponse(response, `Cloudflare zone "${zoneId}" was not found`);
  const totals = json.result?.totals ?? {};

  return {
    requests7d: totals.requests?.all ?? 0,
    bandwidthBytes7d: totals.bandwidth?.all ?? 0,
    threatsBlocked7d: totals.threats?.all ?? 0,
    pageviews7d: totals.pageviews?.all ?? 0,
  };
}
