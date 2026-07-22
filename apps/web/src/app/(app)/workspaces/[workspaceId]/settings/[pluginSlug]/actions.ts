"use server";

import { redirect } from "next/navigation";
import { prisma } from "@builderos/db";
import { getCurrentUser } from "@/lib/current-user";
import { connectPlugin } from "@/lib/plugin-actions";
import { plugins } from "@/lib/plugins";
import { buildCredentialFromFormData } from "@/lib/plugin-form";

export async function connectGeneric(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspaceId = String(formData.get("workspaceId") ?? "");
  const pluginSlug = String(formData.get("pluginSlug") ?? "");

  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace || workspace.ownerId !== user.id) redirect("/");

  const plugin = plugins[pluginSlug];
  if (!plugin) redirect(`/workspaces/${workspaceId}`);

  const config: Record<string, unknown> = {};
  for (const field of plugin.metadata.configFields) {
    config[field.name] = String(formData.get(field.name) ?? "").trim();
  }
  const credential = buildCredentialFromFormData(plugin.metadata.auth, formData);

  const result = await connectPlugin({ workspaceId, pluginSlug, config, credential });

  if (!result.ok) {
    redirect(`/workspaces/${workspaceId}/settings/${pluginSlug}?error=${encodeURIComponent(result.error)}`);
  }
  if (result.demo) {
    redirect(`/workspaces/${workspaceId}/settings/${pluginSlug}?error=${encodeURIComponent(result.message)}`);
  }

  redirect(`/workspaces/${workspaceId}`);
}
