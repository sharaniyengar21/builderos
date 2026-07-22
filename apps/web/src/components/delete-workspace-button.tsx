"use client";

import { Button } from "./ui/button";

export function DeleteWorkspaceButton({
  workspaceId,
  name,
  action,
}: {
  workspaceId: string;
  name: string;
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <Button type="submit" variant="danger">
        Delete workspace
      </Button>
    </form>
  );
}
