"use server";

import { redirect } from "next/navigation";
import { prisma, Prisma } from "@builderos/db";
import { getCurrentUser } from "@/lib/current-user";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createProduct(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/products/new?error=name-required");

  const baseSlug = slugify(name) || "product";
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++suffix}`;
  }

  let product;
  try {
    product = await prisma.product.create({
      data: { name, slug, ownerId: user.id },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      redirect("/products/new?error=duplicate-name");
    }
    throw error;
  }

  redirect(`/products/${product.id}`);
}
