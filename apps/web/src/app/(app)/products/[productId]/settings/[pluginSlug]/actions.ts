"use server";

import { redirect } from "next/navigation";
import { prisma } from "@builderos/db";
import { getCurrentUser } from "@/lib/current-user";
import { connectConnection } from "@/lib/connection-actions";
import { plugins } from "@/lib/plugins";
import { buildCredentialFromFormData } from "@/lib/plugin-form";

export async function connectGeneric(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const productId = String(formData.get("productId") ?? "");
  const pluginSlug = String(formData.get("pluginSlug") ?? "");

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.ownerId !== user.id) redirect("/");

  const plugin = plugins[pluginSlug];
  if (!plugin) redirect(`/products/${productId}`);

  const config: Record<string, unknown> = {};
  for (const field of plugin.metadata.configFields) {
    config[field.name] = String(formData.get(field.name) ?? "").trim();
  }
  const credential = buildCredentialFromFormData(plugin.metadata.auth, formData);

  const result = await connectConnection({
    ownerId: product.ownerId,
    productId: product.id,
    pluginSlug,
    plugin,
    config,
    credential,
  });

  if (!result.ok) {
    redirect(`/products/${productId}/settings/${pluginSlug}?error=${encodeURIComponent(result.error)}`);
  }
  if (result.demo) {
    redirect(`/products/${productId}/settings/${pluginSlug}?error=${encodeURIComponent(result.message)}`);
  }

  redirect(`/products/${productId}`);
}
