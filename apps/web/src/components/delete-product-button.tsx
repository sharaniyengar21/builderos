"use client";

import { Button } from "./ui/button";

export function DeleteProductButton({
  productId,
  name,
  action,
}: {
  productId: string;
  name: string;
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="productId" value={productId} />
      <Button type="submit" variant="danger">
        Delete product
      </Button>
    </form>
  );
}
