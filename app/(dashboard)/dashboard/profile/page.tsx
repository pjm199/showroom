import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProfileForm } from "./profile-form";
import { ShareLinkCard } from "./share-link-card";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const shopId = (session.user as { shopId?: string }).shopId;
  if (!shopId) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 text-card-foreground">
        <p className="text-destructive">No shop linked to your account.</p>
      </div>
    );
  }

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
  });

  if (!shop) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 text-card-foreground">
        <p className="text-destructive">Shop not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-8">
      <h1 className="text-xl font-semibold text-slate-800">Shop profile</h1>
      <ProfileForm
        initial={{
          name: shop.name,
          slug: shop.slug,
          description: shop.description ?? "",
          imageUrl: shop.imageUrl ?? "",
          whatsapp: shop.whatsapp ?? "",
          address: shop.address ?? "",
          mapUrl: shop.mapUrl ?? "",
        }}
      />
      <ShareLinkCard />
    </div>
  );
}
