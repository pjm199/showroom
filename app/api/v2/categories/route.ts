import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prismaV2 } from '@/lib/prisma-v2'
import { requireV2Auth } from '@/lib/v2/context'
import { requirePermission } from '@/lib/v2/permissions'
import { ok, created, errors } from '@/lib/v2/response'
import { generateSlug } from '@/lib/v2/slug'

const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).optional(),
  parentId: z.string().nullable().optional(),
  description: z.string().optional(),
  coverAssetId: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
})

export async function GET(request: NextRequest) {
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'products:read')
  if (perm) return perm

  const { searchParams } = request.nextUrl
  const parentId = searchParams.get('parentId') ?? undefined

  const categories = await prismaV2.v2Category.findMany({
    where: {
      shopId: ctx.shopId,
      parentId: parentId === 'root' ? null : (parentId ?? undefined),
    },
    include: {
      children: { orderBy: { sortOrder: 'asc' } },
    },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  })

  return ok(categories)
}

export async function POST(request: NextRequest) {
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'products:write')
  if (perm) return perm

  const body = await request.json().catch(() => null)
  const parsed = createCategorySchema.safeParse(body)
  if (!parsed.success) {
    return errors.validation('Invalid category data', parsed.error.flatten())
  }

  const data = parsed.data
  const slug = data.slug ?? generateSlug(data.name)

  const existing = await prismaV2.v2Category.findUnique({
    where: { shopId_slug: { shopId: ctx.shopId, slug } },
    select: { id: true },
  })
  if (existing) {
    return errors.conflict(`A category with slug '${slug}' already exists`)
  }

  const category = await prismaV2.v2Category.create({
    data: { shopId: ctx.shopId, slug, ...data },
    include: { children: true },
  })

  return created(category)
}
