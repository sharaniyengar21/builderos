import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@builderos/db";
import { getCurrentUser } from "@/lib/current-user";
import { AppShell } from "@/components/app-shell";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspaces = await prisma.workspace.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true },
  });

  return (
    <AppShell user={{ email: user.email, isDemo: user.isDemo }} workspaces={workspaces}>
      {children}
    </AppShell>
  );
}
