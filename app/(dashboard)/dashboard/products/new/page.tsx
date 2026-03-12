import Link from "next/link";
import { ProductForm } from "../product-form";

export default function NewProductPage() {
  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/products"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border-2 border-slate-200 hover:bg-slate-50"
          aria-label="Back"
        >
          ←
        </Link>
        <h1 className="text-xl font-semibold text-slate-800">Add product</h1>
      </div>
      <ProductForm />
    </div>
  );
}
