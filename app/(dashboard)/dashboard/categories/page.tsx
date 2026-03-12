import { CategoriesPageClient } from "./categories-client";

export default function CategoriesPage() {
  return (
    <div className="max-w-lg mx-auto space-y-5">
      <h1 className="text-xl font-semibold text-slate-800">Categories</h1>
      <p className="text-sm text-slate-500">
        Group your products (e.g. Fish, Meat, Bread). Create at least one before adding products.
      </p>
      <CategoriesPageClient />
    </div>
  );
}
