"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

function cx(...classes: (string | false | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function SidebarNavItem({
  href,
  icon,
  children,
}: {
  href: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <a
      href={href}
      className={cx(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150",
        isActive
          ? "bg-white/[0.06] text-ink-primary"
          : "text-ink-secondary hover:bg-white/[0.04] hover:text-ink-primary",
      )}
    >
      {icon}
      {children}
    </a>
  );
}
