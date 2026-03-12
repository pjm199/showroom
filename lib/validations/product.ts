import { z } from "zod";

const visibilityEnum = z.enum(["DRAFT", "PRIVATE_LINK", "PUBLIC"]);

export const createProductSchema = z.object({
  title: z.string().min(1, "Title required").max(200),
  description: z.string().max(2000).nullable().optional(),
  priceCents: z.number().int().min(0, "Price must be 0 or more"),
  categoryId: z.string().cuid().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  visibility: visibilityEnum.default("DRAFT"),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateProductSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  priceCents: z.number().int().min(0).optional(),
  categoryId: z.string().cuid().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  visibility: visibilityEnum.optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
