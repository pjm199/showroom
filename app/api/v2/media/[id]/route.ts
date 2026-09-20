import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prismaV2 } from '@/lib/prisma-v2'
import { requireV2Auth } from '@/lib/v2/context'
import { requirePermission } from '@/lib/v2/permissions'
import { ok, noContent, errors } from '@/lib/v2/response'

const updateMediaSchema = z.object({
  altText: z.string().max(300).nullable().optional(),
  focalPointX: z.number().min(0).max(1).nullable().optional(),
  focalPointY: z.number().min(0).max(1).nullable().optional(),
  tags: z.array(z.string()).optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'media:read')
  if (perm) return perm

  const asset = await prismaV2.v2MediaAsset.findFirst({
    where: { id, shopId: ctx.shopId },
  })
  if (!asset) return errors.notFound('Media asset')

  return ok(asset)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'media:write')
  if (perm) return perm

  const asset = await prismaV2.v2MediaAsset.findFirst({
    where: { id, shopId: ctx.shopId },
    select: { id: true },
  })
  if (!asset) return errors.notFound('Media asset')

  const body = await request.json().catch(() => null)
  const parsed = updateMediaSchema.safeParse(body)
  if (!parsed.success) {
    return errors.validation('Invalid media data', parsed.error.flatten())
  }

  const updated = await prismaV2.v2MediaAsset.update({
    where: { id },
    data: parsed.data,
  })

  return ok(updated)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'media:delete')
  if (perm) return perm

  const asset = await prismaV2.v2MediaAsset.findFirst({
    where: { id, shopId: ctx.shopId },
    select: { id: true },
  })
  if (!asset) return errors.notFound('Media asset')

  const force = request.nextUrl.searchParams.get('force') === 'true'

  if (!force) {
    const usageCount = await prismaV2.v2ProductMedia.count({
      where: { assetId: id },
    })
    if (usageCount > 0) {
      return errors.mediaInUse()
    }
  }

  await prismaV2.v2MediaAsset.delete({ where: { id } })
  return noContent()
}
