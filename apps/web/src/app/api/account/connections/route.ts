import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { connectConnection } from "@/lib/connection-actions";
import { accountPlugins } from "@/lib/account-plugins";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const pluginSlug = String(body.pluginSlug ?? "");
  const plugin = accountPlugins[pluginSlug];
  if (!plugin) return NextResponse.json({ ok: false, error: `Unknown plugin "${pluginSlug}"` }, { status: 400 });

  const result = await connectConnection({
    ownerId: user.id,
    productId: null,
    pluginSlug,
    plugin,
    config: body.config ?? {},
    credential: body.credential,
  });
  return NextResponse.json(result);
}
