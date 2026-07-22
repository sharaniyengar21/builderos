"use client";

import { usePathname } from "next/navigation";

function breadcrumbLabel(pathname: string): string {
  if (pathname === "/") return "Overview";
  if (pathname === "/workspaces/new") return "New workspace";
  if (pathname.match(/^\/workspaces\/[^/]+\/settings\/github/)) return "Connect GitHub";
  if (pathname.match(/^\/workspaces\/[^/]+/)) return "Workspace";
  return "";
}

export function Topbar() {
  const pathname = usePathname();
  return (
    <div className="flex h-14 items-center border-b border-white/[0.08] px-6 lg:px-8">
      <span className="text-sm text-ink-muted">{breadcrumbLabel(pathname)}</span>
    </div>
  );
}
