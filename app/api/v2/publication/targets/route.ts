import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prismaV2 } from '@/lib/prisma-v2'
import { requireV2Auth } from '@/lib/v2/context'
import { requirePermission } from '@/lib/v2/permissions'
import { ok, created, errors } from '@/lib/v2/response'

const createTargetSchema = z.object({
  type: z.enum(['STOREFRONT', 'B2B_CATALOG', 'ECOMMERCE_CHANNEL', 'WIDGET', 'SECTION']),
  name: z.string().min(1).max(100),
  channelRef: z.string().optional(),
})

export async function GET(_request: NextRequest) {
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'publication:read')
  if (perm) return perm

  const targets = await prismaV2.v2PublicationTarget.findMany({
    where: { shopId: ctx.shopId },
    orderBy: { createdAt: 'asc' },
  })

  return ok(targets)
}

export async function POST(request: NextRequest) {
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'shop:admin')
  if (perm) return perm

  const body = await request.json().catch(() => null)
  const parsed = createTargetSchema.safeParse(body)
  if (!parsed.success) {
    return errors.validation('Invalid target data', parsed.error.flatten())
  }

  const target = await prismaV2.v2PublicationTarget.create({
    data: {
      shopId: ctx.shopId,
      type: parsed.data.type,
      name: parsed.data.name,
      channelRef: parsed.data.channelRef ?? null,
    },
  })

  return created(target)
}
