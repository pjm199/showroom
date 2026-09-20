import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prismaV2 } from '@/lib/prisma-v2'
import { requireV2Auth } from '@/lib/v2/context'
import { requirePermission } from '@/lib/v2/permissions'
import { ok, created, errors } from '@/lib/v2/response'

const createMediaSchema = z.object({
  url: z.string().url(),
  mimeType: z.string().min(1),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  sizeBytes: z.number().int().min(0),
  altText: z.string().max(300).optional(),
  focalPointX: z.number().min(0).max(1).optional(),
  focalPointY: z.number().min(0).max(1).optional(),
  tags: z.array(z.string()).optional(),
})

export async function GET(request: NextRequest) {
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'media:read')
  if (perm) return perm

  const { searchParams } = request.nextUrl
  const cursor = searchParams.get('cursor') ?? undefined
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100)
  const mimeType = searchParams.get('mimeType') ?? undefined
  const search = searchParams.get('search') ?? undefined
  const tags = searchParams.getAll('tags')

  const assets = await prismaV2.v2MediaAsset.findMany({
    where: {
      shopId: ctx.shopId,
      ...(mimeType ? { mimeType: { startsWith: mimeType } } : {}),
      ...(search ? { altText: { contains: search, mode: 'insensitive' } } : {}),
      ...(tags.length > 0 ? { tags: { hasEvery: tags } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  })

  const hasMore = assets.length > limit
  const items = hasMore ? assets.slice(0, limit) : assets

  return ok(items, {
    pagination: { nextCursor: hasMore ? items[items.length - 1].id : null, hasMore },
  })
}

export async function POST(request: NextRequest) {
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'media:write')
  if (perm) return perm

  const body = await request.json().catch(() => null)
  const parsed = createMediaSchema.safeParse(body)
  if (!parsed.success) {
    return errors.validation('Invalid media data', parsed.error.flatten())
  }

  const asset = await prismaV2.v2MediaAsset.create({
    data: {
      shopId: ctx.shopId,
      uploadedBy: ctx.userId,
      url: parsed.data.url,
      mimeType: parsed.data.mimeType,
      width: parsed.data.width ?? null,
      height: parsed.data.height ?? null,
      sizeBytes: parsed.data.sizeBytes,
      altText: parsed.data.altText ?? null,
      focalPointX: parsed.data.focalPointX ?? null,
      focalPointY: parsed.data.focalPointY ?? null,
      tags: parsed.data.tags ?? [],
    },
  })

  return created(asset)
}
