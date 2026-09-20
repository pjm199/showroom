import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prismaV2 } from '@/lib/prisma-v2'
import { requireV2Auth } from '@/lib/v2/context'
import { requirePermission } from '@/lib/v2/permissions'
import { ok, created, errors } from '@/lib/v2/response'

const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
})

export async function GET() {
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'b2b:read')
  if (perm) return perm

  const groups = await prismaV2.v2CustomerGroup.findMany({
    where: { shopId: ctx.shopId },
    orderBy: { name: 'asc' },
  })

  return ok(groups)
}

export async function POST(request: NextRequest) {
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'b2b:write')
  if (perm) return perm

  const body = await request.json().catch(() => null)
  const parsed = createGroupSchema.safeParse(body)
  if (!parsed.success) {
    return errors.validation('Invalid group name', parsed.error.flatten())
  }

  const group = await prismaV2.v2CustomerGroup.create({
    data: { shopId: ctx.shopId, name: parsed.data.name },
  })

  return created(group)
}
