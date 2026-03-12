import { ProductsListClient } from "./products-list-client";

export default function ProductsPage() {
  return (
    <div className="max-w-lg mx-auto space-y-5">
      <h1 className="text-xl font-semibold text-slate-800">Products</h1>
      <p className="text-sm text-slate-500">
        Add products with a photo, price, and category. Set to Public to show on your storefront.
      </p>
      <ProductsListClient />
    </div>
  );
}
