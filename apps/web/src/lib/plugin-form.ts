import type { PluginAuthStrategy } from "@builderos/plugin-sdk";

// Mirrors the auth-type switch in plugin-connect-form.tsx — one place that
// knows how the two "basic" inputs get joined into the single opaque
// credential string every plugin/connect() expects.
export function buildCredentialFromFormData(auth: PluginAuthStrategy, formData: FormData): string | undefined {
  if (auth.type === "none" || auth.type === "oauth2") return undefined;

  if (auth.type === "basic") {
    const username = String(formData.get("credentialUsername") ?? "").trim();
    const password = String(formData.get("credentialPassword") ?? "").trim();
    return username && password ? `${username}:${password}` : undefined;
  }

  const credential = String(formData.get("credential") ?? "").trim();
  return credential || undefined;
}
