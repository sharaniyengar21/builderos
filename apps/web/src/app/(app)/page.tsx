import { redirect } from "next/navigation";
import { FolderPlus } from "lucide-react";
import { prisma } from "@builderos/db";
import { getCurrentUser } from "@/lib/current-user";
import { Card } from "@/components/ui/card";
import { WorkspaceGrid } from "@/components/workspace-grid";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspaces = await prisma.workspace.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink-primary">Your workspaces</h1>
        <a
          href="/workspaces/new"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-3.5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <FolderPlus className="h-4 w-4" />
          New workspace
        </a>
      </div>

      {workspaces.length === 0 ? (
        <Card className="mt-6 flex flex-col items-center gap-3 py-10 text-center">
          <FolderPlus className="h-6 w-6 text-ink-muted" />
          <p className="text-sm text-ink-muted">No workspaces yet — create one to connect a repo.</p>
        </Card>
      ) : (
        <div className="mt-6">
          <WorkspaceGrid workspaces={workspaces} />
        </div>
      )}
    </div>
  );
}
