import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prismaV2 } from '@/lib/prisma-v2'
import { requireV2Auth } from '@/lib/v2/context'
import { requirePermission } from '@/lib/v2/permissions'
import { ok, created, errors } from '@/lib/v2/response'
import { generateSlug } from '@/lib/v2/slug'

const createCatalogSchema = z.object({
  name: z.string().min(1).max(150),
  slug: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  coverAssetId: z.string().nullable().optional(),
  audienceRuleId: z.string().nullable().optional(),
  priceListRef: z.string().optional(),
  requestOrderEnabled: z.boolean().optional(),
  clientId: z.string().nullable().optional(),
})

export async function GET(request: NextRequest) {
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'b2b:read')
  if (perm) return perm

  const isActive = request.nextUrl.searchParams.get('isActive')

  const catalogs = await prismaV2.v2B2BCatalog.findMany({
    where: {
      shopId: ctx.shopId,
      ...(isActive !== null ? { isActive: isActive === 'true' } : {}),
    },
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return ok(catalogs)
}

export async function POST(request: NextRequest) {
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'b2b:write')
  if (perm) return perm

  const body = await request.json().catch(() => null)
  const parsed = createCatalogSchema.safeParse(body)
  if (!parsed.success) {
    return errors.validation('Invalid catalog data', parsed.error.flatten())
  }

  const data = parsed.data
  const slug = data.slug ?? generateSlug(data.name)

  const existing = await prismaV2.v2B2BCatalog.findUnique({
    where: { shopId_slug: { shopId: ctx.shopId, slug } },
    select: { id: true },
  })
  if (existing) {
    return errors.conflict(`A catalog with slug '${slug}' already exists`)
  }

  const catalog = await prismaV2.v2B2BCatalog.create({
    data: {
      shopId: ctx.shopId,
      name: data.name,
      slug,
      description: data.description ?? null,
      notes: data.notes ?? null,
      coverAssetId: data.coverAssetId ?? null,
      audienceRuleId: data.audienceRuleId ?? null,
      priceListRef: data.priceListRef ?? null,
      requestOrderEnabled: data.requestOrderEnabled ?? false,
      clientId: data.clientId ?? null,
    },
    include: { items: true },
  })

  return created(catalog)
}
