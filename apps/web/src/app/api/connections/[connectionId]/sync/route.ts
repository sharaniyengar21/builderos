import { NextResponse } from "next/server";
import { prisma } from "@builderos/db";
import { getCurrentUser } from "@/lib/current-user";
import { syncConnection } from "@/lib/connection-actions";

export async function POST(_request: Request, { params }: { params: Promise<{ connectionId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });

  const { connectionId } = await params;
  const connection = await prisma.connection.findUnique({ where: { id: connectionId } });
  if (!connection || connection.ownerId !== user.id) {
    return NextResponse.json({ ok: false, error: "Connection not found" }, { status: 404 });
  }

  const result = await syncConnection(connectionId);
  return NextResponse.json(result);
}
