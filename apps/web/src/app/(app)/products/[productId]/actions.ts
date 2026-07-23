"use server";

import { redirect } from "next/navigation";
import { prisma } from "@builderos/db";
import { getCurrentUser } from "@/lib/current-user";

export async function deleteProduct(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const productId = String(formData.get("productId") ?? "");
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.ownerId !== user.id) redirect("/");
  if (user.isDemo) redirect(`/products/${productId}`);

  await prisma.product.delete({ where: { id: productId } });
  redirect("/");
}
