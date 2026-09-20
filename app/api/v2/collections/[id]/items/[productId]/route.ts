import { NextRequest } from 'next/server'
import { prismaV2 } from '@/lib/prisma-v2'
import { requireV2Auth } from '@/lib/v2/context'
import { requirePermission } from '@/lib/v2/permissions'
import { noContent, errors } from '@/lib/v2/response'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; productId: string }> }
) {
  const { id: collectionId, productId } = await params
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'collections:write')
  if (perm) return perm

  const collection = await prismaV2.v2Collection.findFirst({
    where: { id: collectionId, shopId: ctx.shopId },
    select: { id: true },
  })
  if (!collection) return errors.notFound('Collection')

  const item = await prismaV2.v2CollectionItem.findUnique({
    where: { collectionId_productId: { collectionId, productId } },
    select: { id: true },
  })
  if (!item) return errors.notFound('Collection item')

  await prismaV2.v2CollectionItem.delete({
    where: { collectionId_productId: { collectionId, productId } },
  })

  return noContent()
}
