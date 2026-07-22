import { notFound, redirect } from "next/navigation";
import { prisma } from "@builderos/db";
import { getCurrentUser } from "@/lib/current-user";
import { Card } from "@/components/ui/card";
import { TextField, PasswordField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
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
    <div className="mx-auto max-w-md">
      <h1 className="text-xl font-semibold text-ink-primary">Connect GitHub</h1>
      <p className="mt-1 text-sm text-ink-muted">
        A classic personal access token with no scopes is enough for public repositories.
      </p>

      {error && (
        <div className="mt-3">
          <Alert kind="error">{error}</Alert>
        </div>
      )}

      <Card className="mt-6">
        <form action={connectGithub} className="flex flex-col gap-3">
          <input type="hidden" name="workspaceId" value={workspace.id} />
          <TextField name="owner" placeholder="Repo owner (e.g. vercel)" required />
          <TextField name="repo" placeholder="Repo name (e.g. next.js)" required />
          <PasswordField name="token" placeholder="Personal access token" required />
          <Button type="submit">Connect</Button>
        </form>
      </Card>
    </div>
  );
}
