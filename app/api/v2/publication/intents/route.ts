import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prismaV2 } from '@/lib/prisma-v2'
import { requireV2Auth } from '@/lib/v2/context'
import { requirePermission } from '@/lib/v2/permissions'
import { ok, created, errors } from '@/lib/v2/response'

const createIntentSchema = z.object({
  entityType: z.enum(['PRODUCT', 'COLLECTION', 'PAGE']),
  entityId: z.string().min(1),
  targetId: z.string().min(1),
  status: z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED']).optional(),
  scheduledAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  audienceRuleId: z.string().nullable().optional(),
})

export async function GET(request: NextRequest) {
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'publication:read')
  if (perm) return perm

  const { searchParams } = request.nextUrl
  const entityType = searchParams.get('entityType') ?? undefined
  const entityId = searchParams.get('entityId') ?? undefined
  const targetId = searchParams.get('targetId') ?? undefined
  const status = searchParams.get('status') ?? undefined

  const intents = await prismaV2.v2PublicationIntent.findMany({
    where: {
      shopId: ctx.shopId,
      ...(entityType ? { entityType: entityType as any } : {}),
      ...(entityId ? { entityId } : {}),
      ...(targetId ? { targetId } : {}),
      ...(status ? { status: status as any } : {}),
    },
    include: {
      target: true,
      audienceRule: true,
    },
    orderBy: { updatedAt: 'desc' },
  })

  return ok(intents)
}

export async function POST(request: NextRequest) {
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'publication:write')
  if (perm) return perm

  const body = await request.json().catch(() => null)
  const parsed = createIntentSchema.safeParse(body)
  if (!parsed.success) {
    return errors.validation('Invalid publication intent data', parsed.error.flatten())
  }

  const data = parsed.data

  // Verify the target belongs to this shop
  const target = await prismaV2.v2PublicationTarget.findFirst({
    where: { id: data.targetId, shopId: ctx.shopId },
    select: { id: true },
  })
  if (!target) return errors.notFound('Publication target')

  const existing = await prismaV2.v2PublicationIntent.findUnique({
    where: {
      entityType_entityId_targetId: {
        entityType: data.entityType,
        entityId: data.entityId,
        targetId: data.targetId,
      },
    },
    select: { id: true },
  })
  if (existing) {
    return errors.conflict('A publication intent already exists for this entity and target')
  }

  const intent = await prismaV2.v2PublicationIntent.create({
    data: {
      shopId: ctx.shopId,
      entityType: data.entityType,
      entityId: data.entityId,
      targetId: data.targetId,
      status: data.status ?? 'DRAFT',
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      audienceRuleId: data.audienceRuleId ?? null,
      syncStatus: 'NOT_APPLICABLE',
    },
    include: { target: true, audienceRule: true },
  })

  return created(intent)
}
