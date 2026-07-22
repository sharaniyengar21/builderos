"use server";

import { redirect } from "next/navigation";
import { prisma } from "@builderos/db";
import { getCurrentUser } from "@/lib/current-user";
import { connectPlugin } from "@/lib/plugin-actions";

export async function connectGithub(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspaceId = String(formData.get("workspaceId") ?? "");
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace || workspace.ownerId !== user.id) redirect("/");

  const owner = String(formData.get("owner") ?? "").trim();
  const repo = String(formData.get("repo") ?? "").trim();
  const token = String(formData.get("token") ?? "").trim();

  const result = await connectPlugin({
    workspaceId,
    pluginSlug: "github",
    config: { owner, repo },
    credential: token || undefined,
  });

  if (!result.ok) {
    redirect(`/workspaces/${workspaceId}/settings/github?error=${encodeURIComponent(result.error)}`);
  }
  if (result.demo) {
    redirect(`/workspaces/${workspaceId}/settings/github?error=${encodeURIComponent(result.message)}`);
  }

  redirect(`/workspaces/${workspaceId}`);
}
