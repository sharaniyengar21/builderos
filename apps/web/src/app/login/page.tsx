import { PasswordField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { GlassCard } from "@/components/ui/card";
import { signInAsDemo, signInAsOwner } from "./actions";

const ERROR_MESSAGES: Record<string, string> = {
  "invalid-password": "That password doesn't match OWNER_PASSWORD.",
  "owner-not-seeded": "No owner account found — run `pnpm db:seed` first.",
  "demo-not-seeded": "No demo account found — run `pnpm db:seed` first.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const ownerEmail = process.env.OWNER_EMAIL ?? "owner@builderos.local";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-primary p-6">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-electric/20 blur-[120px]" />

      <div className="relative z-10 flex w-full max-w-md flex-col gap-6">
        <h1 className="bg-gradient-brand bg-clip-text text-center text-3xl font-bold text-transparent">
          BuilderOS
        </h1>

        {error && <Alert kind="error">{ERROR_MESSAGES[error] ?? error}</Alert>}

        <GlassCard className="p-6">
          <div>
            <h2 className="text-sm font-medium text-ink-primary">Owner sign-in</h2>
            <p className="mt-1 font-mono text-xs text-ink-muted">{ownerEmail}</p>
            <form action={signInAsOwner} className="mt-4 flex flex-col gap-3">
              <PasswordField name="password" placeholder="Password" required />
              <Button type="submit" variant="primary">
                Sign in
              </Button>
            </form>
          </div>

          <div className="mt-6 border-t border-white/[0.08] pt-6">
            <h2 className="text-sm font-medium text-ink-primary">Try the demo</h2>
            <p className="mt-1 text-xs text-ink-muted">No signup — see a pre-populated product.</p>
            <form action={signInAsDemo} className="mt-4">
              <Button type="submit" variant="secondary" className="w-full">
                Continue as Demo
              </Button>
            </form>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
