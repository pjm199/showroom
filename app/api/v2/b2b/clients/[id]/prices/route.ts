import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prismaV2 } from '@/lib/prisma-v2'
import { requireV2Auth } from '@/lib/v2/context'
import { requirePermission } from '@/lib/v2/permissions'
import { ok, created, noContent, errors } from '@/lib/v2/response'

const createPriceSchema = z.object({
  productId: z.string().min(1),
  priceCents: z.number().int().min(0),
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

  const client = await prismaV2.v2B2BClient.findFirst({
    where: { id, shopId: ctx.shopId },
    select: { id: true },
  })
  if (!client) return errors.notFound('B2B client')

  const overrides = await prismaV2.v2B2BClientPriceOverride.findMany({
    where: { clientId: id },
    include: {
      product: { select: { id: true, title: true, slug: true, priceCents: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return ok(overrides)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'b2b:write')
  if (perm) return perm

  const client = await prismaV2.v2B2BClient.findFirst({
    where: { id, shopId: ctx.shopId },
    select: { id: true },
  })
  if (!client) return errors.notFound('B2B client')

  const body = await request.json().catch(() => null)
  const parsed = createPriceSchema.safeParse(body)
  if (!parsed.success) {
    return errors.validation('Invalid price override data', parsed.error.flatten())
  }

  const product = await prismaV2.v2Product.findFirst({
    where: { id: parsed.data.productId, shopId: ctx.shopId },
    select: { id: true },
  })
  if (!product) return errors.notFound('Product')

  const override = await prismaV2.v2B2BClientPriceOverride.upsert({
    where: {
      clientId_productId: { clientId: id, productId: parsed.data.productId },
    },
    create: {
      clientId: id,
      productId: parsed.data.productId,
      priceCents: parsed.data.priceCents,
    },
    update: {
      priceCents: parsed.data.priceCents,
    },
    include: {
      product: { select: { id: true, title: true, slug: true, priceCents: true } },
    },
  })

  return created(override)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'b2b:write')
  if (perm) return perm

  const client = await prismaV2.v2B2BClient.findFirst({
    where: { id, shopId: ctx.shopId },
    select: { id: true },
  })
  if (!client) return errors.notFound('B2B client')

  const productId = request.nextUrl.searchParams.get('productId')
  if (!productId) return errors.validation('productId query param is required')

  const override = await prismaV2.v2B2BClientPriceOverride.findUnique({
    where: { clientId_productId: { clientId: id, productId } },
  })
  if (!override) return errors.notFound('Price override')

  await prismaV2.v2B2BClientPriceOverride.delete({
    where: { clientId_productId: { clientId: id, productId } },
  })

  return noContent()
}
