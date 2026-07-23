"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface AddConnectionOption {
  slug: string;
  name: string;
  description: string;
  connected: boolean;
}

export function AddConnectionMenu({ productId, options }: { productId: string; options: AddConnectionOption[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button onClick={() => setIsOpen((open) => !open)}>
        <Plus className="h-4 w-4" />
        Add connection
      </Button>

      {isOpen && (
        <>
          <button
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-lg border border-white/[0.1] bg-bg-secondary p-1 shadow-xl">
            {options.map((option) => (
              <a
                key={option.slug}
                href={`/products/${productId}/settings/${option.slug}`}
                className="block rounded-md px-2.5 py-2 hover:bg-white/[0.06]"
                onClick={() => setIsOpen(false)}
              >
                <span className="block text-sm font-medium text-ink-primary">
                  {option.connected ? `Add another ${option.name}` : `Connect ${option.name}`}
                </span>
                <span className="block text-xs text-ink-muted">{option.description}</span>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
