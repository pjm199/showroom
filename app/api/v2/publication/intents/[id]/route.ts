import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prismaV2 } from '@/lib/prisma-v2'
import { requireV2Auth } from '@/lib/v2/context'
import { requirePermission } from '@/lib/v2/permissions'
import { ok, errors } from '@/lib/v2/response'

const updateIntentSchema = z.object({
  status: z.enum(['DRAFT', 'SCHEDULED', 'UNPUBLISHED']).optional(),
  scheduledAt: z.string().datetime().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  audienceRuleId: z.string().nullable().optional(),
})

async function getOwnedIntent(shopId: string, id: string) {
  return prismaV2.v2PublicationIntent.findFirst({
    where: { id, shopId },
    include: { target: true, audienceRule: true },
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'publication:write')
  if (perm) return perm

  const intent = await getOwnedIntent(ctx.shopId, id)
  if (!intent) return errors.notFound('Publication intent')

  const body = await request.json().catch(() => null)
  const parsed = updateIntentSchema.safeParse(body)
  if (!parsed.success) {
    return errors.validation('Invalid data', parsed.error.flatten())
  }

  const data = parsed.data
  const updated = await prismaV2.v2PublicationIntent.update({
    where: { id },
    data: {
      ...(data.status ? { status: data.status } : {}),
      ...(data.scheduledAt !== undefined
        ? { scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null }
        : {}),
      ...(data.expiresAt !== undefined
        ? { expiresAt: data.expiresAt ? new Date(data.expiresAt) : null }
        : {}),
      ...(data.audienceRuleId !== undefined
        ? { audienceRuleId: data.audienceRuleId }
        : {}),
    },
    include: { target: true, audienceRule: true },
  })

  return ok(updated)
}
