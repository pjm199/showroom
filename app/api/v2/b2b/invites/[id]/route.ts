import { NextRequest } from 'next/server'
import { prismaV2 } from '@/lib/prisma-v2'
import { requireV2Auth } from '@/lib/v2/context'
import { requirePermission } from '@/lib/v2/permissions'
import { ok, noContent, errors } from '@/lib/v2/response'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'b2b:write')
  if (perm) return perm

  const invite = await prismaV2.v2B2BAccessInvite.findFirst({
    where: { id, shopId: ctx.shopId },
    select: { id: true },
  })
  if (!invite) return errors.notFound('Access invite')

  const body = await request.json().catch(() => ({}))
  const isActive = typeof body.isActive === 'boolean' ? body.isActive : false

  const updated = await prismaV2.v2B2BAccessInvite.update({
    where: { id },
    data: { isActive },
    include: {
      catalog: { select: { id: true, name: true, slug: true } },
    },
  })

  return ok(updated)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'b2b:delete')
  if (perm) return perm

  const invite = await prismaV2.v2B2BAccessInvite.findFirst({
    where: { id, shopId: ctx.shopId },
    select: { id: true },
  })
  if (!invite) return errors.notFound('Access invite')

  await prismaV2.v2B2BAccessInvite.delete({ where: { id } })
  return noContent()
}
