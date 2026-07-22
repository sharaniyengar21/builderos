"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { connectAccountPlugin } from "@/lib/account-plugin-actions";
import { accountPlugins } from "@/lib/account-plugins";
import { buildCredentialFromFormData } from "@/lib/plugin-form";

export async function connectAccountGeneric(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const pluginSlug = String(formData.get("pluginSlug") ?? "");
  const plugin = accountPlugins[pluginSlug];
  if (!plugin) redirect("/");

  const config: Record<string, unknown> = {};
  for (const field of plugin.metadata.configFields) {
    config[field.name] = String(formData.get(field.name) ?? "").trim();
  }
  const credential = buildCredentialFromFormData(plugin.metadata.auth, formData);

  const result = await connectAccountPlugin({ ownerId: user.id, pluginSlug, config, credential });

  if (!result.ok) {
    redirect(`/settings/account/${pluginSlug}?error=${encodeURIComponent(result.error)}`);
  }
  if (result.demo) {
    redirect(`/settings/account/${pluginSlug}?error=${encodeURIComponent(result.message)}`);
  }

  redirect("/");
}
