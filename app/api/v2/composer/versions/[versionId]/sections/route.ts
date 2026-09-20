import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prismaV2 } from '@/lib/prisma-v2'
import { requireV2Auth } from '@/lib/v2/context'
import { requirePermission } from '@/lib/v2/permissions'
import { ok, created, errors } from '@/lib/v2/response'

const createSectionSchema = z.object({
  sectionTypeId: z.string().min(1),
  label: z.string().max(100).optional(),
  config: z.record(z.unknown()).optional(),
  sortOrder: z.number().int().optional(),
  isEnabled: z.boolean().optional(),
})

const reorderSchema = z.object({
  orderedIds: z.array(z.string()),
})

async function getVersionWithPageCheck(ctx: { shopId: string }, versionId: string) {
  const version = await prismaV2.v2PageVersion.findFirst({
    where: { id: versionId },
    include: { page: { select: { shopId: true } } },
  })
  if (!version || version.page.shopId !== ctx.shopId) return null
  return version
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ versionId: string }> }
) {
  const { versionId } = await params
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'composer:write')
  if (perm) return perm

  const version = await getVersionWithPageCheck(ctx, versionId)
  if (!version) return errors.notFound('Page version')

  if (version.status !== 'DRAFT') return errors.versionNotDraft()

  // Handle reorder
  const url = new URL(request.url)
  if (url.pathname.endsWith('/reorder')) {
    const body = await request.json().catch(() => null)
    const parsed = reorderSchema.safeParse(body)
    if (!parsed.success) {
      return errors.validation('Invalid reorder data', parsed.error.flatten())
    }

    const updates = parsed.data.orderedIds.map((id, index) =>
      prismaV2.v2SectionInstance.updateMany({
        where: { id, pageVersionId: versionId },
        data: { sortOrder: index },
      })
    )
    await prismaV2.$transaction(updates)

    const sections = await prismaV2.v2SectionInstance.findMany({
      where: { pageVersionId: versionId },
      orderBy: { sortOrder: 'asc' },
      include: { bindings: true },
    })
    return ok(sections)
  }

  // Create section
  const body = await request.json().catch(() => null)
  const parsed = createSectionSchema.safeParse(body)
  if (!parsed.success) {
    return errors.validation('Invalid section data', parsed.error.flatten())
  }

  const sectionType = await prismaV2.v2SectionType.findFirst({
    where: { id: parsed.data.sectionTypeId, isActive: true },
    select: { id: true },
  })
  if (!sectionType) return errors.notFound('Section type')

  // Get next sort order
  const maxOrder = await prismaV2.v2SectionInstance.aggregate({
    where: { pageVersionId: versionId },
    _max: { sortOrder: true },
  })

  const section = await prismaV2.v2SectionInstance.create({
    data: {
      pageVersionId: versionId,
      sectionTypeId: parsed.data.sectionTypeId,
      label: parsed.data.label ?? null,
      config: parsed.data.config ?? {},
      isEnabled: parsed.data.isEnabled ?? true,
      sortOrder: parsed.data.sortOrder ?? (maxOrder._max.sortOrder ?? -1) + 1,
    },
    include: { bindings: true },
  })

  return created(section)
}
