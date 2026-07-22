import { NextResponse } from "next/server";
import { prisma } from "@builderos/db";
import { getCurrentUser } from "@/lib/current-user";
import { syncPlugin } from "@/lib/plugin-actions";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ workspaceId: string; pluginSlug: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });

  const { workspaceId, pluginSlug } = await params;
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace || workspace.ownerId !== user.id) {
    return NextResponse.json({ ok: false, error: "Workspace not found" }, { status: 404 });
  }

  const result = await syncPlugin({ workspaceId, pluginSlug });
  return NextResponse.json(result);
}
