import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prismaV2 } from '@/lib/prisma-v2'
import { created, errors } from '@/lib/v2/response'
import { getB2BSessionFromRequest } from '@/lib/v2/b2b/session'
import { resolveClientCatalog, resolveDemoCatalog, resolveOrderItems } from '@/lib/v2/b2b/catalog-resolver'

const orderSchema = z.object({
  customerName: z.string().min(1).max(150),
  customerPhone: z.string().max(30).optional(),
  customerEmail: z.string().email().optional(),
  notes: z.string().max(1000).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(9999),
        notes: z.string().max(500).optional(),
      })
    )
    .min(1),
  demoToken: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shopSlug: string }> }
) {
  const { shopSlug } = await params

  const shop = await prismaV2.v2Shop.findUnique({
    where: { slug: shopSlug },
    select: { id: true, orderingEnabled: true },
  })
  if (!shop) return errors.notFound('Shop')

  const body = await request.json().catch(() => null)
  const parsed = orderSchema.safeParse(body)
  if (!parsed.success) {
    return errors.validation('Invalid order data', parsed.error.flatten())
  }

  const data = parsed.data
  const session = getB2BSessionFromRequest(request)

  let catalogId: string | null = null
  let clientId: string | null = null
  let inviteId: string | null = null
  let isDemo = false

  if (session && session.shopId === shop.id) {
    const view = await resolveClientCatalog(shop.id, session.clientId)
    if (!view) return errors.notFound('B2B catalog')
    if (!view.catalog.requestOrderEnabled) {
      return errors.forbidden('Order requests are disabled for this catalog')
    }
    catalogId = view.catalog.id
    clientId = session.clientId
  } else if (data.demoToken) {
    const demo = await resolveDemoCatalog(shop.id, data.demoToken)
    if (!demo) return errors.notFound('Demo link')
    if (!demo.view.catalog.requestOrderEnabled) {
      return errors.forbidden('Order requests are disabled for this catalog')
    }
    catalogId = demo.view.catalog.id
    inviteId = demo.inviteId
    isDemo = true
  } else {
    return errors.unauthorized()
  }

  const resolvedItems = await resolveOrderItems(
    shop.id,
    catalogId,
    clientId,
    data.items,
    isDemo
  )
  if (!resolvedItems) {
    return errors.validation('One or more products are not in this catalog')
  }

  const order = await prismaV2.v2B2BOrder.create({
    data: {
      shopId: shop.id,
      clientId,
      inviteId,
      customerName: data.customerName,
      customerPhone: data.customerPhone ?? null,
      customerEmail: data.customerEmail ?? session?.email ?? null,
      notes: data.notes ?? null,
      items: resolvedItems,
    },
  })

  return created({ id: order.id, status: order.status })
}
