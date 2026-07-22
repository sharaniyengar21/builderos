import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { syncAccountPlugin } from "@/lib/account-plugin-actions";

export async function POST(_request: Request, { params }: { params: Promise<{ pluginSlug: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });

  const { pluginSlug } = await params;
  const result = await syncAccountPlugin({ ownerId: user.id, pluginSlug });
  return NextResponse.json(result);
}
