import type { PluginMetadata } from "@builderos/plugin-sdk";
import { Card } from "@/components/ui/card";
import { TextField, PasswordField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function PluginConnectForm({
  metadata,
  action,
  hiddenFields,
}: {
  metadata: PluginMetadata;
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields?: Record<string, string>;
}) {
  return (
    <Card>
      <form action={action} className="flex flex-col gap-3">
        {hiddenFields &&
          Object.entries(hiddenFields).map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />)}

        {metadata.configFields.map((field) => (
          <div key={field.name} className="flex flex-col gap-1">
            <label className="text-xs text-ink-muted" htmlFor={field.name}>
              {field.label}
            </label>
            <TextField id={field.name} name={field.name} placeholder={field.placeholder} required />
          </div>
        ))}

        {metadata.auth.type === "none" && <p className="text-xs text-ink-muted">No credentials required.</p>}

        {metadata.auth.type === "pat" && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-ink-muted" htmlFor="credential">
              {metadata.auth.label}
            </label>
            <PasswordField id="credential" name="credential" required />
            {metadata.auth.helpUrl && (
              <a href={metadata.auth.helpUrl} target="_blank" rel="noreferrer" className="text-xs text-accent-electric underline">
                Where do I find this?
              </a>
            )}
          </div>
        )}

        {metadata.auth.type === "basic" && (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-ink-muted" htmlFor="credentialUsername">
                {metadata.auth.usernameLabel}
              </label>
              <TextField id="credentialUsername" name="credentialUsername" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-ink-muted" htmlFor="credentialPassword">
                {metadata.auth.passwordLabel}
              </label>
              <PasswordField id="credentialPassword" name="credentialPassword" required />
            </div>
            {metadata.auth.helpUrl && (
              <a href={metadata.auth.helpUrl} target="_blank" rel="noreferrer" className="text-xs text-accent-electric underline">
                Where do I find this?
              </a>
            )}
          </>
        )}

        {metadata.auth.type === "oauth2" && (
          <Button type="button" variant="secondary" disabled>
            Connect with {metadata.name} (coming soon)
          </Button>
        )}

        {metadata.auth.type !== "oauth2" && <Button type="submit">Connect</Button>}
      </form>
    </Card>
  );
}
