"use client";

import { usePathname } from "next/navigation";

function breadcrumbLabel(pathname: string): string {
  if (pathname === "/") return "Overview";
  if (pathname === "/products/new") return "New product";
  if (pathname === "/settings/account/razorpay") return "Connect Razorpay";
  if (pathname.match(/^\/products\/[^/]+\/settings\//)) return "Connect integration";
  if (pathname.match(/^\/products\/[^/]+/)) return "Product";
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
