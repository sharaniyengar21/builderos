import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { connectAccountPlugin } from "@/lib/account-plugin-actions";

export async function POST(request: Request, { params }: { params: Promise<{ pluginSlug: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });

  const { pluginSlug } = await params;
  const body = await request.json().catch(() => ({}));
  const result = await connectAccountPlugin({
    ownerId: user.id,
    pluginSlug,
    config: body.config ?? {},
    credential: body.credential,
  });
  return NextResponse.json(result);
}
