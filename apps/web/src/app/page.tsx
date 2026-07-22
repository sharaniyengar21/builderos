import { redirect } from "next/navigation";
import { prisma } from "@builderos/db";
import { getCurrentUser } from "@/lib/current-user";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspaces = await prisma.workspace.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-100">Your workspaces</h1>
        <a
          href="/workspaces/new"
          className="rounded-md bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-900"
        >
          New workspace
        </a>
      </div>

      {workspaces.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">No workspaces yet — create one to connect a repo.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {workspaces.map((workspace) => (
            <li key={workspace.id}>
              <a
                href={`/workspaces/${workspace.id}`}
                className="block rounded-lg border border-neutral-800 px-4 py-3 text-neutral-200 hover:border-neutral-600"
              >
                {workspace.name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
