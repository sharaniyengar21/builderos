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

export async function createWorkspace(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/workspaces/new?error=name-required");

  const baseSlug = slugify(name) || "workspace";
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.workspace.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++suffix}`;
  }

  let workspace;
  try {
    workspace = await prisma.workspace.create({
      data: { name, slug, ownerId: user.id },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      redirect("/workspaces/new?error=duplicate-name");
    }
    throw error;
  }

  redirect(`/workspaces/${workspace.id}`);
}
