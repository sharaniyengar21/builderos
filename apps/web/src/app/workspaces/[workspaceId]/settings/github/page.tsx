import { notFound, redirect } from "next/navigation";
import { prisma } from "@builderos/db";
import { getCurrentUser } from "@/lib/current-user";
import { connectGithub } from "./actions";

export default async function GithubSettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { workspaceId } = await params;
  const { error } = await searchParams;

  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace || workspace.ownerId !== user.id) notFound();

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-semibold text-neutral-100">Connect GitHub</h1>
      <p className="mt-1 text-sm text-neutral-500">
        A classic personal access token with no scopes is enough for public repositories.
      </p>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <form action={connectGithub} className="mt-6 flex flex-col gap-3">
        <input type="hidden" name="workspaceId" value={workspace.id} />
        <input
          type="text"
          name="owner"
          placeholder="Repo owner (e.g. vercel)"
          required
          className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100"
        />
        <input
          type="text"
          name="repo"
          placeholder="Repo name (e.g. next.js)"
          required
          className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100"
        />
        <input
          type="password"
          name="token"
          placeholder="Personal access token"
          required
          className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100"
        />
        <button type="submit" className="rounded-md bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-900">
          Connect
        </button>
      </form>
    </main>
  );
}
