import { notFound, redirect } from "next/navigation";
import { prisma } from "@builderos/db";
import { buildSnapshotFromMetrics } from "@builderos/plugin-github";
import { RepoStatsWidget } from "@builderos/plugin-github/widget";
import { getCurrentUser } from "@/lib/current-user";

export default async function WorkspacePage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { workspaceId } = await params;
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      connections: {
        include: { snapshots: { orderBy: { occurredAt: "desc" }, take: 50 } },
      },
    },
  });

  if (!workspace || workspace.ownerId !== user.id) notFound();

  const githubConnection = workspace.connections.find((c) => c.pluginSlug === "github");

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-xl font-semibold text-neutral-100">{workspace.name}</h1>

      {githubConnection ? (
        <div className="mt-6">
          <RepoStatsWidget
            workspaceId={workspace.id}
            owner={(githubConnection.config as Record<string, string>).owner}
            repo={(githubConnection.config as Record<string, string>).repo}
            initialSnapshot={buildSnapshotFromMetrics(githubConnection.snapshots)}
            lastSyncedAt={githubConnection.lastSyncedAt?.toISOString() ?? null}
          />
        </div>
      ) : (
        <a
          href={`/workspaces/${workspace.id}/settings/github`}
          className="mt-6 inline-block rounded-md border border-neutral-700 px-4 py-2 text-sm text-neutral-200"
        >
          Connect GitHub
        </a>
      )}
    </main>
  );
}
