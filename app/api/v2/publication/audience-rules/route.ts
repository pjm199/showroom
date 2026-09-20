import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prismaV2 } from '@/lib/prisma-v2'
import { requireV2Auth } from '@/lib/v2/context'
import { requirePermission } from '@/lib/v2/permissions'
import { ok, created, errors } from '@/lib/v2/response'
import { randomBytes } from 'crypto'

const createRuleSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['PUBLIC', 'B2B_ONLY', 'SEGMENT', 'PRIVATE_LINK']),
  segmentIds: z.array(z.string()).optional(),
})

export async function GET(_request: NextRequest) {
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'publication:read')
  if (perm) return perm

  const rules = await prismaV2.v2AudienceRule.findMany({
    where: { shopId: ctx.shopId },
    orderBy: { createdAt: 'asc' },
  })

  return ok(rules)
}

export async function POST(request: NextRequest) {
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'publication:write')
  if (perm) return perm

  const body = await request.json().catch(() => null)
  const parsed = createRuleSchema.safeParse(body)
  if (!parsed.success) {
    return errors.validation('Invalid audience rule data', parsed.error.flatten())
  }

  const data = parsed.data
  const accessToken =
    data.type === 'PRIVATE_LINK' ? randomBytes(24).toString('hex') : null

  const rule = await prismaV2.v2AudienceRule.create({
    data: {
      shopId: ctx.shopId,
      name: data.name,
      type: data.type,
      segmentIds: data.segmentIds ?? [],
      accessToken,
    },
  })

  return created(rule)
}
