-- AlterTable
ALTER TABLE "products" ADD COLUMN "image_urls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "products"
SET "image_urls" = ARRAY["image_url"]::TEXT[]
WHERE "image_url" IS NOT NULL AND TRIM("image_url") <> '';
