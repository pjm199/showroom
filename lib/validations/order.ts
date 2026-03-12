import { z } from "zod";

export const createOrderItemSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

export const createOrderSchema = z.object({
  customerName: z.string().min(1, "Name required").max(200),
  customerPhone: z.string().min(1, "Phone required").max(50),
  pickupAt: z.string().datetime().optional(), // ISO string; optional for "asap"
  notes: z.string().max(500).nullable().optional(),
  items: z
    .array(createOrderItemSchema)
    .min(1, "Add at least one product to reserve"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "ACCEPTED", "COMPLETED", "CANCELLED"]),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreateOrderItemInput = z.infer<typeof createOrderItemSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
