import type { ReactNode } from "react";
import { LayoutGrid } from "lucide-react";
import { logout } from "@/app/login/actions";
import { SidebarNavItem } from "./sidebar-nav-item";
import { ProductSwitcher, type ProductSummary } from "./product-switcher";
import { Badge } from "./ui/badge";
import { Topbar } from "./topbar";

export function AppShell({
  user,
  products,
  children,
}: {
  user: { email: string; isDemo: boolean };
  products: ProductSummary[];
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 flex-col border-r border-white/[0.08] bg-bg-primary p-4">
        <a href="/" className="bg-gradient-brand bg-clip-text px-1 text-lg font-bold text-transparent">
          BuilderOS
        </a>

        <div className="mt-6">
          <ProductSwitcher products={products} />
        </div>

        <nav className="mt-4 flex flex-col gap-0.5">
          <SidebarNavItem href="/" icon={<LayoutGrid className="h-4 w-4" />}>
            Overview
          </SidebarNavItem>
        </nav>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/[0.08] pt-3">
          <div className="min-w-0">
            <p className="truncate text-sm text-ink-secondary">{user.email}</p>
            {user.isDemo && <Badge tone="demo">demo</Badge>}
          </div>
          <form action={logout}>
            <button type="submit" className="text-xs text-ink-muted hover:text-ink-primary">
              Log out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
