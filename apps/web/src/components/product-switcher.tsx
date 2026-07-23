"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronsUpDown, Plus } from "lucide-react";

export interface ProductSummary {
  id: string;
  name: string;
}

export function ProductSwitcher({ products }: { products: ProductSummary[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const currentId = pathname.match(/^\/products\/([^/]+)/)?.[1];
  const current = products.find((p) => p.id === currentId);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center justify-between rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-ink-primary hover:border-white/[0.15]"
      >
        <span className="truncate">{current?.name ?? "Overview"}</span>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
      </button>

      {isOpen && (
        <>
          <button
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-full z-20 mt-1 w-full rounded-lg border border-white/[0.1] bg-bg-secondary p-1 shadow-xl">
            {products.map((product) => (
              <a
                key={product.id}
                href={`/products/${product.id}`}
                className="block truncate rounded-md px-2.5 py-1.5 text-sm text-ink-secondary hover:bg-white/[0.06] hover:text-ink-primary"
                onClick={() => setIsOpen(false)}
              >
                {product.name}
              </a>
            ))}
            <a
              href="/products/new"
              className="mt-1 flex items-center gap-1.5 rounded-md border-t border-white/[0.08] px-2.5 py-1.5 text-sm text-accent-electric hover:bg-white/[0.06]"
              onClick={() => setIsOpen(false)}
            >
              <Plus className="h-3.5 w-3.5" />
              New product
            </a>
          </div>
        </>
      )}
    </div>
  );
}
