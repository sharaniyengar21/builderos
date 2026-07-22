import { Card } from "@/components/ui/card";
import { TextField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { createWorkspace } from "./actions";

export default async function NewWorkspacePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-xl font-semibold text-ink-primary">New workspace</h1>
      {error && (
        <div className="mt-3">
          <Alert kind="error">Please enter a name.</Alert>
        </div>
      )}
      <Card className="mt-6">
        <form action={createWorkspace} className="flex flex-col gap-3">
          <TextField name="name" placeholder="Workspace name" required />
          <Button type="submit">Create</Button>
        </form>
      </Card>
    </div>
  );
}
