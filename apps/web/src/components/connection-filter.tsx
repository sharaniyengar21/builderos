"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { TextField } from "@/components/ui/input";

// Filters DOM nodes directly by data-search-label rather than re-rendering
// server-fetched widget data client-side — the widgets themselves stay
// server-rendered, this just toggles their visibility.
export function ConnectionFilter({ groupId, placeholder }: { groupId: string; placeholder: string }) {
  const [value, setValue] = useState("");

  function handleChange(next: string) {
    setValue(next);
    const query = next.trim().toLowerCase();
    const group = document.getElementById(groupId);
    if (!group) return;
    for (const node of group.querySelectorAll<HTMLElement>("[data-search-label]")) {
      const label = node.dataset.searchLabel?.toLowerCase() ?? "";
      node.style.display = query === "" || label.includes(query) ? "" : "none";
    }
  }

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
      <TextField
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  );
}
