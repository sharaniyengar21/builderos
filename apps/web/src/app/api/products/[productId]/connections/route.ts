import { NextResponse } from "next/server";
import { prisma } from "@builderos/db";
import { getCurrentUser } from "@/lib/current-user";
import { connectConnection } from "@/lib/connection-actions";
import { plugins } from "@/lib/plugins";

export async function POST(request: Request, { params }: { params: Promise<{ productId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });

  const { productId } = await params;
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.ownerId !== user.id) {
    return NextResponse.json({ ok: false, error: "Product not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const pluginSlug = String(body.pluginSlug ?? "");
  const plugin = plugins[pluginSlug];
  if (!plugin) return NextResponse.json({ ok: false, error: `Unknown plugin "${pluginSlug}"` }, { status: 400 });

  const result = await connectConnection({
    ownerId: product.ownerId,
    productId: product.id,
    pluginSlug,
    plugin,
    config: body.config ?? {},
    credential: body.credential,
  });
  return NextResponse.json(result);
}
