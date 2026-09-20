import { requireV2Auth } from '@/lib/v2/context'
import { requirePermission } from '@/lib/v2/permissions'
import { ok } from '@/lib/v2/response'
import { prismaV2 } from '@/lib/prisma-v2'

export async function GET() {
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'composer:read')
  if (perm) return perm

  const types = await prismaV2.v2SectionType.findMany({
    where: { isActive: true },
    orderBy: { id: 'asc' },
  })

  return ok(types)
}
