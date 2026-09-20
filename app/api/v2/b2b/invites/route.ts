import { NextRequest } from 'next/server'
import { z } from 'zod'
import { randomBytes } from 'crypto'
import { prismaV2 } from '@/lib/prisma-v2'
import { requireV2Auth } from '@/lib/v2/context'
import { requirePermission } from '@/lib/v2/permissions'
import { ok, created, errors } from '@/lib/v2/response'

const createInviteSchema = z.object({
  catalogId: z.string().optional(),
  clientId: z.string().optional(),
  label: z.string().max(150).optional(),
  expiresInHours: z.number().int().min(1).max(8760).optional(),
  maxUses: z.number().int().min(1).optional(),
})

export async function GET(_request: NextRequest) {
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'b2b:read')
  if (perm) return perm

  const invites = await prismaV2.v2B2BAccessInvite.findMany({
    where: { shopId: ctx.shopId },
    include: {
      catalog: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return ok(invites)
}

export async function POST(request: NextRequest) {
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'b2b:write')
  if (perm) return perm

  const body = await request.json().catch(() => null)
  const parsed = createInviteSchema.safeParse(body)
  if (!parsed.success) {
    return errors.validation('Invalid invite data', parsed.error.flatten())
  }

  const data = parsed.data
  const hours = data.expiresInHours ?? 48
  const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000)

  if (data.catalogId) {
    const catalog = await prismaV2.v2B2BCatalog.findFirst({
      where: { id: data.catalogId, shopId: ctx.shopId },
      select: { id: true },
    })
    if (!catalog) return errors.validation('Catalog not found')
  }

  if (data.clientId) {
    const client = await prismaV2.v2B2BClient.findFirst({
      where: { id: data.clientId, shopId: ctx.shopId },
      select: { id: true },
    })
    if (!client) return errors.validation('Client not found')
  }

  if (!data.catalogId && !data.clientId) {
    return errors.validation('Either catalogId or clientId is required')
  }

  const token = randomBytes(24).toString('hex')

  const invite = await prismaV2.v2B2BAccessInvite.create({
    data: {
      shopId: ctx.shopId,
      catalogId: data.catalogId ?? null,
      clientId: data.clientId ?? null,
      token,
      label: data.label ?? null,
      expiresAt,
      maxUses: data.maxUses ?? null,
    },
    include: {
      catalog: { select: { id: true, name: true, slug: true } },
    },
  })

  const shop = await prismaV2.v2Shop.findUnique({
    where: { id: ctx.shopId },
    select: { slug: true },
  })

  return created({
    ...invite,
    demoPath: `/b2b/demo?token=${token}`,
    shopSlug: shop?.slug ?? null,
  })
}
