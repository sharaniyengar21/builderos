import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { accountPlugins } from "@/lib/account-plugins";
import { Alert } from "@/components/ui/alert";
import { PluginConnectForm } from "@/components/plugin-connect-form";
import { connectAccountGeneric } from "./actions";

export default async function AccountPluginSettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ pluginSlug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { pluginSlug } = await params;
  const { error } = await searchParams;

  const plugin = accountPlugins[pluginSlug];
  if (!plugin) notFound();

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-xl font-semibold text-ink-primary">Connect {plugin.metadata.name}</h1>
      <p className="mt-1 text-sm text-ink-muted">{plugin.metadata.description}</p>
      <p className="mt-1 text-xs text-ink-muted">This connects once for your whole business, not per workspace.</p>

      {error && (
        <div className="mt-3">
          <Alert kind="error">{error}</Alert>
        </div>
      )}

      <div className="mt-6">
        <PluginConnectForm metadata={plugin.metadata} action={connectAccountGeneric} hiddenFields={{ pluginSlug }} />
      </div>
    </div>
  );
}
