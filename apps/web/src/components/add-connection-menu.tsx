"use client";

import { useState, type MouseEvent } from "react";
import { Plus } from "lucide-react";

const TRIGGER_BASE_CLASSES =
  "inline-flex items-center justify-center gap-2 text-sm font-medium text-white transition-opacity hover:opacity-90";
const FULL_TRIGGER_CLASSES = `${TRIGGER_BASE_CLASSES} rounded-lg bg-gradient-brand px-3.5 py-2`;
const COMPACT_TRIGGER_CLASSES = `${TRIGGER_BASE_CLASSES} h-8 w-8 rounded-full bg-gradient-brand shadow-lg`;

export interface AddConnectionOption {
  slug: string;
  name: string;
  description: string;
  connected: boolean;
}

// onNavigate lets a caller route programmatically (router.push) instead of a
// real <a> — needed when this menu sits inside another link (the product
// grid card), where a nested <a> would be invalid HTML.
export function AddConnectionMenu({
  productId,
  options,
  onNavigate,
  compact = false,
  label = "Add connection",
}: {
  productId: string;
  options: AddConnectionOption[];
  onNavigate?: (href: string) => void;
  compact?: boolean;
  label?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  function stopAndClose(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsOpen((open) => !open);
        }}
        className={compact ? COMPACT_TRIGGER_CLASSES : FULL_TRIGGER_CLASSES}
        aria-label={compact ? label : undefined}
      >
        <Plus className="h-4 w-4" />
        {!compact && label}
      </button>

      {isOpen && (
        <>
          <button aria-hidden tabIndex={-1} className="fixed inset-0 z-10 cursor-default" onClick={stopAndClose} />
          <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-lg border border-white/[0.1] bg-bg-secondary p-1 shadow-xl">
            {options.map((option) => {
              const href = `/products/${productId}/settings/${option.slug}`;
              const content = (
                <>
                  <span className="block text-sm font-medium text-ink-primary">
                    {option.connected ? `Add another ${option.name}` : `Connect ${option.name}`}
                  </span>
                  <span className="block text-xs text-ink-muted">{option.description}</span>
                </>
              );

              return onNavigate ? (
                <button
                  key={option.slug}
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setIsOpen(false);
                    onNavigate(href);
                  }}
                  className="block w-full rounded-md px-2.5 py-2 text-left hover:bg-white/[0.06]"
                >
                  {content}
                </button>
              ) : (
                <a
                  key={option.slug}
                  href={href}
                  className="block rounded-md px-2.5 py-2 hover:bg-white/[0.06]"
                  onClick={() => setIsOpen(false)}
                >
                  {content}
                </a>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
