import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ProductForm } from "../../product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const shopId = (session.user as { shopId?: string }).shopId;
  if (!shopId) redirect("/dashboard");

  const { id } = await params;
  const product = await prisma.product.findFirst({
    where: { id, shopId },
  });
  if (!product) notFound();

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
        <h1 className="text-xl font-semibold text-slate-800">Edit product</h1>
      </div>
      <ProductForm
        productId={product.id}
        initial={{
          title: product.title,
          description: product.description ?? "",
          priceCents: product.priceCents,
          categoryId: product.categoryId ?? "",
          imageUrl: product.imageUrl ?? "",
          visibility:
            product.visibility === "PUBLIC" ? "PUBLIC" : "DRAFT",
        }}
      />
    </div>
  );
}
