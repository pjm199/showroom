import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prismaV2 } from '@/lib/prisma-v2'
import { requireV2Auth } from '@/lib/v2/context'
import { requirePermission } from '@/lib/v2/permissions'
import { ok, noContent, errors } from '@/lib/v2/response'

const updateSectionSchema = z.object({
  label: z.string().max(100).nullable().optional(),
  config: z.record(z.unknown()).optional(),
  isEnabled: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  audienceRuleId: z.string().nullable().optional(),
})

async function getOwnedSection(shopId: string, versionId: string, sectionId: string) {
  const section = await prismaV2.v2SectionInstance.findFirst({
    where: { id: sectionId, pageVersionId: versionId },
    include: {
      pageVersion: { include: { page: { select: { shopId: true } } } },
      bindings: true,
    },
  })
  if (!section || section.pageVersion.page.shopId !== shopId) return null
  return section
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ versionId: string; sectionId: string }> }
) {
  const { versionId, sectionId } = await params
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'composer:write')
  if (perm) return perm

  const section = await getOwnedSection(ctx.shopId, versionId, sectionId)
  if (!section) return errors.notFound('Section')

  if (section.pageVersion.status !== 'DRAFT') return errors.versionNotDraft()

  const body = await request.json().catch(() => null)
  const parsed = updateSectionSchema.safeParse(body)
  if (!parsed.success) {
    return errors.validation('Invalid section data', parsed.error.flatten())
  }

  const updated = await prismaV2.v2SectionInstance.update({
    where: { id: sectionId },
    data: parsed.data,
    include: { bindings: true },
  })

  return ok(updated)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ versionId: string; sectionId: string }> }
) {
  const { versionId, sectionId } = await params
  const ctx = await requireV2Auth()
  if (ctx instanceof Response) return ctx

  const perm = requirePermission(ctx.role, 'composer:write')
  if (perm) return perm

  const section = await getOwnedSection(ctx.shopId, versionId, sectionId)
  if (!section) return errors.notFound('Section')

  if (section.pageVersion.status !== 'DRAFT') return errors.versionNotDraft()

  await prismaV2.v2SectionInstance.delete({ where: { id: sectionId } })
  return noContent()
}
