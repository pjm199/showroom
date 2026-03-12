-- AlterTable
ALTER TABLE "shops" ADD COLUMN "share_token" TEXT,
ADD COLUMN "share_token_expires_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "shops_share_token_key" ON "shops"("share_token");
