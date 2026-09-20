import { NextRequest } from 'next/server'
import { prismaV2 } from '@/lib/prisma-v2'
import { errors, ok } from '@/lib/v2/response'
import { resolveDemoCatalog } from '@/lib/v2/b2b/catalog-resolver'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shopSlug: string; token: string }> }
) {
  const { shopSlug, token } = await params

  const shop = await prismaV2.v2Shop.findUnique({
    where: { slug: shopSlug },
    select: { id: true },
  })
  if (!shop) return errors.notFound('Shop')

  const result = await resolveDemoCatalog(shop.id, token)
  if (!result) return errors.notFound('Demo link')

  await prismaV2.v2B2BAccessInvite.update({
    where: { id: result.inviteId },
    data: { useCount: { increment: 1 } },
  })

  return ok(result.view)
}
