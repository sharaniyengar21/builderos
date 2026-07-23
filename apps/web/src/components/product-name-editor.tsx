"use client";

import { useState } from "react";
import { Pencil, X } from "lucide-react";
import { TextField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ProductNameEditor({
  productId,
  name,
  action,
}: {
  productId: string;
  name: string;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);

  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="group flex items-center gap-2 text-left"
      >
        <h1 className="text-xl font-semibold text-ink-primary">{name}</h1>
        <Pencil className="h-3.5 w-3.5 text-ink-muted opacity-0 transition-opacity group-hover:opacity-100" />
      </button>
    );
  }

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="productId" value={productId} />
      <TextField name="name" defaultValue={name} autoFocus className="max-w-xs" />
      <Button type="submit" variant="secondary" className="px-2.5 py-1.5 text-xs">
        Save
      </Button>
      <button
        type="button"
        onClick={() => setIsEditing(false)}
        className="text-ink-muted hover:text-ink-primary"
        aria-label="Cancel rename"
      >
        <X className="h-4 w-4" />
      </button>
    </form>
  );
}
