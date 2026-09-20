import { NextRequest } from 'next/server'
import { prismaV2 } from '@/lib/prisma-v2'
import { errors, ok } from '@/lib/v2/response'
import { getB2BSessionFromRequest } from '@/lib/v2/b2b/session'
import { resolveClientCatalog } from '@/lib/v2/b2b/catalog-resolver'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shopSlug: string }> }
) {
  const { shopSlug } = await params

  const shop = await prismaV2.v2Shop.findUnique({
    where: { slug: shopSlug },
    select: { id: true },
  })
  if (!shop) return errors.notFound('Shop')

  const session = getB2BSessionFromRequest(request)
  if (!session || session.shopId !== shop.id) {
    return errors.unauthorized()
  }

  const view = await resolveClientCatalog(shop.id, session.clientId)
  if (!view) return errors.notFound('B2B catalog')

  return ok(view)
}
