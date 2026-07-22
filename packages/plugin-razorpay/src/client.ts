export interface RazorpayCredentialPair {
  keyId: string;
  keySecret: string;
}

export interface RazorpayRevenueSnapshot {
  revenueLast30d: number;
  revenueLast7d: number;
  paymentsCountLast30d: number;
  currency: string | null;
}

class RazorpayApiError extends Error {}

export function splitCredential(credential: string): RazorpayCredentialPair {
  const separatorIndex = credential.indexOf(":");
  if (separatorIndex === -1) {
    throw new RazorpayApiError('Expected "Key ID:Key secret" — no ":" separator found');
  }
  return {
    keyId: credential.slice(0, separatorIndex),
    keySecret: credential.slice(separatorIndex + 1),
  };
}

function authHeader({ keyId, keySecret }: RazorpayCredentialPair): string {
  const encoded = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  return `Basic ${encoded}`;
}

async function razorpayFetch(path: string, credentials: RazorpayCredentialPair): Promise<any> {
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    headers: { Authorization: authHeader(credentials) },
  });

  if (response.status === 401) {
    throw new RazorpayApiError("That Razorpay key pair was rejected — check the Key ID and Key secret");
  }
  if (!response.ok) {
    throw new RazorpayApiError(`Razorpay API request failed (HTTP ${response.status})`);
  }
  return response.json();
}

export async function verifyCredentials(credentials: RazorpayCredentialPair): Promise<void> {
  await razorpayFetch("/payments?count=1", credentials);
}

const MAX_PAGES = 5;
const PAGE_SIZE = 100;

export async function fetchRevenueSnapshot(credentials: RazorpayCredentialPair): Promise<RazorpayRevenueSnapshot> {
  const now = Math.floor(Date.now() / 1000);
  const from30d = now - 30 * 24 * 60 * 60;
  const from7d = now - 7 * 24 * 60 * 60;

  let revenueLast30d = 0;
  let revenueLast7d = 0;
  let paymentsCountLast30d = 0;
  let currency: string | null = null;

  for (let page = 0; page < MAX_PAGES; page++) {
    const skip = page * PAGE_SIZE;
    const json = await razorpayFetch(`/payments?from=${from30d}&count=${PAGE_SIZE}&skip=${skip}`, credentials);
    const items: { amount: number; currency: string; status: string; created_at: number }[] = json.items ?? [];

    for (const item of items) {
      if (item.status !== "captured") continue;
      currency ??= item.currency;
      const majorUnits = item.amount / 100;
      revenueLast30d += majorUnits;
      paymentsCountLast30d += 1;
      if (item.created_at >= from7d) revenueLast7d += majorUnits;
    }

    if (items.length < PAGE_SIZE) break;
  }

  return { revenueLast30d, revenueLast7d, paymentsCountLast30d, currency };
}
