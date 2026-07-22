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
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-8 p-6">
      <h1 className="text-2xl font-semibold text-neutral-100">BuilderOS</h1>

      {error && <p className="rounded-md bg-red-950 p-3 text-sm text-red-300">{ERROR_MESSAGES[error] ?? error}</p>}

      <section className="rounded-xl border border-neutral-800 p-5">
        <h2 className="text-sm font-medium text-neutral-300">Owner sign-in</h2>
        <p className="mt-1 text-xs text-neutral-500">{ownerEmail}</p>
        <form action={signInAsOwner} className="mt-4 flex flex-col gap-3">
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100"
          />
          <button type="submit" className="rounded-md bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-900">
            Sign in
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-neutral-800 p-5">
        <h2 className="text-sm font-medium text-neutral-300">Try the demo</h2>
        <p className="mt-1 text-xs text-neutral-500">No signup — see a pre-populated workspace.</p>
        <form action={signInAsDemo} className="mt-4">
          <button type="submit" className="w-full rounded-md border border-neutral-700 px-3 py-2 text-sm font-medium text-neutral-100">
            Continue as Demo
          </button>
        </form>
      </section>
    </main>
  );
}
