import { NextRequest } from 'next/server'
import { prismaV2 } from '@/lib/prisma-v2'
import { requireV2Auth } from '@/lib/v2/context'
import { requirePermission } from '@/lib/v2/permissions'
import { ok } from '@/lib/v2/response'

export async function GET(request: NextRequest) {
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'b2b:read')
  if (perm) return perm

  const status = request.nextUrl.searchParams.get('status')
  const clientId = request.nextUrl.searchParams.get('clientId')

  const orders = await prismaV2.v2B2BOrder.findMany({
    where: {
      shopId: ctx.shopId,
      ...(status ? { status: status as 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED' } : {}),
      ...(clientId ? { clientId } : {}),
    },
    include: {
      client: { select: { id: true, companyName: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return ok(orders)
}
