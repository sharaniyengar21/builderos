"use server";

import { redirect } from "next/navigation";
import { prisma } from "@builderos/db";
import { getCurrentUser } from "@/lib/current-user";

export async function deleteWorkspace(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspaceId = String(formData.get("workspaceId") ?? "");
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace || workspace.ownerId !== user.id) redirect("/");
  if (user.isDemo) redirect(`/workspaces/${workspaceId}`);

  await prisma.workspace.delete({ where: { id: workspaceId } });
  redirect("/");
}
