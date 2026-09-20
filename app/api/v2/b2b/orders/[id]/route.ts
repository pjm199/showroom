import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prismaV2 } from '@/lib/prisma-v2'
import { requireV2Auth } from '@/lib/v2/context'
import { requirePermission } from '@/lib/v2/permissions'
import { ok, errors } from '@/lib/v2/response'

const updateOrderSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED']),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'b2b:read')
  if (perm) return perm

  const order = await prismaV2.v2B2BOrder.findFirst({
    where: { id, shopId: ctx.shopId },
    include: {
      client: { select: { id: true, companyName: true, email: true } },
    },
  })
  if (!order) return errors.notFound('B2B order')

  return ok(order)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'b2b:write')
  if (perm) return perm

  const order = await prismaV2.v2B2BOrder.findFirst({
    where: { id, shopId: ctx.shopId },
    select: { id: true },
  })
  if (!order) return errors.notFound('B2B order')

  const body = await request.json().catch(() => null)
  const parsed = updateOrderSchema.safeParse(body)
  if (!parsed.success) {
    return errors.validation('Invalid order data', parsed.error.flatten())
  }

  const updated = await prismaV2.v2B2BOrder.update({
    where: { id },
    data: { status: parsed.data.status },
    include: {
      client: { select: { id: true, companyName: true, email: true } },
    },
  })

  return ok(updated)
}
