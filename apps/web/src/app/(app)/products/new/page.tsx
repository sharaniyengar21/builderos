import { Card } from "@/components/ui/card";
import { TextField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { createProduct } from "./actions";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const errorMessage =
    error === "duplicate-name"
      ? "You already have a product with this name."
      : error
        ? "Please enter a name."
        : null;

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-xl font-semibold text-ink-primary">New product</h1>
      <p className="mt-1 text-sm text-ink-muted">
        A product groups multiple git repos, npm packages, and other integrations together.
      </p>
      {errorMessage && (
        <div className="mt-3">
          <Alert kind="error">{errorMessage}</Alert>
        </div>
      )}
      <Card className="mt-6">
        <form action={createProduct} className="flex flex-col gap-3">
          <TextField name="name" placeholder="Product name" required />
          <Button type="submit">Create</Button>
        </form>
      </Card>
    </div>
  );
}
