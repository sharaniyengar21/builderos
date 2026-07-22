import { createWorkspace } from "./actions";

export default async function NewWorkspacePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-semibold text-neutral-100">New workspace</h1>
      {error && <p className="mt-3 text-sm text-red-400">Please enter a name.</p>}
      <form action={createWorkspace} className="mt-6 flex flex-col gap-3">
        <input
          type="text"
          name="name"
          placeholder="Workspace name"
          required
          className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100"
        />
        <button type="submit" className="rounded-md bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-900">
          Create
        </button>
      </form>
    </main>
  );
}
