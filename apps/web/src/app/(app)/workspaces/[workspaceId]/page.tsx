import { notFound, redirect } from "next/navigation";
import { Github } from "lucide-react";
import { prisma } from "@builderos/db";
import { buildSnapshotFromMetrics } from "@builderos/plugin-github";
import { RepoStatsWidget } from "@builderos/plugin-github/widget";
import { getCurrentUser } from "@/lib/current-user";
import { Card } from "@/components/ui/card";
import { IntegrationsGrid } from "@/components/integrations-grid";

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
    <div className="mx-auto max-w-4xl">
      <h1 className="text-xl font-semibold text-ink-primary">{workspace.name}</h1>

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
        <Card className="mt-6 flex flex-col items-start gap-3">
          <Github className="h-6 w-6 text-accent-electric" />
          <div>
            <p className="text-sm font-medium text-ink-primary">Connect a GitHub repository</p>
            <p className="mt-1 text-xs text-ink-muted">Track stars, forks, open issues/PRs, and releases.</p>
          </div>
          <a
            href={`/workspaces/${workspace.id}/settings/github`}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-3.5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Connect GitHub
          </a>
        </Card>
      )}

      <IntegrationsGrid />
    </div>
  );
}
