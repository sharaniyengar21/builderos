"use server";

import { redirect } from "next/navigation";
import { prisma, Prisma } from "@builderos/db";
import { getCurrentUser } from "@/lib/current-user";

export async function renameProduct(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const productId = String(formData.get("productId") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.ownerId !== user.id) redirect("/");
  if (user.isDemo) redirect(`/products/${productId}`);
  if (!name) redirect(`/products/${productId}?error=name-required`);

  try {
    await prisma.product.update({ where: { id: productId }, data: { name } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      redirect(`/products/${productId}?error=duplicate-name`);
    }
    throw error;
  }

  redirect(`/products/${productId}`);
}

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
