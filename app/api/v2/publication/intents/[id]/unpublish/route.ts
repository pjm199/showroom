import { NextRequest } from 'next/server'
import { prismaV2 } from '@/lib/prisma-v2'
import { requireV2Auth } from '@/lib/v2/context'
import { requirePermission } from '@/lib/v2/permissions'
import { ok, errors } from '@/lib/v2/response'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'publication:write')
  if (perm) return perm

  const intent = await prismaV2.v2PublicationIntent.findFirst({
    where: { id, shopId: ctx.shopId },
  })
  if (!intent) return errors.notFound('Publication intent')

  const updated = await prismaV2.v2PublicationIntent.update({
    where: { id },
    data: {
      status: 'UNPUBLISHED',
      unpublishedAt: new Date(),
    },
    include: { target: true, audienceRule: true },
  })

  await prismaV2.v2PublishEvent.create({
    data: {
      shopId: ctx.shopId,
      entityType: intent.entityType as any,
      entityId: intent.entityId,
      action: 'UNPUBLISH',
      targetId: intent.targetId,
      actorId: ctx.userId,
    },
  })

  return ok(updated)
}
