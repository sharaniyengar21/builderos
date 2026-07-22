import { notFound, redirect } from "next/navigation";
import { prisma } from "@builderos/db";
import { getCurrentUser } from "@/lib/current-user";
import { plugins } from "@/lib/plugins";
import { Alert } from "@/components/ui/alert";
import { PluginConnectForm } from "@/components/plugin-connect-form";
import { connectGeneric } from "./actions";

export default async function PluginSettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceId: string; pluginSlug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { workspaceId, pluginSlug } = await params;
  const { error } = await searchParams;

  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace || workspace.ownerId !== user.id) notFound();

  const plugin = plugins[pluginSlug];
  if (!plugin) notFound();

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-xl font-semibold text-ink-primary">Connect {plugin.metadata.name}</h1>
      <p className="mt-1 text-sm text-ink-muted">{plugin.metadata.description}</p>

      {error && (
        <div className="mt-3">
          <Alert kind="error">{error}</Alert>
        </div>
      )}

      <div className="mt-6">
        <PluginConnectForm
          metadata={plugin.metadata}
          action={connectGeneric}
          hiddenFields={{ workspaceId: workspace.id, pluginSlug }}
        />
      </div>
    </div>
  );
}
