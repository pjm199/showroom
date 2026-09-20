import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prismaV2 } from '@/lib/prisma-v2'
import { requireV2Auth } from '@/lib/v2/context'
import { requirePermission } from '@/lib/v2/permissions'
import { ok, created, errors } from '@/lib/v2/response'
import { generateSlug } from '@/lib/v2/slug'

const createBrandSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  logoAssetId: z.string().optional(),
  websiteUrl: z.string().url().optional(),
  sortOrder: z.number().int().optional(),
})

export async function GET(request: NextRequest) {
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'products:read')
  if (perm) return perm

  const { searchParams } = request.nextUrl
  const search = searchParams.get('search') ?? undefined

  const brands = await prismaV2.v2Brand.findMany({
    where: {
      shopId: ctx.shopId,
      ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
    },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  })

  return ok(brands)
}

export async function POST(request: NextRequest) {
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'products:write')
  if (perm) return perm

  const body = await request.json().catch(() => null)
  const parsed = createBrandSchema.safeParse(body)
  if (!parsed.success) {
    return errors.validation('Invalid brand data', parsed.error.flatten())
  }

  const data = parsed.data
  const slug = data.slug ?? generateSlug(data.name)

  const existing = await prismaV2.v2Brand.findUnique({
    where: { shopId_slug: { shopId: ctx.shopId, slug } },
    select: { id: true },
  })
  if (existing) {
    return errors.conflict(`A brand with slug '${slug}' already exists`)
  }

  const brand = await prismaV2.v2Brand.create({
    data: { shopId: ctx.shopId, slug, ...data },
  })

  return created(brand)
}
